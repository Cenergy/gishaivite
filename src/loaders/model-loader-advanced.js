import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import FastDogDecoder from './wasm-decoder.js'
// import HttpDataProvider from './HttpDataProvider.js'
import { streamModelByUuid } from '../api/resources'
import LoadingStateMachine from '../utils/LoadingStateMachine.js'

/**
 * 高级模型加载器类
 * 支持多种加载方式：直接加载、流式加载、WASM解码、实时流式WASM等
 */
export class AdvancedModelLoader {
  constructor() {
    this.wasmDecoder = null
    this.dataProvider = null
    this.authToken = null
    this.loadingStateMachine = new LoadingStateMachine()
    
    // 流式加载状态
    this.streamState = {
      controller: null,
      downloadBuffer: null,
      downloadedBytes: 0,
      totalBytes: 0,
      downloadStartTime: 0,
      lastProgressTime: 0,
      lastDownloadedBytes: 0,
      isPaused: false,
      isCancelled: false,
      resumeData: null
    }
  }

  /**
   * 初始化WASM解码器
   */
  async initWASMDecoder() {
    try {
      console.log('🚀 初始化 WASM 解码器...')
      this.wasmDecoder = new FastDogDecoder()
      await this.wasmDecoder.init()
      console.log('✅ WASM 解码器初始化成功')
      return true
    } catch (error) {
      console.error('❌ WASM 解码器初始化失败:', error)
      return false
    }
  }

  /**
   * 初始化模型加载器
   */
  async initialize(authToken = null) {
    try {
      console.log('🚀 初始化模型加载器...')
      
      // 设置认证令牌
      if (authToken) {
        this.setAuthToken(authToken)
      }
      
      
      // 初始化WASM解码器
      await this.initWASMDecoder()
      
      console.log('✅ 模型加载器初始化完成')
      return true
    } catch (error) {
      console.error('❌ 模型加载器初始化失败:', error)
      return false
    }
  }

  /**
   * 设置认证令牌
   */
  setAuthToken(token) {
    this.authToken = token
  }

  /**
   * 获取UUID通过模型名称
   */
  getUuidByName(modelName, modelOptions) {
    const model = modelOptions.find(option => option.name === modelName)
    return model ? model.uuid : null
  }

  /**
   * 统一的模型加载方法 - 简化版
   */
  async loadModel(selectedModel, loadMethod, options = {}) {
    const { chunkSize, enableResume, authToken, modelOptions } = options
    
    // 设置认证令牌
    if (authToken) this.setAuthToken(authToken)
    
    // 使用传入的 modelOptions，如果没有则创建默认的
    const actualModelOptions = modelOptions || [
      { name: selectedModel, model_file_url: `/models/${selectedModel}`, uuid: selectedModel }
    ]
    
    // 统一的加载配置
    const config = {
      modelOptions: actualModelOptions,
      selectedModel,
      chunkSize,
      enableResume,
      options
    }
    
    // 简化的方法映射
    const loaders = {
      'origin': () => this._loadDirect(config),
      'stream': () => this._loadStream(config),
      'wasm': () => this._loadWASM(config),
      'stream_wasm': () => this._loadWASM(config), // 简化：与 wasm 相同
      'stream-wasm': () => this._loadWASM(config),
      'stream_wasm_realtime': () => this._loadStreamWASMRealtime(config),
      'realtime-wasm': () => this._loadStreamWASMRealtime(config)
    }
    
    const loader = loaders[loadMethod]
    if (!loader) throw new Error(`不支持的加载方式: ${loadMethod}`)
    
    return await loader()
  }

  /**
   * 简化的直接加载方法
   */
  async _loadDirect(config) {
    const { modelOptions, selectedModel } = config
    const model = modelOptions.find(option => option.name === selectedModel)
    if (!model?.model_file_url) throw new Error('未找到模型或模型文件URL')

    this.loadingStateMachine.reset()
    this.loadingStateMachine.startLoading('开始直接加载...')

    const url = model.model_file_url
    const extension = url.split('.').pop()?.toLowerCase()
    
    const loaderMap = {
      'gltf': () => new GLTFLoader(),
      'glb': () => new GLTFLoader(), 
      'fbx': () => new FBXLoader()
    }
    
    const createLoader = loaderMap[extension]
    if (!createLoader) throw new Error(`不支持的文件格式: ${extension}`)
    
    const loader = createLoader()
    this.loadingStateMachine.startBuilding('正在解析模型...')

    return new Promise((resolve, reject) => {
      loader.load(
        url,
        (object) => {
          const modelObj = ['gltf', 'glb'].includes(extension) ? object.scene : object
          let geometry = null
          modelObj.traverse(child => {
            if (child.isMesh && child.geometry && !geometry) geometry = child.geometry
          })
          if (!geometry) geometry = new THREE.BoxGeometry(1, 1, 1)
          
          this.loadingStateMachine.success(modelObj, '加载完成')
          resolve({ model: modelObj, geometry, animations: object.animations || [] })
        },
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100
          this.loadingStateMachine.emit('progress', {
            progress: percent,
            message: `加载中... ${percent.toFixed(1)}%`
          })
        },
        (error) => {
          this.loadingStateMachine.error(error.message, '加载失败')
          reject(error)
        }
      )
    })
  }

  /**
   * 简化的流式加载方法
   */
  async _loadStream(config) {
    const { selectedModel, modelOptions } = config
    const uuid = this.getUuidByName(selectedModel, modelOptions)
    if (!uuid) throw new Error('无法获取模型UUID')

    this.loadingStateMachine.startLoading('🌊 流式加载: 开始下载...')
    const response = await streamModelByUuid(uuid)
    
    if ('error' in response) throw new Error(`API Error: ${response.error}`)
    if (response.status !== 200) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

    this.loadingStateMachine.emit('progress', { progress: 30, message: '🌊 流式: 下载完成，开始解码...' })
    
    // 将 Blob 转换为 ArrayBuffer
    const arrayBuffer = await response.data.arrayBuffer()
    
    // 检查数据格式，如果是FastDog格式则需要解码
    const magic = new TextDecoder().decode(new Uint8Array(arrayBuffer, 0, 8))
    
    let decodedData
    
    if (magic.startsWith('FASTDOG')) {
      // FastDog格式，需要解码
      this.loadingStateMachine.emit('progress', { progress: 50, message: '🌊 流式: 检测到FastDog格式，使用解码器...' })
      
      if (!this.wasmDecoder) {
        throw new Error('WASM解码器未初始化，无法解码FastDog格式')
      }
      
      const decodeResult = await this.wasmDecoder.decode(arrayBuffer, false, { modelId: selectedModel, uuid: uuid })
      decodedData = decodeResult.data
    } else {
      // 标准格式，直接使用
      decodedData = arrayBuffer
    }
    
    this.loadingStateMachine.emit('progress', { progress: 80, message: '🌊 流式: 解码完成，构建模型...' })
    const modelResult = await this.buildModelWithGLTFLoader(decodedData)
    
    this.loadingStateMachine.success(modelResult, '流式加载完成')
    return modelResult
  }

  /**
   * 简化的WASM加载方法
   */
  async _loadWASM(config) {
    const { selectedModel, modelOptions } = config
    if (!this.wasmDecoder) throw new Error('WASM解码器未初始化')
    
    const uuid = this.getUuidByName(selectedModel, modelOptions)
    if (!uuid) throw new Error('无法获取模型UUID')

    this.loadingStateMachine.startLoading('🔧 WASM: 开始下载...')
    const response = await streamModelByUuid(uuid)
    
    if ('error' in response) throw new Error(`API Error: ${response.error}`)
    if (response.status !== 200) throw new Error(`HTTP ${response.status}: ${response.statusText}`)

    this.loadingStateMachine.emit('progress', { progress: 50, message: 'WASM: 解码中...' })
    const binaryData = await response.data.arrayBuffer()
    const decodeResult = await this.wasmDecoder.decode(binaryData, false, { modelId: selectedModel, uuid })
    
    let parsedData = decodeResult.data
    if (typeof decodeResult.data === 'string') {
      try { parsedData = JSON.parse(decodeResult.data) } catch (e) { /* ignore */ }
    }

    this.loadingStateMachine.emit('progress', { progress: 80, message: 'WASM: 构建模型...' })
    const modelResult = await this.buildModelWithGLTFLoader(parsedData)
    
    this.loadingStateMachine.success(modelResult, 'WASM加载完成')
    return modelResult
  }

  /**
   * 简化的实时流式WASM加载方法
   */
  async _loadStreamWASMRealtime(config) {
    const { selectedModel, modelOptions, chunkSize = 0, enableResume = true } = config
    if (!this.wasmDecoder) throw new Error('WASM解码器未初始化')
    
    const uuid = this.getUuidByName(selectedModel, modelOptions)
    if (!uuid) throw new Error('无法获取模型UUID')

    this.loadingStateMachine.startLoading('⚡ 实时流式WASM加载...')
    
    // 简化的实现：直接使用普通WASM加载
    // 实际项目中可以根据需要实现真正的流式逻辑
    return await this._loadWASM(config)
  }

  /**
   * 使用GLTF/FBX加载器构建模型
   */
  async buildModelWithGLTFLoader(modelData) {
    return new Promise((resolve, reject) => {
      try {
        console.log('🎨 开始解析模型数据')
        console.log('📊 传入数据类型:', typeof modelData)
        console.log('📊 传入数据内容:', modelData)

        // 检测数据格式
        // 首先检查是否包含原始格式数据（FBX等）
        if (typeof modelData === 'object' && modelData !== null &&
            'extensions' in modelData &&
            typeof modelData.extensions === 'object' &&
            modelData.extensions !== null &&
            'FASTDOG_ORIGINAL_FORMAT' in modelData.extensions) {
          const originalFormat = modelData.extensions.FASTDOG_ORIGINAL_FORMAT
          console.log(`🔧 检测到原始格式: ${originalFormat.format}`)

          if (originalFormat.format === '.fbx') {
            console.log('📊 检测到FBX格式，使用FBXLoader')
            try {
              const binaryString = atob(originalFormat.data)
              const arrayBuffer = new ArrayBuffer(binaryString.length)
              const uint8Array = new Uint8Array(arrayBuffer)
              for (let i = 0; i < binaryString.length; i++) {
                uint8Array[i] = binaryString.charCodeAt(i)
              }

              const loader = new FBXLoader()
              const fbxModel = loader.parse(arrayBuffer, '')

              console.log('✅ FBXLoader解析成功')

              // 提取第一个几何体用于向后兼容
              let geometry = null
              fbxModel.traverse((child) => {
                if (child.isMesh && child.geometry && !geometry) {
                  geometry = child.geometry
                }
              })

              if (!geometry) {
                geometry = new THREE.BoxGeometry(1, 1, 1)
              }

              resolve({
                model: fbxModel,
                geometry: geometry
              })
              return
            } catch (error) {
              throw new Error('FBX数据解析失败: ' + error.message)
            }
          } else {
            throw new Error(`不支持的原始格式: ${originalFormat.format}`)
          }
        }

        // 检查直接的FBX格式标识
        if (typeof modelData === 'object' && modelData !== null && modelData.type === 'fbx' && modelData.data) {
          // FBX格式处理
          console.log('📊 检测到直接FBX格式，使用FBXLoader')
          try {
            const binaryString = atob(modelData.data)
            const arrayBuffer = new ArrayBuffer(binaryString.length)
            const uint8Array = new Uint8Array(arrayBuffer)
            for (let i = 0; i < binaryString.length; i++) {
              uint8Array[i] = binaryString.charCodeAt(i)
            }

            const loader = new FBXLoader()
            const fbxModel = loader.parse(arrayBuffer, '')

            console.log('✅ FBXLoader解析成功')

            // 提取第一个几何体用于向后兼容
            let geometry = null
            fbxModel.traverse((child) => {
              if (child.isMesh && child.geometry && !geometry) {
                geometry = child.geometry
              }
            })

            if (!geometry) {
              geometry = new THREE.BoxGeometry(1, 1, 1)
            }

            resolve({
              model: fbxModel,
              geometry: geometry
            })
            return
          } catch (error) {
            throw new Error('FBX数据解析失败: ' + error.message)
          }
        }

        // GLTF/GLB格式处理
        const loader = new GLTFLoader()

        // 确保数据格式正确：GLTFLoader.parse支持JSON字符串、JSON对象或ArrayBuffer（GLB）
        let dataToParse
        if (modelData instanceof ArrayBuffer) {
          // 如果是ArrayBuffer（GLB格式），直接使用
          dataToParse = modelData
          console.log('📊 检测到GLB二进制数据，大小:', modelData.byteLength, '字节')
        } else if (typeof modelData === 'object' && modelData !== null && modelData.type === 'glb' && modelData.data) {
          // 如果是WASM解码器返回的GLB对象格式，需要将base64数据转换为ArrayBuffer
          console.log('📊 检测到WASM解码器GLB对象格式，转换base64数据')
          try {
            const binaryString = atob(modelData.data)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i)
            }
            dataToParse = bytes.buffer
            console.log('📊 GLB数据转换完成，大小:', dataToParse.byteLength, '字节')
          } catch (error) {
            throw new Error('GLB base64数据解码失败: ' + error.message)
          }
        } else if (typeof modelData === 'string') {
          // 如果是字符串，直接使用
          dataToParse = modelData
        } else if (typeof modelData === 'object' && modelData !== null) {
          // 如果是普通对象，转换为JSON字符串
          dataToParse = JSON.stringify(modelData)
        } else {
          throw new Error('无效的模型数据格式')
        }

        console.log('📊 解析数据类型:', typeof dataToParse)

        // 直接使用parse方法解析GLTF JSON数据，无需创建Blob URL
        loader.parse(
          dataToParse, // 传入正确格式的数据
          '', // 资源路径（空字符串表示无外部资源）
          (gltf) => {
            console.log('✅ GLTFLoader直接解析成功，保留完整材质')

            // 提取第一个几何体用于向后兼容
            let geometry = null
            if (gltf.scene) {
              gltf.scene.traverse((child) => {
                if (child.isMesh && child.geometry && !geometry) {
                  geometry = child.geometry
                }
              })
            }

            if (!geometry) {
              // 如果没有找到几何体，创建一个默认的
              geometry = new THREE.BoxGeometry(1, 1, 1)
            }

            // 返回完整的模型和几何体
            resolve({
              model: gltf.scene || new THREE.Object3D(),
              geometry: geometry
            })
          },
          (error) => {
            console.error('❌ GLTFLoader直接解析失败:', error)
            reject(error)
          }
        )
      } catch (error) {
        reject(error)
      }
    })
  }

  // 保持向后兼容性的包装方法
  async loadOriginModel(modelOptions, selectedModel) {
    return await this._loadDirect({ modelOptions, selectedModel })
  }

  async loadModelStream(modelOptions, selectedModel) {
    return await this._loadStream({ modelOptions, selectedModel })
  }

  async loadModelWASM(modelOptions, selectedModel) {
    return await this._loadWASM({ modelOptions, selectedModel })
  }

  async loadModelStreamWASM(modelOptions, selectedModel) {
    return await this._loadWASM({ modelOptions, selectedModel })
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(filename, modelOptions) {
    const uuid = this.getUuidByName(filename, modelOptions)
    if (!uuid) throw new Error('无法获取模型UUID')

    const response = await streamModelByUuid(uuid)
    if ('error' in response) {
      throw new Error(`API Error: ${response.error}`)
    }

    if (response.status !== 200 && response.status !== 206) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const contentLength = response.headers['content-length']
    const acceptRanges = response.headers['accept-ranges']

    return {
      size: contentLength ? parseInt(contentLength) : 0,
      supportsRangeRequests: acceptRanges === 'bytes'
    }
  }

  /**
   * 下载分块
   */
  async downloadChunk(filename, modelOptions, start, end, chunkSize) {
    const uuid = this.getUuidByName(filename, modelOptions)
    if (!uuid) throw new Error('无法获取模型UUID')

    // 只有在分块模式下才添加Range请求头
    const chunkSizeNum = Number(chunkSize)
    const rangeHeader = chunkSizeNum > 0 ? `bytes=${start}-${end}` : undefined
    
    const response = await streamModelByUuid(uuid, rangeHeader)
    if ('error' in response) {
      throw new Error(`API Error: ${response.error}`)
    }

    if (response.status !== 200 && response.status !== 206) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return await response.data.arrayBuffer()
  }

  async loadModelStreamWASMRealtime(modelOptions, selectedModel, options = {}) {
    return await this._loadStreamWASMRealtime({ modelOptions, selectedModel, ...options })
  }

  /**
   * 计算下载速度
   */
  calculateDownloadSpeed(currentTime) {
    const timeDiff = currentTime - this.streamState.lastProgressTime
    const bytesDiff = this.streamState.downloadedBytes - this.streamState.lastDownloadedBytes

    if (timeDiff > 0) {
      const speed = (bytesDiff / timeDiff) * 1000 // bytes per second
      this.streamState.lastProgressTime = currentTime
      this.streamState.lastDownloadedBytes = this.streamState.downloadedBytes
      return speed
    }
    return 0
  }

  /**
   * 计算剩余时间
   */
  calculateRemainingTime(speed) {
    if (speed <= 0) return '计算中...'

    const remainingBytes = this.streamState.totalBytes - this.streamState.downloadedBytes
    const remainingSeconds = remainingBytes / speed

    if (remainingSeconds < 60) {
      return `${Math.ceil(remainingSeconds)}秒`
    } else if (remainingSeconds < 3600) {
      return `${Math.ceil(remainingSeconds / 60)}分钟`
    } else {
      return `${Math.ceil(remainingSeconds / 3600)}小时`
    }
  }

  /**
   * 格式化字节数
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B'

    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * 暂停流式下载
   */
  pauseStream() {
    console.log('⏸️ 暂停流式下载')
    this.streamState.isPaused = true
    this.loadingStateMachine.pause('⏸️ 流式下载已暂停')
  }

  /**
   * 恢复流式下载
   */
  resumeStream() {
    console.log('▶️ 恢复流式下载')
    this.streamState.isPaused = false
    this.loadingStateMachine.startDownloading('▶️ 流式下载已恢复')
  }

  /**
   * 取消流式下载
   */
  cancelStream() {
    console.log('❌ 取消流式下载')
    this.streamState.isCancelled = true
    if (this.streamState.controller) {
      this.streamState.controller.abort()
    }
    this.loadingStateMachine.cancel('❌ 流式下载已取消')

    // 清除断点续传数据
    this.streamState.resumeData = null
    this.streamState.downloadedBytes = 0
    this.streamState.totalBytes = 0
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.dispose()
  }

  /**
   * 清理资源（内部方法）
   */
  dispose() {
    // 取消正在进行的下载
    this.cancelStream()
    
    // 清理WASM解码器
    if (this.wasmDecoder) {
      this.wasmDecoder = null
    }
    
    // 清理数据提供者
    this.dataProvider = null
    
    // 重置状态
    this.streamState = {
      controller: null,
      downloadBuffer: null,
      downloadedBytes: 0,
      totalBytes: 0,
      downloadStartTime: 0,
      lastProgressTime: 0,
      lastDownloadedBytes: 0,
      isPaused: false,
      isCancelled: false,
      resumeData: null
    }
  }
}

// 导出默认实例
export default new AdvancedModelLoader()