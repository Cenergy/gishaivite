// utils/SafeEventBus.js
class SafeEventBus {
  constructor() {
    this.events = new Map()
    this.componentListeners = new WeakMap()
  }

  on(event, callback, component) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event).add(callback)

    // 记录组件的监听器
    if (component) {
      if (!this.componentListeners.has(component)) {
        this.componentListeners.set(component, new Set())
      }
      this.componentListeners.get(component).add({ event, callback })

      // 组件卸载时自动清理
      onUnmounted(() => {
        this.cleanupComponent(component)
      })
    }
  }

  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback)
    }
  }

  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach((callback) => callback(data))
    }
  }

  cleanupComponent(component) {
    const listeners = this.componentListeners.get(component)
    if (listeners) {
      listeners.forEach(({ event, callback }) => {
        this.off(event, callback)
      })
      this.componentListeners.delete(component)
    }
  }
}
