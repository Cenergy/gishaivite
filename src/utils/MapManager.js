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

/**
 * 地图管理器类
 * 负责地图的初始化、标记管理、事件处理等逻辑
 */
export class MapManager {
  constructor(containerId, options = {}) {
    this.containerId = containerId
    this.map = null
    this.markerLayer = null
    this.eventBus = new EventTarget()
    this.options = {
      center: [116.4074, 39.9042], // 默认中心点（北京）
      zoom: 5,
      ...options
    }
  }

  /**
   * 初始化地图
   */
  init() {
    if (!this.containerId) {
      return
    }

    this.map = new Map(this.containerId, {
      center: this.options.center,
      zoom: this.options.zoom,
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
    this.emit('map-initialized', { map: this.map })
  }

  /**
   * 添加相册标记
   */
  addAlbumMarkers(albums) {
    if (!this.markerLayer) return

    const validCoordinates = []

    albums.forEach((album) => {
      // 使用第一张照片的坐标作为相册坐标
      if (!album.photos || album.photos.length === 0 || !album.photos[0].coordinates) return

      const coordinates = album.photos[0].coordinates
      validCoordinates.push(coordinates)

      // 创建标记
      const marker = new Marker(coordinates, {
        symbol: {
          markerType: 'pin',
          markerFill: '#ff6b6b', // 相册使用不同颜色
          markerLineColor: '#fff',
          markerLineWidth: 2,
          markerWidth: 35,
          markerHeight: 45,
        },
      })

      // 创建信息窗口
      const infoWindow = new ui.InfoWindow({
        title: album.title,
        content: `
          <div class="map-popup-content">
            <img src="${album.coverUrl}" alt="${album.title}" style="width:100%;max-height:150px;object-fit:cover;" />
            <div class="popup-info">
              <p>${album.description}</p>
              <p><small>照片数量: ${album.photos.length}</small></p>
              <button class="popup-view-btn" data-album-id="${album.id}">查看相册</button>
            </div>
          </div>
        `,
      })

      // 点击标记显示信息窗口
      marker.on('click', (e) => {
        infoWindow.addTo(this.map).show(coordinates)

        // 为查看按钮添加点击事件
        setTimeout(() => {
          const viewBtn = document.querySelector('.popup-view-btn')
          if (viewBtn) {
            viewBtn.addEventListener('click', () => {
              this.emit('album-selected', album)
              infoWindow.remove()
            })
          }
        }, 100)
      })

      // 添加到图层
      marker.addTo(this.markerLayer)
    })

    // 智能定位
    this.updateMapView(validCoordinates)
  }

  /**
   * 添加照片标记
   */
  addPhotoMarkers(photos) {
    if (!this.markerLayer) return

    const validCoordinates = []

    photos.forEach((photo) => {
      if (!photo.coordinates) return

      validCoordinates.push(photo.coordinates)

      // 创建标记
      const marker = new Marker(photo.coordinates, {
        symbol: {
          markerType: 'pin',
          markerFill: '#1890ff',
          markerLineColor: '#fff',
          markerLineWidth: 2,
          markerWidth: 30,
          markerHeight: 40,
        },
      })

      // 创建信息窗口
      const infoWindow = new ui.InfoWindow({
        title: photo.title,
        content: `
          <div class="map-popup-content">
            <img src="${photo.url}" alt="${photo.title}" style="width:100%;max-height:150px;object-fit:cover;" />
            <p>${photo.description}</p>
            <p><small>${photo.date} · ${photo.location}</small></p>
          </div>
        `,
        width: 300,
        height: 'auto',
        autoCloseOn: 'click',
        autoOpenOn: 'click',
      })

      // 将信息窗口添加到标记
      marker.setInfoWindow(infoWindow)

      // 将标记添加到图层
      this.markerLayer.addGeometry(marker)

      // 触发照片标记点击事件
      marker.on('click', () => {
        this.emit('photo-selected', photo)
      })
    })

    // 智能定位
    this.updateMapView(validCoordinates)
  }

  /**
   * 清除所有标记
   */
  clearMarkers() {
    if (this.markerLayer) {
      this.markerLayer.clear()
    }
  }

  /**
   * 智能定位地图视图
   */
  updateMapView(coordinates) {
    if (!this.map) return

    if (coordinates.length === 0) {
      // 没有有效坐标，定位到默认中心点
      this.map.setCenter([116.4074, 39.9042])
      this.map.setZoom(5)
    } else if (coordinates.length === 1) {
      // 只有一个坐标，定位到该点
      this.map.setCenter(coordinates[0])
      this.map.setZoom(12)
    } else {
      // 多个坐标，使用 fitExtent 自适应显示所有点
      try {
        // 计算边界
        let minLng = coordinates[0][0], maxLng = coordinates[0][0]
        let minLat = coordinates[0][1], maxLat = coordinates[0][1]
        
        coordinates.forEach(coord => {
          minLng = Math.min(minLng, coord[0])
          maxLng = Math.max(maxLng, coord[0])
          minLat = Math.min(minLat, coord[1])
          maxLat = Math.max(maxLat, coord[1])
        })
        
        // 添加一些边距
        const padding = 0.01
        const extent = [
          minLng - padding,
          minLat - padding,
          maxLng + padding,
          maxLat + padding
        ]
        
        this.map.fitExtent(extent, 0, { animation: true })
      } catch (error) {
        // fitExtent失败，使用第一个坐标的中心点
        this.map.setCenter(coordinates[0])
        this.map.setZoom(10)
      }
    }

    // 触发地图视图更新事件
    this.emit('map-view-updated', { coordinates })
  }

  /**
   * 更新标记数据
   */
  updateMarkers(data, isAlbumMode = false) {
    this.clearMarkers()
    
    if (isAlbumMode) {
      this.addAlbumMarkers(data)
    } else {
      this.addPhotoMarkers(data)
    }

    // 触发标记更新事件
    this.emit('markers-updated', { data, isAlbumMode })
  }

  /**
   * 销毁地图
   */
  destroy() {
    if (this.map) {
      this.map.remove()
      this.map = null
      this.markerLayer = null
    }
    
    // 触发地图销毁事件
    this.emit('map-destroyed')
  }

  /**
   * 事件发射器
   */
  emit(eventName, data) {
    const event = new CustomEvent(eventName, { detail: data })
    this.eventBus.dispatchEvent(event)
  }

  /**
   * 事件监听器
   */
  on(eventName, callback) {
    this.eventBus.addEventListener(eventName, callback)
  }

  /**
   * 移除事件监听器
   */
  off(eventName, callback) {
    this.eventBus.removeEventListener(eventName, callback)
  }

  /**
   * 获取地图实例
   */
  getMap() {
    return this.map
  }

  /**
   * 获取标记图层
   */
  getMarkerLayer() {
    return this.markerLayer
  }
}