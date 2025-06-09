import {
  Map,
  GroupGLLayer,
  VectorTileLayer,
  TileLayer,
  GLTFMarker,
  Marker,
  GLTFLayer,
  VectorLayer,
  PolygonLayer,
  ui,
} from 'maptalks-gl'

import 'maptalks-gl/dist/maptalks-gl.css'
import * as entities from '../layers'

export default class BaseMapBus {
  constructor() {}
  init(options) {
    this.options = options
    const map = this._createMap(options)
    this.map = map
    Object.keys(entities).map((key) => {
      if (!entities[key]) return
      if (!entities[key].init) return
      entities[key].init(this.map,options)
    })
    return this.map
  }

  _createMap(options) {
    const { center = [116.4074, 39.9042], zoom = 5 } = options || {}
    this.map = new Map('map', {
      center: center,
      zoom: zoom,
      baseLayer: new TileLayer('base', {
        urlTemplate:
          'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
        subdomains: ['a', 'b', 'c', 'd'],
      }),
    })

    const vtLayer = new VectorTileLayer('vt', {
      urlTemplate: 'http://tile.maptalks.com/test/planet-single/{z}/{x}/{y}.mvt',
    })

    const groupLayer = new GroupGLLayer('group', [vtLayer]).addTo(this.map)

    const gltfLayer = new GLTFLayer('gltflayer')
    groupLayer.addLayer(gltfLayer)

    const polygonLayer = new PolygonLayer('polygonlayer')
    groupLayer.addLayer(polygonLayer)

    // 创建标记图层
    this.markerLayer = new VectorLayer('markers').addTo(this.map)

    // 触发地图初始化完成事件
    return this.map
  }
  destroy() {
    this.map && this.map.remove()
  }

  // 底图切换方法
  switchBaseLayer(layerType) {
    if (!this.baseLayers || !this.baseLayers[layerType]) return

    // 隐藏所有底图
    Object.values(this.baseLayers).forEach((layer) => {
      layer.hide()
    })

    // 显示指定底图
    this.baseLayers[layerType].show()
  }

  layerControl(options = {}) {
    const { group, visible, name } = options
    if (!group) return

    if (this.layerMap.has(group)) {
      const groupMap = this.layerMap.get(group)
      groupMap.set(name, visible)
    } else {
      const groupMapTemp = new Map()
      groupMapTemp.set(name, visible)
      this.layerMap.set(group, groupMapTemp)
    }
  }

  // 获取地图实例
  getMap() {
    return this.map
  }

  // 添加图层
  addLayer(layer) {
    if (this.map && layer) {
      this.map.addLayer(layer)
    }
  }

  // 移除图层
  removeLayer(layer) {
    if (this.map && layer) {
      this.map.removeLayer(layer)
    }
  }
}
