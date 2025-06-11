// 使用浏览器原生的crypto.randomUUID()替代uuid
export default class BaseLayer {
  constructor() {
    this.pulseIdList = []
    // 异步请求管理
    this.activeRequests = new Set()
    this.isLoading = false
    this.loadingStates = new Map()
  }
  init(map,options) {
    // 假如是相同的处理类型，则注入
    this.map = map;
    this.options = options;
    this._id = crypto.randomUUID();
    this._hasLoaded = false;
    this.timeInterval = 10 * 1000;
    // 初始化请求管理状态
    this.activeRequests.clear();
    this.isLoading = false;
    this.loadingStates.clear();
  }
  get id() {
    return this._id
  }
  get hasLoaded() {
    return this._hasLoaded
  }
  set hasLoaded(status) {
    this._hasLoaded = Boolean(status)
  }
  /**
   * 回到初始位置
   * 将地图视图重置到初始的中心点和缩放级别
   */
  goHome() {
    if (!this.map) {
      console.warn('Map instance not found');
      return;
    }
    
    // 获取初始配置或使用默认值
    const initialCenter = this.options?.center || [116.4074, 39.9042]; // 默认北京
    const initialZoom = this.options?.zoom || 5;
    
    // 使用动画效果回到初始位置
    this.map.animateTo(
      {
        center: initialCenter,
        zoom: initialZoom,
      },
      {
        duration: 1000, // 1秒动画时间
      }
    );
  }


  openPointPopup({ content = '', component, latlng, options = {} }) {
    // TODO: 使用MapTalks的UI组件实现弹窗
    // MapTalks使用InfoWindow或自定义UI组件
    console.log('openPointPopup called with:', { content, latlng, options })
  }
  closePointPopup() {
    this.popup && this.popup.close()
    this.popup = null
  }

  setVisible(visible, options = {}) {
    if (visible) {
      this._debounce(this.show.bind(this), 200)(options)
    } else {
      this._debounce(this.hide.bind(this), 200)(options)
    }
  }

  show(options) {
    this._showCore(options)
  }
  _showCore(options) {
    this._throwNotImplementationError()
  }

  hide(options) {
    this._visible = false
    this._hideCore(options)
  }

  _hideCore(options) {
    this._throwNotImplementationError()
  }

  setLegend(visible) {
    if (!this.legend) return
    this._setLegend(visible)
  }

  hidePulse(id) {
    // TODO: 使用MapTalks实现脉冲效果的隐藏
    console.log('hidePulse called with id:', id)
  }
  showPulse(id) {
    // TODO: 使用MapTalks实现脉冲效果的显示
    console.log('showPulse called with id:', id)
  }

  _setLegend(visible) {
    this._throwNotImplementationError()
  }

  _handlePublishHour(post_modified) {
    // 拿到当前时间戳和发布时的时间戳，然后得出时间戳差
    const curTime = new Date()
    const postTime = new Date(post_modified)
    const timeDiff = curTime.getTime() - postTime.getTime()

    // 单位换算
    const min = 60 * 1000
    const hour = min * 60

    // 计算发布时间距离当前时间的小时
    const exceedHour = Math.floor(timeDiff / hour)
    return exceedHour
  }

  /**
   *  防抖函数，频繁调用时，使用它
   * @param {*} fn 回调函数
   * @param {*} delay 防抖时间
   * @returns {void}
   */
  _debounce(fn, delay) {
    // 所以这个函数就可以使用...运算符收集js自动添加的参数到一个数组中
    const { name: timerId = 'toggleShowLayerTimer' } = this.constructor

    return (...arg) => {
      if (this[timerId]) clearTimeout(this[timerId])
      this[timerId] = setTimeout(() => {
        // 通过apply绑定this和传递参数，apply第二个参数正好是传数组嘛
        fn.apply(this, arg)
      }, delay)
    }
  }

  /**
   * 安全的异步请求包装器
   * @param {Function} requestFn 请求函数，接收signal参数
   * @param {string} requestKey 请求标识符，用于状态管理
   * @returns {Promise} 请求结果
   */
  async safeRequest(requestFn, requestKey = 'default') {
    // 如果同类型请求正在进行，先取消
    if (this.loadingStates.has(requestKey)) {
      const existingController = this.loadingStates.get(requestKey)
      existingController.abort()
      this.loadingStates.delete(requestKey)
    }

    const controller = new AbortController()
    this.activeRequests.add(controller)
    this.loadingStates.set(requestKey, controller)
    this.isLoading = true

    try {
      const result = await requestFn(controller.signal)
      
      // 检查请求是否被取消
      if (controller.signal.aborted) {
        throw new Error('Request was aborted')
      }
      
      return result
    } catch (error) {
      if (error.name === 'AbortError' || error.message === 'Request was aborted') {
        console.log(`Request ${requestKey} was cancelled`)
        return null
      }
      throw error
    } finally {
      this.activeRequests.delete(controller)
      this.loadingStates.delete(requestKey)
      
      // 如果没有活跃请求，更新loading状态
      if (this.activeRequests.size === 0) {
        this.isLoading = false
      }
    }
  }

  /**
   * 取消指定类型的请求
   * @param {string} requestKey 请求标识符
   */
  cancelRequest(requestKey) {
    if (this.loadingStates.has(requestKey)) {
      const controller = this.loadingStates.get(requestKey)
      controller.abort()
      this.loadingStates.delete(requestKey)
      console.log(`Request ${requestKey} cancelled`)
    }
  }

  /**
   * 取消所有活跃的请求
   */
  cancelAllRequests() {
    this.activeRequests.forEach(controller => {
      controller.abort()
    })
    this.activeRequests.clear()
    this.loadingStates.clear()
    this.isLoading = false
    console.log('All requests cancelled')
  }

  /**
   * 获取当前请求状态
   * @returns {Object} 包含loading状态和活跃请求数量的对象
   */
  getRequestStatus() {
    return {
      isLoading: this.isLoading,
      activeRequestCount: this.activeRequests.size,
      activeRequestKeys: Array.from(this.loadingStates.keys())
    }
  }

  /**
   * 检查指定请求是否正在进行
   * @param {string} requestKey 请求标识符
   * @returns {boolean}
   */
  isRequestActive(requestKey) {
    return this.loadingStates.has(requestKey)
  }

  /**
   * 带超时的安全请求
   * @param {Function} requestFn 请求函数
   * @param {string} requestKey 请求标识符
   * @param {number} timeout 超时时间（毫秒）
   * @returns {Promise}
   */
  async safeRequestWithTimeout(requestFn, requestKey = 'default', timeout = 30000) {
    return this.safeRequest(async (signal) => {
      // 创建超时Promise
      const timeoutPromise = new Promise((_, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Request ${requestKey} timeout after ${timeout}ms`))
        }, timeout)
        
        // 如果请求被取消，清除超时
        signal.addEventListener('abort', () => {
          clearTimeout(timeoutId)
        })
      })

      // 竞争：请求 vs 超时
      return Promise.race([
        requestFn(signal),
        timeoutPromise
      ])
    }, requestKey)
  }

  /**
   * 销毁方法，清理所有资源
   */
  destroy() {
    // 取消所有请求
    this.cancelAllRequests()
    
    // 清理其他资源
    this.closePointPopup()
    
    // 重置状态
    this._hasLoaded = false
    this.map = null
    this.options = null
  }

  _throwNotImplementationError() {
    throw new Error('method not implementation.')
  }
}
