/**
 * 通用 Web Worker 管理器基类
 * 提供统一的 Worker 管理接口，支持多种类型的 Worker
 */
export class BaseWorkerManager {
  constructor(workerPath, workerType = 'module') {
    this.workerPath = workerPath
    this.workerType = workerType
    this.worker = null
    this.taskId = 0
    this.pendingTasks = new Map()
    this.isReady = false
    this.initWorker()
  }

  /**
   * 初始化 Worker
   */
  initWorker() {
    try {
      // 创建 Worker
      this.worker = new Worker(
        new URL(this.workerPath, import.meta.url),
        { type: this.workerType }
      )

      // 监听 Worker 消息
      this.worker.onmessage = (e) => {
        this.handleWorkerMessage(e.data)
      }

      // 监听 Worker 错误
      this.worker.onerror = (error) => {
        this.rejectAllPendingTasks(new Error('Worker error: ' + error.message))
      }

      // 监听 Worker 终止
      this.worker.onmessageerror = (error) => {
        this.rejectAllPendingTasks(new Error('Worker message error'))
      }

    } catch (error) {
      throw new Error('Web Workers not supported or failed to initialize')
    }
  }

  /**
   * 处理 Worker 消息
   * @param {Object} message - Worker 消息
   */
  handleWorkerMessage(message) {
    const { type, id, result, error, progress, message: progressMessage } = message

    switch (type) {
      case 'ready':
        this.isReady = true
        break

      case 'success':
        if (this.pendingTasks.has(id)) {
          const { resolve } = this.pendingTasks.get(id)
          resolve(result)
          this.pendingTasks.delete(id)
        }
        break

      case 'error':
        if (this.pendingTasks.has(id)) {
          const { reject } = this.pendingTasks.get(id)
          reject(new Error(error))
          this.pendingTasks.delete(id)
        }
        break

      case 'progress':
        if (this.pendingTasks.has(id)) {
          const { onProgress } = this.pendingTasks.get(id)
          if (onProgress) {
            onProgress({ progress, message: progressMessage })
          }
        }
        break

      default:
        // 未知消息类型
    }
  }

  /**
   * 等待 Worker 就绪
   * @returns {Promise<void>}
   */
  waitForReady() {
    return new Promise((resolve) => {
      if (this.isReady) {
        resolve()
      } else {
        const checkReady = () => {
          if (this.isReady) {
            resolve()
          } else {
            setTimeout(checkReady, 10)
          }
        }
        checkReady()
      }
    })
  }

  /**
   * 序列化数据以确保可以通过 postMessage 传递
   * @param {*} data - 要序列化的数据
   * @returns {*} 序列化后的数据
   */
  serializeData(data) {
    try {
      // 通过 JSON 序列化/反序列化来清理不可克隆的对象
      return JSON.parse(JSON.stringify(data))
    } catch (error) {
      return data
    }
  }

  /**
   * 发送任务到 Worker
   * @param {string} type - 任务类型
   * @param {*} data - 数据
   * @param {Object} options - 选项
   * @param {Function} onProgress - 进度回调
   * @returns {Promise<*>} 处理结果
   */
  async sendTask(type, data, options = {}, onProgress = null) {
    await this.waitForReady()

    const id = ++this.taskId
    
    return new Promise((resolve, reject) => {
      // 存储任务回调
      this.pendingTasks.set(id, { resolve, reject, onProgress })

      try {
        // 序列化数据以确保可以通过 postMessage 传递
        const serializedData = this.serializeData(data)
        const serializedOptions = this.serializeData(options)

        // 发送任务到 Worker
        this.worker.postMessage({
          type,
          data: serializedData,
          options: serializedOptions,
          id
        })
      } catch (error) {
        // 如果 postMessage 失败，立即拒绝 Promise
        this.pendingTasks.delete(id)
        reject(new Error(`Failed to send data to worker: ${error.message}`))
        return
      }

      // 设置超时（可选）
      if (options.timeout) {
        setTimeout(() => {
          if (this.pendingTasks.has(id)) {
            this.pendingTasks.delete(id)
            reject(new Error('Task timeout'))
          }
        }, options.timeout)
      }
    })
  }

  /**
   * 拒绝所有待处理的任务
   * @param {Error} error - 错误对象
   */
  rejectAllPendingTasks(error) {
    this.pendingTasks.forEach(({ reject }) => {
      reject(error)
    })
    this.pendingTasks.clear()
  }

  /**
   * 终止 Worker
   */
  terminate() {
    if (this.worker) {
      this.rejectAllPendingTasks(new Error('Worker terminated'))
      this.worker.terminate()
      this.worker = null
      this.isReady = false
    }
  }

  /**
   * 获取 Worker 状态
   * @returns {Object} 状态信息
   */
  getStatus() {
    return {
      isReady: this.isReady,
      pendingTasks: this.pendingTasks.size,
      hasWorker: !!this.worker
    }
  }
}

/**
 * Worker 管理器工厂
 * 用于创建和管理多种类型的 Worker 实例
 */
export class WorkerManagerFactory {
  constructor() {
    this.managers = new Map()
  }

  /**
   * 创建或获取 Worker 管理器
   * @param {string} name - Worker 名称
   * @param {Function} ManagerClass - Worker 管理器类
   * @param {...any} args - 构造函数参数
   * @returns {BaseWorkerManager} Worker 管理器实例
   */
  getManager(name, ManagerClass, ...args) {
    if (!this.managers.has(name)) {
      this.managers.set(name, new ManagerClass(...args))
    }
    return this.managers.get(name)
  }

  /**
   * 销毁指定的 Worker 管理器
   * @param {string} name - Worker 名称
   */
  destroyManager(name) {
    if (this.managers.has(name)) {
      const manager = this.managers.get(name)
      manager.terminate()
      this.managers.delete(name)
    }
  }

  /**
   * 销毁所有 Worker 管理器
   */
  destroyAll() {
    this.managers.forEach((manager, name) => {
      manager.terminate()
    })
    this.managers.clear()
  }

  /**
   * 获取所有 Worker 的状态
   * @returns {Object} 所有 Worker 的状态信息
   */
  getAllStatus() {
    const status = {}
    this.managers.forEach((manager, name) => {
      status[name] = manager.getStatus()
    })
    return status
  }
}

// 创建全局工厂实例
const workerFactory = new WorkerManagerFactory()

/**
 * 获取 Worker 管理器工厂实例
 * @returns {WorkerManagerFactory}
 */
export function getWorkerFactory() {
  return workerFactory
}

// 页面卸载时自动清理所有 Worker
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    workerFactory.destroyAll()
  })
}