import { BaseWorkerManager, getWorkerFactory } from './WorkerManager'

/**
 * 模型加载 Web Worker 管理器
 * 继承自 BaseWorkerManager，提供模型加载和处理的专用方法
 */
export class ModelWorkerManager extends BaseWorkerManager {
  constructor() {
    super('../workers/modelWorker.js', 'module')
  }

  /**
   * 加载模型
   * @param {string} modelUrl - 模型文件 URL
   * @param {Object} options - 加载选项
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Object>} 加载的模型数据
   */
  async loadModel(modelUrl, options = {}, onProgress = null) {
    return this.sendTask('loadModel', { modelUrl }, options, onProgress)
  }

  /**
   * 预处理模型数据
   * @param {Object} modelData - 模型数据
   * @param {Object} options - 预处理选项
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Object>} 预处理后的模型数据
   */
  async preprocessModel(modelData, options = {}, onProgress = null) {
    return this.sendTask('preprocessModel', modelData, options, onProgress)
  }

  /**
   * 运行模型推理
   * @param {Object} inputData - 输入数据
   * @param {Object} options - 推理选项
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Object>} 推理结果
   */
  async runInference(inputData, options = {}, onProgress = null) {
    return this.sendTask('runInference', inputData, options, onProgress)
  }

  /**
   * 批量处理数据
   * @param {Array} dataList - 数据数组
   * @param {Object} options - 处理选项
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Array>} 处理结果数组
   */
  async batchProcess(dataList, options = {}, onProgress = null) {
    return this.sendTask('batchProcess', { dataList }, options, onProgress)
  }

  /**
   * 优化模型
   * @param {Object} modelData - 模型数据
   * @param {Object} options - 优化选项
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<Object>} 优化后的模型
   */
  async optimizeModel(modelData, options = {}, onProgress = null) {
    return this.sendTask('optimizeModel', modelData, options, onProgress)
  }

  /**
   * 获取模型信息
   * @param {Object} modelData - 模型数据
   * @returns {Promise<Object>} 模型信息
   */
  async getModelInfo(modelData) {
    return this.sendTask('getModelInfo', modelData)
  }
}

/**
 * 获取 ModelWorkerManager 单例实例
 * @returns {ModelWorkerManager}
 */
export function getModelWorkerManager() {
  const factory = getWorkerFactory()
  return factory.getManager('model', ModelWorkerManager)
}

/**
 * 销毁 ModelWorkerManager 单例实例
 */
export function destroyModelWorkerManager() {
  const factory = getWorkerFactory()
  factory.destroyManager('model')
}