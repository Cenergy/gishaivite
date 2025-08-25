/**
 * 加载状态机 - 用于管理复杂的异步加载流程
 * 
 * 设计思路：
 * 1. 使用有限状态机模式，确保状态转换的可预测性和一致性
 * 2. 通过事件系统实现松耦合的状态监听和响应
 * 3. 提供丰富的便捷方法，简化常见操作
 * 4. 支持上下文数据传递，便于状态间的数据共享
 * 
 * 主要特性：
 * - 严格的状态转换控制，防止非法状态切换
 * - 事件驱动架构，支持多个监听器
 * - 进度跟踪和错误处理
 * - 支持暂停/恢复/取消操作
 * 
 * 使用示例：
 * ```javascript
 * const stateMachine = new LoadingStateMachine()
 * 
 * // 监听状态变化
 * stateMachine.on('stateChange', ({ from, to, context }) => {
 *   console.log(`状态从 ${from} 变为 ${to}`, context)
 * })
 * 
 * // 监听进度更新
 * stateMachine.on('progress', (context) => {
 *   updateProgressBar(context.progress)
 * })
 * 
 * // 开始加载流程
 * stateMachine.startLoading('开始下载模型...')
 * stateMachine.startDownloading('正在下载...')
 * stateMachine.updateDownloadProgress(50, '下载进度 50%')
 * stateMachine.startDecoding('开始解码...')
 * stateMachine.success(modelData, '加载完成')
 * ```
 * 
 * 扩展指南：
 * 1. 添加新状态：在 STATES 中定义，在 TRANSITIONS 中配置转换规则
 * 2. 添加新事件：直接使用 emit() 方法触发自定义事件
 * 3. 扩展上下文：在 context 对象中添加新字段
 * 4. 添加便捷方法：参考现有方法，封装常用的状态转换操作
 */
export class LoadingStateMachine {
  /**
   * 构造函数 - 初始化状态机
   * 
   * 初始状态设置为 'idle'（空闲），这是状态机的起始状态
   * 使用 Map 存储事件监听器，支持一个事件对应多个回调函数
   * context 对象用于在状态间传递数据和跟踪加载进度
   */
  constructor() {
    // 当前状态，初始为空闲状态
    this.currentState = 'idle'
    
    // 事件监听器映射表：事件名 -> 回调函数数组
    this.listeners = new Map()
    
    // 状态上下文，用于存储状态相关的数据
    this.context = {
      progress: 0,           // 加载进度 (0-100)
      message: '等待加载...',  // 当前状态描述信息
      error: null,           // 错误信息（如果有）
      data: null            // 加载完成后的数据
    }
  }

  /**
   * 定义所有可能的状态
   * 
   * 状态说明：
   * - IDLE: 空闲状态，等待开始加载
   * - LOADING: 通用加载状态，用于初始化阶段
   * - DOWNLOADING: 下载阶段，从服务器获取数据
   * - DECODING: 解码阶段，解析下载的数据（如WASM解码）
   * - BUILDING: 构建阶段，将解码后的数据构建为可用对象
   * - SUCCESS: 成功状态，加载完成
   * - ERROR: 错误状态，加载过程中出现错误
   * - PAUSED: 暂停状态，可以从此状态恢复
   * - CANCELLED: 取消状态，用户主动取消加载
   * 
   * 扩展提示：添加新状态时，记得同时更新 TRANSITIONS 和相关方法
   */
  static STATES = {
    IDLE: 'idle',
    LOADING: 'loading',
    DOWNLOADING: 'downloading',
    DECODING: 'decoding',
    BUILDING: 'building',
    SUCCESS: 'success',
    ERROR: 'error',
    PAUSED: 'paused',
    CANCELLED: 'cancelled'
  }

  /**
   * 定义状态转换规则 - 状态机的核心约束
   * 
   * 每个状态只能转换到指定的目标状态，这确保了状态流转的合理性
   * 格式：当前状态 -> [允许转换到的状态列表]
   * 
   * 转换规则说明：
   * - idle: 只能开始加载
   * - loading: 可以进入任何加载阶段，或直接成功/失败/取消
   * - downloading: 可以继续下载、进入解码、暂停、或结束
   * - decoding: 只能进入构建阶段或结束
   * - building: 只能成功或失败
   * - paused: 只能恢复下载或取消
   * - success/error/cancelled: 只能重置到空闲状态
   * 
   * 扩展提示：
   * 1. 添加新状态时，需要定义它能转换到哪些状态
   * 2. 考虑双向转换的需要（如 A->B 和 B->A）
   * 3. 确保没有死锁状态（无法转换到其他状态）
   */
  static TRANSITIONS = {
    idle: ['loading'],
    loading: ['loading', 'downloading', 'building', 'success', 'error', 'cancelled'],
    downloading: ['downloading', 'decoding', 'building', 'success', 'paused', 'error', 'cancelled'],
    decoding: ['building', 'error', 'cancelled'],
    building: ['success', 'error', 'cancelled'],
    paused: ['downloading', 'cancelled'],
    success: ['idle'],
    error: ['idle'],
    cancelled: ['idle']
  }

  /**
   * 获取当前状态
   * @returns {string} 当前状态字符串
   */
  getState() {
    return this.currentState
  }

  /**
   * 获取上下文数据的副本
   * 返回副本而不是原对象，防止外部直接修改内部状态
   * @returns {Object} 上下文数据的浅拷贝
   */
  getContext() {
    return { ...this.context }
  }

  /**
   * 检查是否可以转换到目标状态
   * 根据预定义的转换规则验证状态转换的合法性
   * 
   * @param {string} targetState - 目标状态
   * @returns {boolean} 是否可以转换
   */
  canTransitionTo(targetState) {
    const allowedStates = LoadingStateMachine.TRANSITIONS[this.currentState] || []
    return allowedStates.includes(targetState)
  }

  /**
   * 核心状态转换方法
   * 
   * 执行状态转换的完整流程：
   * 1. 验证转换的合法性
   * 2. 更新当前状态
   * 3. 合并上下文数据
   * 4. 触发相关事件
   * 
   * @param {string} targetState - 目标状态
   * @param {Object} context - 要合并到上下文中的新数据
   * @returns {boolean} 转换是否成功
   */
  transition(targetState, context = {}) {
    // 验证状态转换的合法性
    if (!this.canTransitionTo(targetState)) {
      console.warn(`无法从 ${this.currentState} 转换到 ${targetState}`)
      return false
    }

    const previousState = this.currentState
    this.currentState = targetState

    // 合并新的上下文数据，保留原有数据
    this.context = { ...this.context, ...context }

    // 触发通用状态变化事件，包含转换详情
    this.emit('stateChange', {
      from: previousState,
      to: targetState,
      context: this.getContext()
    })

    // 触发特定状态的事件，便于监听特定状态
    this.emit(targetState, this.getContext())

    console.log(`状态转换: ${previousState} -> ${targetState}`, this.context)
    return true
  }

  /**
   * 便捷方法：开始加载
   * 将状态转换为 LOADING，并重置进度和错误信息
   * 
   * @param {string} message - 加载状态的描述信息
   * @returns {boolean} 转换是否成功
   */
  startLoading(message = '开始加载...') {
    return this.transition(LoadingStateMachine.STATES.LOADING, {
      progress: 0,
      message,
      error: null  // 清除之前的错误信息
    })
  }

  /**
   * 便捷方法：开始下载
   * 进入下载阶段，通常在网络请求开始时调用
   * 
   * @param {string} message - 下载状态的描述信息
   * @returns {boolean} 转换是否成功
   */
  startDownloading(message = '开始下载...') {
    return this.transition(LoadingStateMachine.STATES.DOWNLOADING, {
      message
    })
  }

  /**
   * 便捷方法：更新下载进度
   * 在下载状态下更新进度，不改变状态但触发进度事件
   * 
   * 注意：只有在 DOWNLOADING 状态下才会更新，确保状态一致性
   * 
   * @param {number} progress - 进度百分比 (0-100)
   * @param {string} message - 进度描述信息
   */
  updateDownloadProgress(progress, message) {
    if (this.currentState === LoadingStateMachine.STATES.DOWNLOADING) {
      this.context.progress = progress
      this.context.message = message
      // 触发进度事件，但不改变状态
      this.emit('progress', this.getContext())
    }
  }

  /**
   * 便捷方法：开始解码
   * 进入解码阶段，通常在数据下载完成后开始解析时调用
   * 
   * @param {string} message - 解码状态的描述信息
   * @returns {boolean} 转换是否成功
   */
  startDecoding(message = '开始解码...') {
    return this.transition(LoadingStateMachine.STATES.DECODING, {
      message
    })
  }

  /**
   * 便捷方法：更新解码进度
   * 在解码状态下更新进度
   * 
   * @param {number} progress - 进度百分比 (0-100)
   * @param {string} message - 进度描述信息
   */
  updateDecodeProgress(progress, message) {
    if (this.currentState === LoadingStateMachine.STATES.DECODING) {
      this.context.progress = progress
      this.context.message = message
      this.emit('progress', this.getContext())
    }
  }

  /**
   * 便捷方法：开始构建模型
   * 进入构建阶段，通常在解码完成后开始构建最终对象时调用
   * 
   * @param {string} message - 构建状态的描述信息
   * @returns {boolean} 转换是否成功
   */
  startBuilding(message = '构建模型...') {
    return this.transition(LoadingStateMachine.STATES.BUILDING, {
      message
    })
  }

  /**
   * 便捷方法：加载成功
   * 标记加载流程成功完成，设置进度为100%并保存结果数据
   * 
   * @param {*} data - 加载完成的数据（如模型对象、解析结果等）
   * @param {string} message - 成功状态的描述信息
   * @returns {boolean} 转换是否成功
   */
  success(data, message = '加载完成') {
    return this.transition(LoadingStateMachine.STATES.SUCCESS, {
      progress: 100,
      message,
      data
    })
  }

  /**
   * 便捷方法：加载失败
   * 标记加载流程失败，保存错误信息
   * 
   * @param {Error|string} error - 错误对象或错误信息
   * @param {string} message - 错误状态的描述信息
   * @returns {boolean} 转换是否成功
   */
  error(error, message = '加载失败') {
    return this.transition(LoadingStateMachine.STATES.ERROR, {
      error,
      message
    })
  }

  /**
   * 便捷方法：暂停加载
   * 暂停当前的加载流程，通常用于下载阶段
   * 
   * @param {string} message - 暂停状态的描述信息
   * @returns {boolean} 转换是否成功
   */
  pause(message = '已暂停') {
    return this.transition(LoadingStateMachine.STATES.PAUSED, {
      message
    })
  }

  /**
   * 便捷方法：取消加载
   * 用户主动取消加载流程
   * 
   * @param {string} message - 取消状态的描述信息
   * @returns {boolean} 转换是否成功
   */
  cancel(message = '已取消') {
    return this.transition(LoadingStateMachine.STATES.CANCELLED, {
      message
    })
  }

  /**
   * 便捷方法：重置到空闲状态
   * 直接重置状态机到初始状态，清除所有上下文数据
   * 
   * 注意：这是一个强制重置方法，不遵循状态转换规则
   * 通常用于错误恢复或重新开始加载流程
   */
  reset() {
    this.currentState = LoadingStateMachine.STATES.IDLE
    this.context = {
      progress: 0,
      message: '等待加载...',
      error: null,
      data: null
    }
    this.emit('reset', this.getContext())
  }

  /**
   * 添加事件监听器
   * 
   * 支持的事件类型：
   * - 'stateChange': 状态变化时触发，参数包含 from, to, context
   * - 'progress': 进度更新时触发，参数为当前 context
   * - 'reset': 重置时触发
   * - 具体状态名: 进入特定状态时触发（如 'loading', 'success' 等）
   * 
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * 
   * 使用示例：
   * stateMachine.on('stateChange', ({ from, to, context }) => {
   *   console.log(`状态从 ${from} 变为 ${to}`)
   * })
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  /**
   * 移除事件监听器
   * 
   * @param {string} event - 事件名称
   * @param {Function} callback - 要移除的回调函数（必须是同一个函数引用）
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 触发事件
   * 安全地调用所有注册的事件监听器，捕获并记录任何错误
   * 
   * @param {string} event - 事件名称
   * @param {*} data - 传递给监听器的数据
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error(`事件监听器错误 (${event}):`, error)
        }
      })
    }
  }

  /**
   * 获取当前状态的中文描述
   * 用于在UI中显示用户友好的状态信息
   * 
   * @returns {string} 状态的中文描述
   * 
   * 扩展提示：添加新状态时，记得在这里添加对应的中文描述
   */
  getStateDescription() {
    const descriptions = {
      [LoadingStateMachine.STATES.IDLE]: '空闲',
      [LoadingStateMachine.STATES.LOADING]: '加载中',
      [LoadingStateMachine.STATES.DOWNLOADING]: '下载中',
      [LoadingStateMachine.STATES.DECODING]: '解码中',
      [LoadingStateMachine.STATES.BUILDING]: '构建中',
      [LoadingStateMachine.STATES.SUCCESS]: '成功',
      [LoadingStateMachine.STATES.ERROR]: '错误',
      [LoadingStateMachine.STATES.PAUSED]: '已暂停',
      [LoadingStateMachine.STATES.CANCELLED]: '已取消'
    }
    return descriptions[this.currentState] || '未知状态'
  }

  /**
   * 检查是否处于加载状态
   * 判断当前是否在执行任何形式的加载操作
   * 
   * @returns {boolean} 是否正在加载
   */
  isLoading() {
    return [
      LoadingStateMachine.STATES.LOADING,
      LoadingStateMachine.STATES.DOWNLOADING,
      LoadingStateMachine.STATES.DECODING,
      LoadingStateMachine.STATES.BUILDING
    ].includes(this.currentState)
  }

  /**
   * 检查是否可以暂停
   * 只有在下载阶段才支持暂停操作
   * 
   * @returns {boolean} 是否可以暂停
   */
  canPause() {
    return this.currentState === LoadingStateMachine.STATES.DOWNLOADING
  }

  /**
   * 检查是否可以恢复
   * 只有在暂停状态下才能恢复
   * 
   * @returns {boolean} 是否可以恢复
   */
  canResume() {
    return this.currentState === LoadingStateMachine.STATES.PAUSED
  }

  /**
   * 检查是否可以取消
   * 在加载过程中或暂停状态下都可以取消
   * 
   * @returns {boolean} 是否可以取消
   */
  canCancel() {
    return this.isLoading() || this.currentState === LoadingStateMachine.STATES.PAUSED
  }

  /**
   * 扩展方法示例：添加自定义状态检查
   * 
   * 可以根据需要添加更多状态检查方法，例如：
   * 
   * isFinished() {
   *   return [STATES.SUCCESS, STATES.ERROR, STATES.CANCELLED].includes(this.currentState)
   * }
   * 
   * canRetry() {
   *   return this.currentState === STATES.ERROR
   * }
   * 
   * getProgressPercentage() {
   *   return Math.max(0, Math.min(100, this.context.progress))
   * }
   */
}

export default LoadingStateMachine
