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
import { getGeoWorkerManager } from '@/utils/GeoWorkerManager'
import EventBus from '@/utils/EventBus'

export default class BaseMapBus {
  constructor() {
    this.geoWorker = getGeoWorkerManager()
    this.eventBus = EventBus
    this.isProcessingGeoData = false
  }
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

  // 使用 Web Worker 处理大量地理数据
  async processGeoDataWithWorker(geoData, options = {}) {
    if (this.isProcessingGeoData) {
      console.warn('Already processing geo data, please wait...')
      return null
    }

    this.isProcessingGeoData = true
    this.eventBus.emit('geoProcessingStart')

    try {
      const result = await this.geoWorker.processGeoJSON(geoData, options)
      this.eventBus.emit('geoProcessingComplete', result)
      return result
    } catch (error) {
      console.error('Geo data processing failed:', error)
      this.eventBus.emit('geoProcessingError', error)
      throw error
    } finally {
      this.isProcessingGeoData = false
    }
  }

  // 聚类点数据
  async clusterPointsWithWorker(points, options = {}) {
    try {
      const result = await this.geoWorker.clusterPoints(points, options)
      return result
    } catch (error) {
      console.error('Point clustering failed:', error)
      throw error
    }
  }

  // 批量处理多个 GeoJSON 文件
  async batchProcessGeoData(geoDataList, options = {}) {
    if (this.isProcessingGeoData) {
      console.warn('Already processing geo data, please wait...')
      return null
    }

    this.isProcessingGeoData = true
    this.eventBus.emit('batchProcessingStart')

    try {
      const results = await this.geoWorker.batchProcess(geoDataList, options)
      this.eventBus.emit('batchProcessingComplete', results)
      return results
    } catch (error) {
      console.error('Batch processing failed:', error)
      this.eventBus.emit('batchProcessingError', error)
      throw error
    } finally {
      this.isProcessingGeoData = false
    }
  }

  // 判断是否应该使用 Worker 处理数据
  shouldUseWorker(geoData) {
    if (!geoData || !geoData.features) return false
    
    const featureCount = geoData.features.length
    const estimatedSize = JSON.stringify(geoData).length
    
    // 超过 1000 个要素或文件大小超过 1MB 时使用 Worker
    return featureCount > 1000 || estimatedSize > 1024 * 1024
  }

  // 获取 Worker 状态
  getWorkerStatus() {
    return {
      isProcessing: this.isProcessingGeoData,
      workerReady: this.geoWorker.isReady()
    }
  }
}
