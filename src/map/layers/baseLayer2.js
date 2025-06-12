import eventBus from '../../utils/EventBus.js';

export default class BaseLayer {
  constructor() {
    this.pulseIdList = [];
    this.eventListeners = [];

    // 自动包装 destroy 方法，确保事件监听器总是被清理
    this._wrapDestroy();
    this.pulseIdList = [];
    this._id = crypto.randomUUID();
    // 异步请求管理
    this.activeRequests = new Set();
    this.isLoading = false;
    this.loadingStates = new Map();
    
    // 复杂操作状态管理
    this.isRendering = false;
    this.currentOperation = null;
    this.operationLock = false;
    
    // 取消控制器
    this.requestController = null;
    this.renderController = null;
    
    // 自动注册事件监听器
    this._autoRegisterEvents();
  }
  init(map, options) {
    // 假如是相同的处理类型，则注入
    this.map = map;
    this.options = options;

    this._hasLoaded = false;
    this.timeInterval = 10 * 1000;
    // 初始化请求管理状态
    this.activeRequests.clear();
    this.isLoading = false;
    this.loadingStates.clear();
  }
  get id() {
    return this._id;
  }
  get hasLoaded() {
    return this._hasLoaded;
  }
  set hasLoaded(status) {
    this._hasLoaded = Boolean(status);
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
      },
    );
  }

  openPointPopup({ content = '', component, latlng, options = {} }) {
    // TODO: 使用MapTalks的UI组件实现弹窗
    // MapTalks使用InfoWindow或自定义UI组件
    console.log('openPointPopup called with:', { content, latlng, options });
  }
  closePointPopup() {
    this.popup && this.popup.close();
    this.popup = null;
  }

  setVisible(visible, options = {}) {
    if (visible) {
      this._debounce(this.show.bind(this), 200)(options);
    } else {
      this._debounce(this.hide.bind(this), 200)(options);
    }
  }

  async show(options) {
    // 防止并发操作
    if (this.operationLock) {
      console.log('Operation in progress, cancelling previous operation...');
      await this.cancelCurrentOperation();
    }
    
    this.operationLock = true;
    this.currentOperation = 'show';
    
    try {
      // 阶段1: 数据请求
      const data = await this.performDataRequest(options);
      if (data === null) {
        console.log('Data request was cancelled');
        return;
      }
      
      // 阶段2: 渲染处理
      const renderResult = await this.performRendering(data, options);
      if (renderResult === null) {
        console.log('Rendering was cancelled');
        return;
      }
      
      console.log('Show operation completed successfully');
      this.onShowComplete(renderResult);
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Show operation was aborted');
      } else {
        console.error('Show operation failed:', error);
        this.onShowError(error);
      }
    } finally {
      this.cleanup();
    }
  }
  
  _showCore(options) {
    // 子类可以重写此方法来实现简单的显示逻辑
    // 如果不需要复杂的异步操作，可以直接重写此方法
    this._throwNotImplementationError();
  }

  async hide(options) {
    this._visible = false;
    
    // 取消当前操作
    await this.cancelCurrentOperation();
    
    // 清理已渲染的内容
    this.clearRenderedContent();
    
    // 调用子类的隐藏逻辑
    this._hideCore(options);
    
    console.log('Hide operation completed');
  }

  _hideCore(options) {
    // 子类可以重写此方法来实现简单的隐藏逻辑
    // 默认情况下不需要实现
  }

  setLegend(visible) {
    if (!this.legend) return;
    this._setLegend(visible);
  }

  hidePulse(id) {
    // TODO: 使用MapTalks实现脉冲效果的隐藏
    console.log('hidePulse called with id:', id);
  }
  showPulse(id) {
    // TODO: 使用MapTalks实现脉冲效果的显示
    console.log('showPulse called with id:', id);
  }

  _setLegend(visible) {
    this._throwNotImplementationError();
  }

  /**
   *  防抖函数，频繁调用时，使用它
   * @param {*} fn 回调函数
   * @param {*} delay 防抖时间
   * @returns {void}
   */
  _debounce(fn, delay) {
    // 所以这个函数就可以使用...运算符收集js自动添加的参数到一个数组中
    const { name: timerId = 'toggleShowLayerTimer' } = this.constructor;

    return (...arg) => {
      if (this[timerId]) clearTimeout(this[timerId]);
      this[timerId] = setTimeout(() => {
        // 通过apply绑定this和传递参数，apply第二个参数正好是传数组嘛
        fn.apply(this, arg);
      }, delay);
    };
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
      const existingController = this.loadingStates.get(requestKey);
      existingController.abort();
      this.loadingStates.delete(requestKey);
    }

    const controller = new AbortController();
    this.activeRequests.add(controller);
    this.loadingStates.set(requestKey, controller);
    this.isLoading = true;

    try {
      const result = await requestFn(controller.signal);

      // 检查请求是否被取消
      if (controller.signal.aborted) {
        throw new Error('Request was aborted');
      }

      return result;
    } catch (error) {
      if (error.name === 'AbortError' || error.message === 'Request was aborted') {
        console.log(`Request ${requestKey} was cancelled`);
        return null;
      }
      throw error;
    } finally {
      this.activeRequests.delete(controller);
      this.loadingStates.delete(requestKey);

      // 如果没有活跃请求，更新loading状态
      if (this.activeRequests.size === 0) {
        this.isLoading = false;
      }
    }
  }

  /**
   * 包装 destroy 方法，确保事件监听器总是被清理
   * @private
   */
  _wrapDestroy() {
    const originalDestroy = this.destroy;
    this.destroy = function () {
      // 先清理事件监听器
      if (this.eventListeners && this.eventListeners.length > 0) {
        this.eventListeners.forEach(({ event, handler }) => {
          eventBus.off(event, handler);
        });
        this.eventListeners = [];
      }

      // 再调用原始的 destroy 方法
      return originalDestroy.apply(this, arguments);
    };
  }

  /**
   * 执行数据请求阶段
   * @param {Object} options 选项参数
   * @returns {Promise<Object|null>} 请求结果或null（如果被取消）
   */
  async performDataRequest(options) {
    if (this.currentOperation !== 'show') return null;
    
    console.log('Starting data request...');
    this.isLoading = true;
    this.requestController = new AbortController();
    
    try {
      const data = await this.safeRequest(async (signal) => {
        return await this.fetchData(signal, options);
      }, `${this.id}_request`);
      
      return data;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Data request aborted');
        return null;
      }
      throw error;
    } finally {
      this.isLoading = false;
      this.requestController = null;
    }
  }

  /**
   * 执行渲染阶段
   * @param {Object} data 要渲染的数据
   * @param {Object} options 选项参数
   * @returns {Promise<Object|null>} 渲染结果或null（如果被取消）
   */
  async performRendering(data, options) {
    if (this.currentOperation !== 'show') return null;
    
    console.log('Starting rendering...');
    this.isRendering = true;
    this.renderController = new AbortController();
    
    try {
      const result = await this.safeRequest(async (signal) => {
        return await this.executeRendering(data, signal, options);
      }, `${this.id}_render`);
      
      return result;
      
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Rendering aborted');
        return null;
      }
      throw error;
    } finally {
      this.isRendering = false;
      this.renderController = null;
    }
  }

  /**
   * 取消当前操作
   */
  async cancelCurrentOperation() {
    if (!this.operationLock) return;
    
    console.log('Cancelling current operation...');
    
    // 标记操作为取消
    this.currentOperation = null;
    
    // 取消请求
    if (this.isLoading && this.requestController) {
      this.cancelRequest(`${this.id}_request`);
      this.requestController.abort();
    }
    
    // 取消渲染
    if (this.isRendering && this.renderController) {
      this.cancelRequest(`${this.id}_render`);
      this.renderController.abort();
    }
    
    // 等待操作完全停止
    let attempts = 0;
    while ((this.isLoading || this.isRendering) && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 10));
      attempts++;
    }
    
    console.log('Current operation cancelled');
  }

  /**
   * 清理操作状态
   */
  cleanup() {
    this.operationLock = false;
    this.currentOperation = null;
    this.isLoading = false;
    this.isRendering = false;
    this.requestController = null;
    this.renderController = null;
  }

  /**
   * 取消指定的请求
   * @param {string} requestKey 请求标识符
   */
  cancelRequest(requestKey) {
    if (this.loadingStates.has(requestKey)) {
      const controller = this.loadingStates.get(requestKey);
      controller.abort();
      this.loadingStates.delete(requestKey);
    }
  }

  /**
   * 自动注册事件监听器
   * @private
   */
  _autoRegisterEvents() {
    // 延迟执行，确保子类构造函数已完成
    Promise.resolve().then(() => {
      if (typeof this.getEventConfig === 'function') {
        const eventConfig = this.getEventConfig();
        if (eventConfig && Array.isArray(eventConfig)) {
          eventConfig.forEach(({ event, handler }) => {
            if (event && handler) {
              eventBus.on(event, handler);
              this.eventListeners.push({ event, handler });
            }
          });
        }
      }
    });
  }

  // 以下方法供子类重写，实现具体的业务逻辑
  
  /**
   * 获取数据 - 子类应重写此方法
   * @param {AbortSignal} signal 取消信号
   * @param {Object} options 选项参数
   * @returns {Promise<Object>} 数据
   */
  async fetchData(signal, options) {
    // 子类应重写此方法来实现具体的数据获取逻辑
    throw new Error('fetchData method must be implemented by subclass');
  }

  /**
   * 执行渲染 - 子类应重写此方法
   * @param {Object} data 数据
   * @param {AbortSignal} signal 取消信号
   * @param {Object} options 选项参数
   * @returns {Promise<Object>} 渲染结果
   */
  async executeRendering(data, signal, options) {
    // 子类应重写此方法来实现具体的渲染逻辑
    throw new Error('executeRendering method must be implemented by subclass');
  }

  /**
   * 显示完成回调 - 子类可重写此方法
   * @param {Object} result 显示结果
   */
  onShowComplete(result) {
    // 子类可以重写此方法来处理显示完成后的逻辑
    console.log('Show completed:', result);
  }

  /**
   * 显示错误回调 - 子类可重写此方法
   * @param {Error} error 错误信息
   */
  onShowError(error) {
    // 子类可以重写此方法来处理显示错误的逻辑
    console.error('Show error:', error);
  }

  /**
   * 清理已渲染的内容 - 子类可重写此方法
   */
  clearRenderedContent() {
    // 子类可以重写此方法来实现具体的内容清理逻辑
    console.log('Clearing rendered content');
  }

  /**
   * 销毁图层 - 子类可以重写此方法，事件监听器会自动清理
   */
  async destroy() {
    console.log('Destroying layer');
    
    // 取消所有操作
    await this.cancelCurrentOperation();
    
    // 清理内容
    this.clearRenderedContent();
    
    // 取消所有活跃请求
    this.activeRequests.forEach(controller => {
      controller.abort();
    });
    this.activeRequests.clear();
    this.loadingStates.clear();
    
    // 子类可以重写此方法来添加自己的清理逻辑
    // 事件监听器的清理会在 _wrapDestroy 中自动处理
  }

  _throwNotImplementationError() {
    throw new Error('method not implementation.');
  }
}
