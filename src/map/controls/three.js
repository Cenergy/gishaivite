import BaseMapBus from './base'
import eventBus from '@/utils/EventBus'

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
    this.init({
      center:[113.97790555555555, 22.660430555555557], // 默认中心点
      zoom: 10,
    })
    // 开启事件监听
    this.subscribe()
    // 首页显示的内容
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
    })
    // 监听的是复选框的状态
    eventBus.on('removeMapLayer', (checkItem = {}) => {
      const checkObject = { checkItem, checkStatus: false }
      this._checkboxMapChange(checkObject)
    })
  }

  /**
   * 复选框变化函数
   * @param {Object} options
   * @returns
   */
  _checkboxMapChange() {}

  /**
   * 定位的实现
   */
  _mapLocate() {}
}
export default new MapBus()
