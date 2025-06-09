// utils/SafeEventBus.js
import { getCurrentInstance, onUnmounted } from 'vue'

class SafeEventBus {
  constructor() {
    this.events = new Map()
    this.componentListeners = new WeakMap()
  }

  on(event, callback) {
    const instance = getCurrentInstance()

    if (!this.events.has(event)) {
      this.events.set(event, new Set())
    }

    this.events.get(event).add(callback)

    // 自动注册清理函数
    if (instance) {
      if (!this.componentListeners.has(instance)) {
        this.componentListeners.set(instance, [])

        onUnmounted(() => {
          const listeners = this.componentListeners.get(instance)
          listeners.forEach(({ event, callback }) => {
            this.off(event, callback)
          })
        })
      }

      this.componentListeners.get(instance).push({ event, callback })
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
}

export default new SafeEventBus()
