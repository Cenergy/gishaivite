// 使用浏览器原生的crypto.randomUUID()替代uuid
import eventBus from '@/utils/SafeEventBus'
export default class BaseLayer {
  constructor() {
    this.pulseIdList = []
    // 绑定组件，自动管理生命周期
    this.eventBus = eventBus.bindComponent(this)
  }
  init(map, isSmallMap) {
    // 假如是相同的处理类型，则注入
    if (isSmallMap !== Boolean(this.isSmallMap)) return
    this.map = map
    this._id = crypto.randomUUID()
    this._hasLoaded = false
    this.timeInterval = 10 * 1000
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

  destroy() {
    // 自动清理所有事件监听
    this.eventBus.destroy()
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

  _throwNotImplementationError() {
    throw new Error('method not implementation.')
  }
}
