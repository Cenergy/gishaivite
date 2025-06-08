function deepCopy(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return obj
  }
  let copy = Array.isArray(obj) ? [] : {}
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      Reflect.set(copy, key, deepCopy(obj[key]))
    }
  }
  return copy
}

class EventBus {
  eventHandlers = null

  constructor() {
    this.eventHandlers = new Map()
  }

  /**
   * 给指定事件类型添加回调函数
   * @param {string} eventName 事件类型
   * @param {Function} callback 回调函数
   */
  on(eventName, callback) {
    const eventListenerList = this.getEventListener(eventName) ?? []
    eventListenerList.push(callback)
    this.setEventListener(eventName, eventListenerList)
    // this.eventHandlers.set(eventName, eventListenerList)
  }

  /**
   * 给指定事件类型删除回调函数
   * @param {string} eventName 事件类型
   * @param {Function} callback 回调函数
   * @returns {Boolean} 是否删除成功
   */
  off(eventName, callback) {
    const eventListenerList = this.getEventListener(eventName)
    if (eventListenerList === null) {
      return false
    }
    const idx = eventListenerList.indexOf(callback)
    if (idx < 0) {
      return false
    }
    eventListenerList.splice(idx, 1)
    return true
  }

  offAll(eventName) {
    this.setEventListener(eventName, [])
  }

  /**
   * 触发指定事件
   * @param {string} eventName 事件类型
   * @param  {...any} args 回调函数参数
   */
  emit(eventName, ...args) {
    const _args = deepCopy(args)
    const eventListenerList = this.getEventListener(eventName)
    if (eventListenerList === null) {
      return undefined
    }
    for (let listener of eventListenerList) {
      try {
        listener(..._args)
      } catch (e) {
        console.error(`${eventName}:Error`, e)
      }
    }
  }

  /**
   * 获取某个事件的全部回调函数
   * @param {string} eventName 事件类型
   * @returns {null|Array<Function>} 回调函数列表
   */
  getEventListener(eventName) {
    const eventListener = this.eventHandlers.get(eventName)
    if (eventListener === undefined) {
      return null
    } else {
      return eventListener
    }
  }

  /**
   * 设置某个事件的监听列表
   * @param {string} eventName 事件类型
   * @param {Array<Function>} callbacks 回调函数列表
   */
  setEventListener(eventName, callbacks) {
    this.eventHandlers.set(eventName, callbacks)
  }
}

const eventBus = new EventBus()

export default eventBus
