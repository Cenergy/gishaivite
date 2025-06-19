import { ref, onUnmounted } from 'vue'
import { getGeoWorkerManager } from '@/utils/GeoWorkerManager'

/**
 * 地理数据处理组合式函数
 * 提供响应式的地理数据处理功能
 */
export function useGeoWorker() {
  const isProcessing = ref(false)
  const progress = ref(0)
  const progressMessage = ref('')
  const error = ref(null)
  const result = ref(null)

  // 获取 Worker 管理器实例
  const workerManager = getGeoWorkerManager()

  /**
   * 重置状态
   */
  const resetState = () => {
    isProcessing.value = false
    progress.value = 0
    progressMessage.value = ''
    error.value = null
    result.value = null
  }

  /**
   * 进度回调函数
   * @param {Object} progressData - 进度数据
   */
  const onProgress = (progressData) => {
    progress.value = progressData.progress || 0
    progressMessage.value = progressData.message || ''
  }

  /**
   * 处理 GeoJSON 数据
   * @param {Object} geoData - GeoJSON 数据
   * @param {Object} options - 处理选项
   * @returns {Promise<Object>} 处理结果
   */
  const processGeoJSON = async (geoData, options = {}) => {
    resetState()
    isProcessing.value = true

    try {
      const processedData = await workerManager.processGeoJSON(
        geoData,
        options,
        onProgress
      )
      
      result.value = processedData
      return processedData
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 聚类点数据
   * @param {Array} points - 点数据数组
   * @param {number} distance - 聚类距离
   * @returns {Promise<Array>} 聚类结果
   */
  const clusterPoints = async (points, distance = 0.01) => {
    resetState()
    isProcessing.value = true

    try {
      const clusters = await workerManager.clusterPoints(
        points,
        distance,
        onProgress
      )
      
      result.value = clusters
      return clusters
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 批量处理多个 GeoJSON 文件
   * @param {Array} geoDataList - GeoJSON 数据数组
   * @param {Object} options - 处理选项
   * @returns {Promise<Array>} 处理结果数组
   */
  const batchProcessGeoJSON = async (geoDataList, options = {}) => {
    resetState()
    isProcessing.value = true

    try {
      const results = await workerManager.batchProcessGeoJSON(
        geoDataList,
        options,
        onProgress
      )
      
      result.value = results
      return results
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 计算几何图形边界
   * @param {Object} geometry - GeoJSON 几何图形
   * @returns {Promise<Array>} 边界框
   */
  const calculateBounds = async (geometry) => {
    resetState()
    isProcessing.value = true

    try {
      const bounds = await workerManager.calculateBounds(geometry)
      result.value = bounds
      return bounds
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 处理大型 GeoJSON 文件（分块处理）
   * @param {Object} geoData - 大型 GeoJSON 数据
   * @param {Object} options - 处理选项
   * @param {number} chunkSize - 分块大小
   * @returns {Promise<Object>} 处理结果
   */
  const processLargeGeoJSON = async (geoData, options = {}, chunkSize = 1000) => {
    resetState()
    isProcessing.value = true

    try {
      if (!geoData.features || geoData.features.length <= chunkSize) {
        // 如果数据不大，直接处理
        return await processGeoJSON(geoData, options)
      }

      // 分块处理大型数据
      const features = geoData.features
      const chunks = []
      
      for (let i = 0; i < features.length; i += chunkSize) {
        chunks.push({
          type: 'FeatureCollection',
          features: features.slice(i, i + chunkSize)
        })
      }

      progressMessage.value = `准备处理 ${chunks.length} 个数据块...`
      
      const processedChunks = await batchProcessGeoJSON(chunks, options)
      
      // 合并处理结果
      const mergedFeatures = []
      let totalOriginalCount = 0
      let totalProcessedCount = 0
      
      processedChunks.forEach(chunk => {
        if (chunk.features) {
          mergedFeatures.push(...chunk.features)
          if (chunk.metadata) {
            totalOriginalCount += chunk.metadata.originalCount || 0
            totalProcessedCount += chunk.metadata.processedCount || 0
          }
        }
      })

      const mergedResult = {
        type: 'FeatureCollection',
        features: mergedFeatures,
        metadata: {
          originalCount: totalOriginalCount,
          processedCount: totalProcessedCount,
          chunks: chunks.length,
          chunkSize,
          ...options
        }
      }

      result.value = mergedResult
      return mergedResult
      
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isProcessing.value = false
    }
  }

  /**
   * 获取 Worker 状态
   * @returns {Object} 状态信息
   */
  const getWorkerStatus = () => {
    return workerManager.getStatus()
  }

  // 组件卸载时清理（可选，因为使用的是单例）
  onUnmounted(() => {
    resetState()
  })

  return {
    // 状态
    isProcessing,
    progress,
    progressMessage,
    error,
    result,
    
    // 方法
    processGeoJSON,
    clusterPoints,
    batchProcessGeoJSON,
    calculateBounds,
    processLargeGeoJSON,
    getWorkerStatus,
    resetState
  }
}

/**
 * 地理数据处理工具函数
 */
export const geoUtils = {
  /**
   * 检查是否为有效的 GeoJSON
   * @param {*} data - 待检查的数据
   * @returns {boolean}
   */
  isValidGeoJSON(data) {
    return (
      data &&
      typeof data === 'object' &&
      data.type === 'FeatureCollection' &&
      Array.isArray(data.features)
    )
  },

  /**
   * 获取 GeoJSON 统计信息
   * @param {Object} geoData - GeoJSON 数据
   * @returns {Object} 统计信息
   */
  getGeoJSONStats(geoData) {
    if (!this.isValidGeoJSON(geoData)) {
      return { error: 'Invalid GeoJSON data' }
    }

    const stats = {
      totalFeatures: geoData.features.length,
      geometryTypes: {},
      hasProperties: 0,
      estimatedSize: JSON.stringify(geoData).length
    }

    geoData.features.forEach(feature => {
      if (feature.geometry && feature.geometry.type) {
        const type = feature.geometry.type
        stats.geometryTypes[type] = (stats.geometryTypes[type] || 0) + 1
      }
      
      if (feature.properties && Object.keys(feature.properties).length > 0) {
        stats.hasProperties++
      }
    })

    return stats
  },

  /**
   * 格式化文件大小
   * @param {number} bytes - 字节数
   * @returns {string} 格式化后的大小
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}