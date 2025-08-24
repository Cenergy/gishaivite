/**
 * 简单的加载状态机
 * 管理模型加载的各种状态和转换
 */
export class LoadingStateMachine {
  constructor() {
    this.currentState = 'idle'
    this.listeners = new Map()
    this.context = {
      progress: 0,
      message: '等待加载...',
      error: null,
      data: null
    }
  }

  // 定义所有可能的状态
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

  // 定义状态转换规则
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

  // 获取当前状态
  getState() {
    return this.currentState
  }

  // 获取上下文数据
  getContext() {
    return { ...this.context }
  }

  // 检查是否可以转换到目标状态
  canTransitionTo(targetState) {
    const allowedStates = LoadingStateMachine.TRANSITIONS[this.currentState] || []
    return allowedStates.includes(targetState)
  }

  // 状态转换
  transition(targetState, context = {}) {
    if (!this.canTransitionTo(targetState)) {
      console.warn(`无法从 ${this.currentState} 转换到 ${targetState}`)
      return false
    }

    const previousState = this.currentState
    this.currentState = targetState

    // 更新上下文
    this.context = { ...this.context, ...context }

    // 触发状态变化事件
    this.emit('stateChange', {
      from: previousState,
      to: targetState,
      context: this.getContext()
    })

    // 触发特定状态事件
    this.emit(targetState, this.getContext())

    console.log(`状态转换: ${previousState} -> ${targetState}`, this.context)
    return true
  }

  // 便捷方法：开始加载
  startLoading(message = '开始加载...') {
    return this.transition(LoadingStateMachine.STATES.LOADING, {
      progress: 0,
      message,
      error: null
    })
  }

  // 便捷方法：开始下载
  startDownloading(message = '开始下载...') {
    return this.transition(LoadingStateMachine.STATES.DOWNLOADING, {
      message
    })
  }

  // 便捷方法：更新下载进度
  updateDownloadProgress(progress, message) {
    if (this.currentState === LoadingStateMachine.STATES.DOWNLOADING) {
      this.context.progress = progress
      this.context.message = message
      this.emit('progress', this.getContext())
    }
  }

  // 便捷方法：开始解码
  startDecoding(message = '开始解码...') {
    return this.transition(LoadingStateMachine.STATES.DECODING, {
      message
    })
  }

  // 便捷方法：更新解码进度
  updateDecodeProgress(progress, message) {
    if (this.currentState === LoadingStateMachine.STATES.DECODING) {
      this.context.progress = progress
      this.context.message = message
      this.emit('progress', this.getContext())
    }
  }

  // 便捷方法：开始构建模型
  startBuilding(message = '构建模型...') {
    return this.transition(LoadingStateMachine.STATES.BUILDING, {
      message
    })
  }

  // 便捷方法：加载成功
  success(data, message = '加载完成') {
    return this.transition(LoadingStateMachine.STATES.SUCCESS, {
      progress: 100,
      message,
      data
    })
  }

  // 便捷方法：加载失败
  error(error, message = '加载失败') {
    return this.transition(LoadingStateMachine.STATES.ERROR, {
      error,
      message
    })
  }

  // 便捷方法：暂停
  pause(message = '已暂停') {
    return this.transition(LoadingStateMachine.STATES.PAUSED, {
      message
    })
  }

  // 便捷方法：取消
  cancel(message = '已取消') {
    return this.transition(LoadingStateMachine.STATES.CANCELLED, {
      message
    })
  }

  // 便捷方法：重置到空闲状态
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

  // 事件监听
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event).push(callback)
  }

  // 移除事件监听
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event)
      const index = callbacks.indexOf(callback)
      if (index > -1) {
        callbacks.splice(index, 1)
      }
    }
  }

  // 触发事件
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

  // 获取状态描述
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

  // 检查是否处于加载状态
  isLoading() {
    return [
      LoadingStateMachine.STATES.LOADING,
      LoadingStateMachine.STATES.DOWNLOADING,
      LoadingStateMachine.STATES.DECODING,
      LoadingStateMachine.STATES.BUILDING
    ].includes(this.currentState)
  }

  // 检查是否可以暂停
  canPause() {
    return this.currentState === LoadingStateMachine.STATES.DOWNLOADING
  }

  // 检查是否可以恢复
  canResume() {
    return this.currentState === LoadingStateMachine.STATES.PAUSED
  }

  // 检查是否可以取消
  canCancel() {
    return this.isLoading() || this.currentState === LoadingStateMachine.STATES.PAUSED
  }
}

export default LoadingStateMachine
