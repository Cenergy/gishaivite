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

  getSelectedModel(modelOptions, selectedModel) {
    const model = modelOptions.find(option => option.name === selectedModel)
    return model
  }

  /**
   * 统一的模型加载方法
   */
  async loadModel(selectedModel, loadMethod, options = {}) {
    console.log("🚀 ~ AdvancedModelLoader ~ loadModel ~ selectedModel:", selectedModel);
    const { chunkSize, enableResume, authToken, modelOptions } = options
    const model = this.getSelectedModel(modelOptions, selectedModel)
    
    // 设置认证令牌
    if (authToken) {
      this.setAuthToken(authToken)
    }
    
    // 使用传入的 modelOptions，如果没有则创建默认的
    const actualModelOptions = modelOptions || [
      { name: selectedModel, model_file_url: `/models/${selectedModel}`, uuid: selectedModel }
    ]
    
    switch (loadMethod) {
       case 'origin':
         return await this.loadOriginModel(model, selectedModel)
       case 'stream':
         return await this.loadModelStream(model, selectedModel)
       case 'wasm':
         return await this.loadModelWASM(model, selectedModel)
       case 'stream_wasm':
       case 'stream-wasm':
         return await this.loadModelStreamWASM(model, selectedModel)
       case 'stream_wasm_realtime':
       case 'realtime-wasm':
         return await this.loadModelStreamWASMRealtime({
           model,
           chunkSize,
           enableResume
         })
       default:
         throw new Error(`不支持的加载方式: ${loadMethod}`)
     }
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

  /**
   * 直接加载模型（不使用WASM）
   */
  async loadOriginModel(model) {
    if (!model || !model.model_file_url) {
      throw new Error('未找到模型或模型文件URL')
    }

    // 重置状态机并开始加载
    this.loadingStateMachine.reset()
    this.loadingStateMachine.startLoading('开始直接加载...')

    try {
      const url = model.model_file_url

      // 根据文件扩展名选择加载器
      const extension = url.split('.').pop()?.toLowerCase()
      let loader

      if (extension === 'gltf' || extension === 'glb') {
        loader = new GLTFLoader()
      } else if (extension === 'fbx') {
        loader = new FBXLoader()
      } else {
        throw new Error(`不支持的文件格式: ${extension}`)
      }

      this.loadingStateMachine.startBuilding('正在解析模型...')

      return new Promise((resolve, reject) => {
        loader.load(
          url,
          (object) => {
            // 获取模型对象
            const modelObj = extension === 'gltf' || extension === 'glb' ? object.scene : object
            
            // 提取几何体
            let geometry = null
            modelObj.traverse((child) => {
              if (child.isMesh && child.geometry && !geometry) {
                geometry = child.geometry
              }
            })

            if (!geometry) {
              geometry = new THREE.BoxGeometry(1, 1, 1)
            }

            this.loadingStateMachine.success(modelObj, '加载完成')
            
            resolve({
              model: modelObj,
              geometry: geometry,
              animations: object.animations || []
            })
          },
          (progress) => {
            const percent = (progress.loaded / progress.total) * 100
            this.loadingStateMachine.emit('progress', {
              progress: percent,
              message: `加载中... ${percent.toFixed(1)}%`
            })
          },
          (error) => {
            console.error('模型加载失败:', error)
            this.loadingStateMachine.error(error.message, '加载失败')
            reject(error)
          }
        )
      })
    } catch (error) {
      console.error('加载失败:', error)
      this.loadingStateMachine.error(error.message, '加载失败')
      throw error
    }
  }

  /**
   * 流式加载模型
   */
  async loadModelStream(model) {
    console.log('🌊 开始流式加载...')
    const {uuid} =model
    if (!uuid) throw new Error('无法获取模型UUID')

    const startTime = Date.now()
    this.loadingStateMachine.startLoading('🌊 流式加载: 开始下载...')

    try {
      const response = await streamModelByUuid(uuid)
      if ('error' in response) {
        throw new Error(`API Error: ${response.error}`)
      }

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      this.loadingStateMachine.emit('progress', {
        progress: 30,
        message: '🌊 流式: 下载完成，开始解码...'
      })

      const arrayBuffer = await response.data.arrayBuffer()
      const downloadTime = Date.now() - startTime

      // 检查数据格式，如果是FastDog格式则需要解码
      const magic = new TextDecoder().decode(new Uint8Array(arrayBuffer, 0, 8))

      let decodedData
      let decodeTime = 0

      if (magic.startsWith('FASTDOG')) {
        // FastDog格式，需要解码
        this.loadingStateMachine.emit('progress', {
          progress: 50,
          message: '🌊 流式: 检测到FastDog格式，使用解码器...'
        })

        if (!this.wasmDecoder) {
          throw new Error('WASM解码器未初始化，无法解码FastDog格式')
        }

        const decodeStartTime = Date.now()
        const decodeResult = await this.wasmDecoder.decode(arrayBuffer, false, { modelId: uuid, uuid: uuid })
        decodeTime = Date.now() - decodeStartTime
        decodedData = decodeResult.data
      } else {
        // 标准格式，直接使用
        decodedData = arrayBuffer
      }

      this.loadingStateMachine.emit('progress', {
        progress: 80,
        message: '🌊 流式: 解码完成，构建模型...'
      })

      // 使用buildModelWithGLTFLoader构建模型
      const modelResult = await this.buildModelWithGLTFLoader(decodedData)
      const endTime = Date.now()

      const result = {
        model: modelResult.model,
        geometry: modelResult.geometry,
        performanceStats: {
          totalTime: endTime - startTime,
          downloadTime: downloadTime,
          decodeTime: decodeTime
        }
      }
      
      this.loadingStateMachine.success(result, '流式加载完成')
      return result
    } catch (error) {
      console.error('流式加载失败:', error)
      this.loadingStateMachine.error(error.message, '流式加载失败')
      throw error
    }
  }

  /**
   * WASM解码加载模型
   */
  async loadModelWASM(model) {
    console.log('🔧 开始WASM解码加载...')

    // 检查WASM解码器是否已初始化
    if (!this.wasmDecoder) {
      throw new Error('WASM解码器未初始化，请先初始化WASM解码器')
    }

    const {uuid} = model
    if (!uuid) throw new Error('无法获取模型UUID')

    const startTime = Date.now()
    this.loadingStateMachine.startLoading('🔧 WASM: 开始下载二进制数据...')

    try {
      const response = await streamModelByUuid(uuid)
      if ('error' in response) {
        throw new Error(`API Error: ${response.error}`)
      }

      if (response.status !== 200) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      this.loadingStateMachine.emit('progress', {
        progress: 30,
        message: 'WASM: 下载完成，开始解码...'
      })

      const binaryData = await response.data.arrayBuffer()
      const downloadTime = Date.now() - startTime

      this.loadingStateMachine.emit('progress', {
        progress: 50,
        message: 'WASM: 使用 WASM 解码中...'
      })

      const decodeStartTime = Date.now()
      // 传入模型标识符以避免缓存冲突
      const decodeResult = await this.wasmDecoder.decode(binaryData, false, { modelId: uuid, uuid: uuid })
      const decodeTime = Date.now() - decodeStartTime

      this.loadingStateMachine.emit('progress', {
        progress: 80,
        message: 'WASM: 解码完成，构建模型...'
      })

      // 解析解码结果
      let parsedData = decodeResult.data
      if (typeof decodeResult.data === 'string') {
        try {
          parsedData = JSON.parse(decodeResult.data)
        } catch (e) {
          console.warn('⚠️ 无法解析为JSON:', e)
        }
      }

      // 使用buildModelWithGLTFLoader构建模型
      const modelResult = await this.buildModelWithGLTFLoader(parsedData)
      const endTime = Date.now()

      const result = {
        model: modelResult.model,
        geometry: modelResult.geometry,
        performanceStats: {
          totalTime: endTime - startTime,
          downloadTime: downloadTime,
          decodeTime: decodeTime
        }
      }
      
      this.loadingStateMachine.success(result, 'WASM加载完成')
      return result
    } catch (error) {
      console.error('WASM 模型加载失败:', error)
      this.loadingStateMachine.error(error.message, 'WASM加载失败')
      throw error
    }
  }

  /**
   * 流式WASM加载模型
   */
  async loadModelStreamWASM(model) {
    console.log('🌊🔧 开始流式WASM加载...')
    // 暂时使用普通WASM加载，后续可以实现真正的流式功能
    return await this.loadModelWASM(model)
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(model) {
    const {uuid} = model;
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
  async downloadChunk(model, start, end, chunkSize) {
    const {uuid} =model;
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

  /**
   * 实时流式WASM加载模型
   */
  async loadModelStreamWASMRealtime(options = {}) {
    console.log('⚡ 开始实时流式WASM加载...')

    if (!this.wasmDecoder) {
      this.loadingStateMachine.error('WASM 解码器未初始化')
      throw new Error('WASM 解码器未初始化')
    }
    const {model={}}=options;

    const {uuid,name} = model
    if (!uuid) {
      this.loadingStateMachine.error('无法获取模型UUID')
      throw new Error('无法获取模型UUID')
    }

    const {
      chunkSize = 0,
      enableResume = true,
      onProgress = () => {},
      onStreamInfo = () => {}
    } = options

    // 使用状态机开始加载
    this.loadingStateMachine.startLoading('⚡ 开始实时流式WASM加载...')

    const startTime = Date.now()
    this.streamState.downloadStartTime = startTime
    this.streamState.lastProgressTime = startTime
    this.streamState.lastDownloadedBytes = 0
    this.streamState.isPaused = false
    this.streamState.isCancelled = false
    this.streamState.controller = new AbortController()

    // 创建流式解码器实例
    const StreamDecoderClass = this.wasmDecoder.getStreamDecoder()
    if (!StreamDecoderClass) {
      const errorMsg = 'StreamDecoder 不可用，可能是因为使用了 JavaScript 备选模式'
      this.loadingStateMachine.error(errorMsg)
      throw new Error(errorMsg)
    }
    const streamDecoder = new StreamDecoderClass()

    try {
      this.loadingStateMachine.emit('progress', {
        progress: 5,
        message: '⚡ 实时流式WASM: 获取文件信息...'
      })

      // 获取文件大小和支持的范围请求
      const fileInfo = await this.getFileInfo(model)
      this.streamState.totalBytes = fileInfo.size

      onStreamInfo(0, this.streamState.totalBytes, 0, '计算中...', 0, 0)
      this.loadingStateMachine.startDownloading('⚡ 实时流式WASM: 开始边下载边解码...')
      this.loadingStateMachine.emit('progress', {
        progress: 10,
        message: '⚡ 实时流式WASM: 开始边下载边解码...'
      })

      // 检查是否有断点续传数据
      let startByte = 0
      if (enableResume && this.streamState.resumeData && this.streamState.resumeData.filename === name) {
        startByte = this.streamState.resumeData.downloadedBytes
        this.streamState.downloadedBytes = startByte
        console.log(`📥 断点续传: 从字节 ${startByte} 开始下载`)
      }

      // 边下载边解码的流式处理
      let currentByte = startByte
      let chunkIndex, totalChunks

      // 处理不分块的情况
      const chunkSizeNum = Number(chunkSize)
      if (chunkSizeNum === 0) {
        chunkIndex = 0
        totalChunks = 1
      } else {
        chunkIndex = Math.floor(startByte / chunkSizeNum)
        totalChunks = Math.ceil(this.streamState.totalBytes / chunkSizeNum)
      }

      let decodeResult = null
      let isDecodeComplete = false

      while (currentByte < this.streamState.totalBytes && !this.streamState.isCancelled && !isDecodeComplete) {
        // 检查是否暂停
        while (this.streamState.isPaused && !this.streamState.isCancelled) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        if (this.streamState.isCancelled) break

        // 计算结束字节位置
        let endByte
        if (chunkSizeNum === 0) {
          // 不分块：下载整个文件
          endByte = this.streamState.totalBytes - 1
        } else {
          // 分块下载
          endByte = Math.min(currentByte + chunkSizeNum - 1, this.streamState.totalBytes - 1)
        }

        try {
          // 下载单个分块
          const chunkStartTime = performance.now()
          const chunk = await this.downloadChunk(model, currentByte, endByte, chunkSize)
          const chunkDownloadTime = performance.now() - chunkStartTime

          // 🔥 关键区别：立即将分块送入流式解码器进行边下载边解码
          const decodeStartTime = performance.now()
          const streamResult = streamDecoder.add_chunk(new Uint8Array(chunk))
          const chunkDecodeTime = performance.now() - decodeStartTime

          console.log(`📦 分块 ${chunkIndex}: 下载耗时 ${chunkDownloadTime.toFixed(1)}ms, 解码耗时 ${chunkDecodeTime.toFixed(1)}ms, 解码进度 ${(streamResult.progress * 100).toFixed(1)}%`)

          currentByte = endByte + 1
          this.streamState.downloadedBytes = currentByte
          chunkIndex++

          // 更新进度 - 下载进度占50%，解码进度占40%
          const downloadProgress = (this.streamState.downloadedBytes / this.streamState.totalBytes) * 50
          const decodeProgress = streamResult.progress * 40
          const totalProgress = 10 + downloadProgress + decodeProgress

          const currentTime = performance.now()
          const speed = this.calculateDownloadSpeed(currentTime)
          const remainingTimeText = this.calculateRemainingTime(speed)

          // 添加请求间隔延迟以避免触发限流
          if (currentByte < this.streamState.totalBytes) {
            await new Promise(resolve => setTimeout(resolve, 50)) // 50ms延迟
          }

          // 更新UI显示
          if (streamResult.is_complete) {
            this.loadingStateMachine.startBuilding('⚡ 实时流式WASM: 解码完成，构建模型...')
            this.loadingStateMachine.emit('progress', {
              progress: 90,
              message: '⚡ 实时流式WASM: 解码完成，构建模型...'
            })
            decodeResult = streamResult
            isDecodeComplete = true

            console.log('🎉 流式解码完成!', {
              chunks_processed: streamResult.chunks_processed,
              total_received: streamResult.total_received,
              final_progress: streamResult.progress
            })
          } else {
            this.loadingStateMachine.emit('progress', {
              progress: totalProgress,
              message: `⚡ 实时流式WASM: 下载并解码中... ${this.formatBytes(this.streamState.downloadedBytes)}/${this.formatBytes(this.streamState.totalBytes)} (解码进度: ${(streamResult.progress * 100).toFixed(1)}%)`
            })
          }

          onStreamInfo(
            this.streamState.downloadedBytes,
            this.streamState.totalBytes,
            speed,
            remainingTimeText,
            chunkIndex,
            totalChunks
          )

          onProgress(totalProgress, `⚡ 实时流式WASM: 下载并解码中... ${this.formatBytes(this.streamState.downloadedBytes)}/${this.formatBytes(this.streamState.totalBytes)}`)

          // 保存断点续传数据
          if (enableResume) {
            this.streamState.resumeData = {
              filename: name,
              downloadedBytes: this.streamState.downloadedBytes,
              totalBytes: this.streamState.totalBytes,
              timestamp: Date.now()
            }
          }

          // 检查解码错误
          if (!streamResult.success && streamResult.error) {
            throw new Error(`流式解码失败: ${streamResult.error}`)
          }

        } catch (error) {
          console.error(`下载分块 ${chunkIndex} 失败:`, error)
          // 重试机制
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
      }

      if (this.streamState.isCancelled) {
        throw new Error('下载已取消')
      }

      if (!isDecodeComplete || !decodeResult) {
        throw new Error('流式解码未完成')
      }

      // 解析数据
      let parsedData = decodeResult.data
      if (typeof decodeResult.data === 'string') {
        try {
          parsedData = JSON.parse(decodeResult.data)
        } catch (e) {
          console.warn('⚠️ 无法解析为JSON:', e)
        }
      }

      // 构建模型
      const modelResult = await this.buildModelWithGLTFLoader(parsedData || decodeResult.data)
      const totalTime = Date.now() - startTime

      // 清除断点续传数据
      this.streamState.resumeData = null

      const stats = decodeResult.stats || {
        originalSize: this.streamState.totalBytes,
        compressedSize: this.streamState.totalBytes,
        compressionRatio: 1.0,
        wasmDecodeTime: totalTime * 0.4
      }

      const averageSpeed = this.streamState.totalBytes / (totalTime / 1000) // bytes per second

      const result = {
        model: modelResult.model,
        geometry: modelResult.geometry,
        performanceStats: {
          totalTime: totalTime,
          downloadTime: totalTime * 0.6, // 估算下载时间
          decodeTime: totalTime * 0.4,   // 估算解码时间
          chunksCount: chunkIndex,
          chunkSize: chunkSize,
          compressionRatio: (stats.compressionRatio * 100).toFixed(1),
          originalSize: stats.originalSize,
          compressedSize: stats.compressedSize,
          averageSpeed: averageSpeed,
          wasmDecodeTime: (stats.wasmDecodeTime || totalTime * 0.4).toFixed(2),
          streamingEnabled: true
        }
      }

      this.loadingStateMachine.success(result, '实时流式WASM加载完成')
      return result

    } catch (error) {
      console.error('实时流式WASM 模型加载失败:', error)
      this.loadingStateMachine.error(error.message, '实时流式WASM 模型加载失败')
      throw error
    } finally {
      // 清理流式解码器
      if (streamDecoder) {
        streamDecoder.free()
      }
    }
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