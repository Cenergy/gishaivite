import { BaseWorkerManager, getWorkerFactory } from './WorkerManager'

/**
 * 地理数据 Web Worker 管理器
 * 继承自 BaseWorkerManager，提供地理数据处理的专用方法
 */
export class GeoWorkerManager extends BaseWorkerManager {
  constructor() {
    super('../workers/geoDataWorker.js', 'module')
  }

  /**
   * 处理 GeoJSON 数据
   * @param {Object} geoData - GeoJSON 数据
   * @param {Object} options - 处理选项
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Object>} 处理后的 GeoJSON
   */
  async processGeoJSON(geoData, options = {}, onProgress = null) {
    return this.sendTask('processGeoJSON', geoData, options, onProgress)
  }

  /**
   * 聚类点数据
   * @param {Array} points - 点数据数组
   * @param {number} distance - 聚类距离
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Array>} 聚类结果
   */
  async clusterPoints(points, distance = 0.01, onProgress = null) {
    return this.sendTask('clusterPoints', { points, distance }, {}, onProgress)
  }

  /**
   * 计算几何图形边界
   * @param {Object} geometry - GeoJSON 几何图形
   * @returns {Promise<Array>} 边界框 [minLng, minLat, maxLng, maxLat]
   */
  async calculateBounds(geometry) {
    return this.sendTask('calculateBounds', geometry)
  }

  /**
   * 批量处理多个 GeoJSON 文件
   * @param {Array} geoDataList - GeoJSON 数据数组
   * @param {Object} options - 处理选项
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Array>} 处理结果数组
   */
  async batchProcessGeoJSON(geoDataList, options = {}, onProgress = null) {
    const results = []
    const total = geoDataList.length

    for (let i = 0; i < geoDataList.length; i++) {
      const geoData = geoDataList[i]
      
      try {
        const result = await this.processGeoJSON(geoData, options, (progress) => {
          if (onProgress) {
            const overallProgress = ((i + progress.progress / 100) / total) * 100
            onProgress({
              progress: overallProgress,
              message: `处理第 ${i + 1}/${total} 个文件: ${progress.message}`,
              currentFile: i + 1,
              totalFiles: total
            })
          }
        })
        
        results.push(result)
      } catch (error) {
        results.push({ error: error.message })
      }
    }

    return results
  }

}

/**
 * 获取 GeoWorkerManager 单例实例
 * @returns {GeoWorkerManager}
 */
export function getGeoWorkerManager() {
  const factory = getWorkerFactory()
  return factory.getManager('geo', GeoWorkerManager)
}

/**
 * 销毁 GeoWorkerManager 单例实例
 */
export function destroyGeoWorkerManager() {
  const factory = getWorkerFactory()
  factory.destroyManager('geo')
}