import BaseMapBus from './base'
import eventBus from '@/utils/EventBus'
import * as layers from '../layers'

// 复选框中label与layer对象的关系
/**
 * 首页中的地图业务类
 */
class MapBus extends BaseMapBus {
  constructor(options) {
    super(options)
  }
  /**
   * 一进入地图需要加载的函数
   */
  startup() {
    // 初始化地图
    const mapInstance = this.init({
      center: [116.4074, 39.9042], // 默认中心点（北京）
      zoom: 5,
    })
    // 开启事件监听
    this.subscribe()
    // 首页显示的内容
    return mapInstance
  }
  /**
   * 监听DOM串联地图的事件
   */
  subscribe() {
    // 监听的是右侧列表中的定位
    eventBus.on('mapLocate', (res) => {
      this._mapLocate(res)
    })

    // 监听的是复选框的状态
    // eventBus.on("checkboxMapChange", (options) => {
    //   this._checkboxMapChange(options);
    // });
    // 监听的是复选框的状态
    eventBus.on('addMapLayer', (checkItem = {}) => {
      const checkObject = { checkItem, checkStatus: true }
      this._checkboxMapChange(checkObject)
      console.log('🚀 ~ MapBus ~ eventBus.on ~ checkObject:', checkObject)
    })
    // 监听的是复选框的状态
    eventBus.on('removeMapLayer', (checkItem = {}) => {
      console.log('🚀 ~ MapBus ~ eventBus.on ~ checkItem:', checkItem)
      const checkObject = { checkItem, checkStatus: false }
      this._checkboxMapChange(checkObject)
    })
  }

  /**
   * 复选框变化函数
   * @param {Object} options
   * @returns
   */
  _checkboxMapChange(options = {}) {}

  /**
   * 定位的实现
   */
  _mapLocate(res) {}
}
export default new MapBus()
