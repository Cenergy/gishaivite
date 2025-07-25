import eventBus from '@/utils/EventBus';

export default class BaseLayer {
  constructor() {
    this.pulseIdList = [];
    this.eventListeners = [];
    
    // 自动包装 destroy 方法，确保事件监听器总是被清理
    this._wrapDestroy();
  }
  init(map,options) {
    // 假如是相同的处理类型，则注入
    this.map = map;
    this.options = options;
    this._id = crypto.randomUUID();
    this._hasLoaded = false;
    this.timeInterval = 10 * 1000;
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
    // 严格检查地图实例和必要方法
    if (!this.map || typeof this.map.animateTo !== 'function') {
      console.warn('BaseLayer: Map instance not properly initialized');
      return;
    }
    
    try {
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
    } catch (error) {
      console.error('BaseLayer: Error in goHome:', error);
      // 降级处理：直接设置中心点和缩放级别
      try {
        const initialCenter = this.options?.center || [116.4074, 39.9042];
        const initialZoom = this.options?.zoom || 5;
        
        if (typeof this.map.setCenter === 'function') {
          this.map.setCenter(initialCenter);
        }
        if (typeof this.map.setZoom === 'function') {
          this.map.setZoom(initialZoom);
        }
      } catch (fallbackError) {
        console.error('BaseLayer: Fallback setCenter/setZoom also failed:', fallbackError);
      }
    }
  }


  openPointPopup({ content = '', component, latlng, options = {} }) {
    // TODO: 使用MapTalks的UI组件实现弹窗
    // MapTalks使用InfoWindow或自定义UI组件
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
  }
  showPulse(id) {
    // TODO: 使用MapTalks实现脉冲效果的显示
  }

  _setLegend(visible) {
    this._throwNotImplementationError()
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
   * 添加事件监听器
   * @param {string} event 事件名
   * @param {function} handler 处理函数
   */
  addEventListeners(listeners) {
    if (Array.isArray(listeners)) {
      listeners.forEach(({ event, handler }) => {
        eventBus.on(event, handler);
        this.eventListeners.push({ event, handler });
      });
    }
  }

  /**
   * 包装 destroy 方法，确保事件监听器总是被清理
   * @private
   */
  _wrapDestroy() {
    const originalDestroy = this.destroy;
    this.destroy = function() {
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
   * 销毁图层 - 子类可以重写此方法，事件监听器会自动清理
   */
  destroy() {
    // 子类可以重写此方法来添加自己的清理逻辑
    // 事件监听器的清理会在 _wrapDestroy 中自动处理
  }

  _throwNotImplementationError() {
    throw new Error('method not implementation.')
  }
}
