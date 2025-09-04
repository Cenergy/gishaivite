import * as resources from '@/api/resources'

/**
 * 模型下载器类
 * 专门负责处理模型文件的下载，支持流式下载、分块下载、断点续传等功能
 */
export class ModelDownloader {
  constructor() {
    this.authToken = null
    
    // 下载状态
    this.downloadState = {
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
   * 设置认证令牌
   */
  setAuthToken(token) {
    this.authToken = token
  }

  /**
   * 重置下载状态
   */
  resetDownloadState() {
    this.downloadState = {
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
   * 验证API响应
   */
  _validateApiResponse(response) {
    if ('error' in response) {
      throw new Error(`API Error: ${response.error}`)
    }
    if (response.status !== 200 && response.status !== 206) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response
  }

  getModel3Ds() {
    return resources.getModel3Ds();
  }

  /**
   * 基础下载方法
   */
  async downloadModel(uuid, context = '下载') {
    if (!uuid) throw new Error('无法获取模型UUID')
    
    try {
      const response = await resources.streamModelByUuid(uuid)
      this._validateApiResponse(response)
      return response
    } catch (error) {
      console.error(`${context}失败:`, error)
      throw error
    }
  }

  /**
   * 获取文件信息
   */
  async getFileInfo(model) {
    const { uuid } = model
    if (!uuid) throw new Error('无法获取模型UUID')

    const response = await resources.streamModelByUuid(uuid)
    this._validateApiResponse(response)

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
    const { uuid } = model
    if (!uuid) throw new Error('无法获取模型UUID')

    // 只有在分块模式下才添加Range请求头
    const chunkSizeNum = Number(chunkSize)
    const rangeHeader = chunkSizeNum > 0 ? `bytes=${start}-${end}` : undefined
    
    const response = await resources.streamModelByUuid(uuid, rangeHeader)
    this._validateApiResponse(response)

    return await response.data.arrayBuffer()
  }

  /**
   * 流式下载模型
   */
  async downloadModelStream(model, options = {}) {
    console.log('🌊 开始流式下载...')
    const { uuid } = model
    const startTime = Date.now()
    
    const {
      onProgress = () => {},
      onComplete = () => {},
      onError = () => {}
    } = options

    try {
      // 重置下载状态
      this.resetDownloadState()
      this.downloadState.downloadStartTime = startTime
      this.downloadState.lastProgressTime = startTime
      
      // 下载模型数据
      const response = await this.downloadModel(uuid, '流式下载')
      const arrayBuffer = await response.data.arrayBuffer()
      const downloadTime = Date.now() - startTime

      onComplete({
        data: arrayBuffer,
        downloadTime,
        size: arrayBuffer.byteLength
      })

      return {
        data: arrayBuffer,
        downloadTime,
        size: arrayBuffer.byteLength
      }
    } catch (error) {
      onError(error)
      throw error
    }
  }

  /**
   * 实时流式下载（支持分块和断点续传）
   */
  async downloadModelStreamRealtime(model, options = {}) {
    console.log('⚡ 开始实时流式下载...')
    const { uuid, name } = model
    if (!uuid) throw new Error('无法获取模型UUID')

    const {
      chunkSize = 0,
      enableResume = true,
      streamDecoder = null,
      onProgress = () => {},
      onStreamInfo = () => {},
      onComplete = () => {},
      onError = () => {}
    } = options

    // 重置下载状态
    this.resetDownloadState()
    const startTime = Date.now()
    this.downloadState.downloadStartTime = startTime
    this.downloadState.lastProgressTime = startTime
    this.downloadState.controller = new AbortController()

    try {
      // 获取文件大小和支持的范围请求
      const fileInfo = await this.getFileInfo(model)
      this.downloadState.totalBytes = fileInfo.size

      onStreamInfo(0, this.downloadState.totalBytes, 0, '计算中...', 0, 0)

      // 检查是否有断点续传数据
      let startByte = 0
      if (enableResume && this.downloadState.resumeData && this.downloadState.resumeData.filename === name) {
        startByte = this.downloadState.resumeData.downloadedBytes
        this.downloadState.downloadedBytes = startByte
        console.log(`📥 断点续传: 从字节 ${startByte} 开始下载`)
      }

      // 边下载边解码的流式处理
      let currentByte = startByte
      let chunkIndex, totalChunks
      let decodeResult = null
      let isDecodeComplete = false

      // 处理不分块的情况
      const chunkSizeNum = Number(chunkSize)
      if (chunkSizeNum === 0) {
        chunkIndex = 0
        totalChunks = 1
      } else {
        chunkIndex = Math.floor(startByte / chunkSizeNum)
        totalChunks = Math.ceil(this.downloadState.totalBytes / chunkSizeNum)
      }

      while (currentByte < this.downloadState.totalBytes && !this.downloadState.isCancelled && !isDecodeComplete) {
        // 检查是否暂停
        while (this.downloadState.isPaused && !this.downloadState.isCancelled) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        if (this.downloadState.isCancelled) break

        // 计算结束字节位置
        let endByte
        if (chunkSizeNum === 0) {
          // 不分块：下载整个文件
          endByte = this.downloadState.totalBytes - 1
        } else {
          // 分块：计算当前块的结束位置
          endByte = Math.min(currentByte + chunkSizeNum - 1, this.downloadState.totalBytes - 1)
        }

        console.log(`📥 下载块 ${chunkIndex + 1}/${totalChunks}: ${currentByte}-${endByte}`)

        try {
          // 下载当前块
          const chunkStartTime = performance.now()
          const chunkData = await this.downloadChunk(model, currentByte, endByte, chunkSize)
          const chunkDownloadTime = performance.now() - chunkStartTime
          
          // 更新下载状态
          this.downloadState.downloadedBytes = endByte + 1
          
          // 🔥 关键：如果有流式解码器，立即进行边下载边解码
          let streamResult = null
          let chunkDecodeTime = 0
          if (streamDecoder) {
            const decodeStartTime = performance.now()
            streamResult = streamDecoder.add_chunk(new Uint8Array(chunkData))
            chunkDecodeTime = performance.now() - decodeStartTime
            
            console.log(`📦 分块 ${chunkIndex}: 下载耗时 ${chunkDownloadTime.toFixed(1)}ms, 解码耗时 ${chunkDecodeTime.toFixed(1)}ms, 解码进度 ${(streamResult.progress * 100).toFixed(1)}%`)
            
            // 检查解码是否完成
            if (streamResult.is_complete) {
              decodeResult = streamResult
              isDecodeComplete = true
              console.log('🎉 流式解码完成!', {
                chunks_processed: streamResult.chunks_processed,
                total_received: streamResult.total_received,
                final_progress: streamResult.progress
              })
            }
          }
          
          // 计算下载进度和速度
          const currentTime = Date.now()
          const downloadProgress = (this.downloadState.downloadedBytes / this.downloadState.totalBytes)
          const decodeProgress = streamResult ? streamResult.progress : 0
          const speed = this.calculateDownloadSpeed(currentTime)
          const remainingTime = this.calculateRemainingTime(speed)
          
          // 触发进度回调
          onProgress(downloadProgress, this.downloadState.downloadedBytes, this.downloadState.totalBytes, speed, remainingTime, decodeProgress)

          // 保存断点续传数据
          if (enableResume) {
            this.downloadState.resumeData = {
              filename: name,
              downloadedBytes: this.downloadState.downloadedBytes,
              totalBytes: this.downloadState.totalBytes,
              timestamp: Date.now()
            }
          }

          // 检查解码错误
          if (streamResult && !streamResult.success && streamResult.error) {
            throw new Error(`流式解码失败: ${streamResult.error}`)
          }

          // 更新位置
          currentByte = endByte + 1
          chunkIndex++

          // 如果不分块，一次就下载完了
          if (chunkSizeNum === 0) {
            break
          }

          // 添加请求间隔延迟以避免触发限流
          if (currentByte < this.downloadState.totalBytes) {
            await new Promise(resolve => setTimeout(resolve, 50)) // 50ms延迟
          }

        } catch (error) {
          console.error(`❌ 下载块失败:`, error)
          
          // 保存断点续传数据
          if (enableResume) {
            this.downloadState.resumeData = {
              filename: name,
              downloadedBytes: this.downloadState.downloadedBytes,
              totalBytes: this.downloadState.totalBytes,
              timestamp: Date.now()
            }
          }
          
          onError(error)
          // 重试机制
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }
      }

      if (this.downloadState.isCancelled) {
        throw new Error('下载已取消')
      }

      if (streamDecoder && (!isDecodeComplete || !decodeResult)) {
        throw new Error('流式解码未完成')
      }

      const downloadTime = Date.now() - startTime
      
      // 清除断点续传数据
      this.downloadState.resumeData = null
      
      const result = {
        decodeResult: decodeResult || { data: null },
        downloadTime,
        decodeTime: downloadTime * 0.4, // 估算解码时间
        totalBytes: this.downloadState.totalBytes,
        chunksCount: chunkIndex,
        averageSpeed: this.downloadState.totalBytes / (downloadTime / 1000)
      }

      onComplete(result)
      return result

    } catch (error) {
      onError(error)
      throw error
    }
  }

  /**
   * 计算下载速度
   */
  calculateDownloadSpeed(currentTime) {
    const timeDiff = currentTime - this.downloadState.lastProgressTime
    const bytesDiff = this.downloadState.downloadedBytes - this.downloadState.lastDownloadedBytes

    if (timeDiff > 0) {
      const speed = (bytesDiff / timeDiff) * 1000 // bytes per second
      this.downloadState.lastProgressTime = currentTime
      this.downloadState.lastDownloadedBytes = this.downloadState.downloadedBytes
      return speed
    }
    return 0
  }

  /**
   * 计算剩余时间
   */
  calculateRemainingTime(speed) {
    if (speed <= 0) return '计算中...'

    const remainingBytes = this.downloadState.totalBytes - this.downloadState.downloadedBytes
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
   * 暂停下载
   */
  pauseStream() {
    console.log('⏸️ 暂停下载')
    this.downloadState.isPaused = true
  }

  /**
   * 恢复下载
   */
  resumeStream() {
    console.log('▶️ 恢复下载')
    this.downloadState.isPaused = false
  }

  /**
   * 取消下载
   */
  cancelStream() {
    console.log('❌ 取消下载')
    this.downloadState.isCancelled = true
    if (this.downloadState.controller) {
      this.downloadState.controller.abort()
    }

    // 清除断点续传数据
    this.downloadState.resumeData = null
    this.downloadState.downloadedBytes = 0
    this.downloadState.totalBytes = 0
  }

  /**
   * 获取下载状态
   */
  getDownloadState() {
    return { ...this.downloadState }
  }

  /**
   * 清理资源
   */
  dispose() {
    // 取消正在进行的下载
    this.cancelDownload()
    
    // 重置状态
    this.resetDownloadState()
  }
}

// 导出默认实例
export default new ModelDownloader()