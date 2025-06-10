// mapEventBus.js
import mitt from 'mitt'

class MapEventBus {
  constructor() {
    this.emitter = mitt()
    this.instanceHandlers = new WeakMap()
  }

  // 为实例注册事件，自动管理生命周期
  on(instance, eventName, handler) {
    if (!this.instanceHandlers.has(instance)) {
      this.instanceHandlers.set(instance, [])
    }

    const boundHandler = handler.bind(instance)
    this.instanceHandlers.get(instance).push({ eventName, handler: boundHandler })
    this.emitter.on(eventName, boundHandler)

    return boundHandler
  }

  emit(eventName, data) {
    this.emitter.emit(eventName, data)
  }

  // 自动清理实例的所有事件监听
  cleanup(instance) {
    const handlers = this.instanceHandlers.get(instance)
    if (handlers) {
      handlers.forEach(({ eventName, handler }) => {
        this.emitter.off(eventName, handler)
      })
      this.instanceHandlers.delete(instance)
    }
  }

  // 获取调试信息
  getDebugInfo() {
    return {
      allEvents: Object.keys(this.emitter.all),
      instanceCount: this.instanceHandlers.size,
    }
  }
}

export default new MapEventBus()

// photoLayer.js
import mapEventBus from './mapEventBus'

class PhotoLayer extends BaseLayer {
  init(map) {
    super.init(map, false)

    // 使用改进的事件总线
    mapEventBus.on(this, 'updatePhotoMarkers', this.updatePhotoMarkers)
    mapEventBus.on(this, 'updateAlbumMarkers', this.updateAlbumMarkers)
    mapEventBus.on(this, 'switchMapMode', this.switchMapMode)
  }

  destroy() {
    // 一键清理所有事件监听
    mapEventBus.cleanup(this)
    super.destroy()
  }
}
