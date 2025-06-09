// utils/SafeEventBus.js
class SafeEventBus {
  constructor() {
    this.events = new Map()
    this.componentListeners = new WeakMap()
  }

  // 自动管理组件生命周期
  bindComponent(component) {
    if (!this.componentListeners.has(component)) {
      this.componentListeners.set(component, new Set())
    }

    return {
      on: (event, handler) => {
        this.on(event, handler)
        this.componentListeners.get(component).add({ event, handler })
      },

      // 组件销毁时自动清理
      destroy: () => {
        const listeners = this.componentListeners.get(component)
        if (listeners) {
          listeners.forEach(({ event, handler }) => {
            this.off(event, handler)
          })
          this.componentListeners.delete(component)
        }
      },
    }
  }

  on(event, handler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }
    this.events.get(event).add(handler)
  }

  off(event, handler) {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.delete(handler)
      if (handlers.size === 0) {
        this.events.delete(event)
      }
    }
  }

  emit(event, data) {
    const handlers = this.events.get(event)
    if (handlers) {
      handlers.forEach((handler) => handler(data))
    }
  }
}

export default new SafeEventBus()
