import BaseLayer from './baseLayer'
import { VectorLayer, Marker, ui } from 'maptalks-gl'
import eventBus from '@/utils/EventBus'

class PhotoLayer extends BaseLayer {
  constructor(options = {}) {
    super(options)
    this.markerLayer = null
    this.photos = []
    this.albums = []
    this.isAlbumMode = false
    this.infoWindow = null
  }

  init(map) {
    super.init(map, false)
    // 创建标记图层
    this.markerLayer = new VectorLayer('photo-markers')
    this.map.addLayer(this.markerLayer)

    // 监听EventBus事件
    this.setupEventListeners()
  }

  setupEventListeners() {
    // 事件监听器配置
    this.eventListeners = [
      {
        event: 'updatePhotoMarkers',
        handler: (data) => this.updatePhotoMarkers(data.photos || [])
      },
      {
        event: 'updateAlbumMarkers', 
        handler: (data) => this.updateAlbumMarkers(data.albums || [])
      },
      {
        event: 'switchMapMode',
        handler: (data) => {
          const { mode, photos, albums } = data
          this.isAlbumMode = mode === 'album'
          
          if (this.isAlbumMode) {
            this.updateAlbumMarkers(albums || [])
          } else {
            this.updatePhotoMarkers(photos || [])
          }
        }
      }
    ]

    // 批量注册事件监听器
    this.eventListeners.forEach(({ event, handler }) => {
      eventBus.on(event, handler)
    })
  }

  /**
   * 更新照片标记
   */
  updatePhotoMarkers(photos) {
    this.photos = photos
    this.isAlbumMode = false
    this.clearMarkers()

    if (!this.markerLayer || !photos.length) return

    const validCoordinates = []

    photos.forEach((photo) => {
      if (!photo.coordinates) return

      validCoordinates.push(photo.coordinates)

      // 创建照片标记
      const marker = new Marker(photo.coordinates, {
        symbol: {
          markerType: 'pin',
          markerFill: '#4CAF50', // 照片使用绿色
          markerLineColor: '#fff',
          markerLineWidth: 2,
          markerWidth: 30,
          markerHeight: 40,
        },
      })

      // 点击标记显示信息窗口
      marker.on('click', (e) => {
        this.showPhotoPopup(photo, photo.coordinates)
      })

      // 添加到图层
      marker.addTo(this.markerLayer)
    })

    // 智能定位
    this.updateMapView(validCoordinates)
  }

  /**
   * 更新相册标记
   */
  updateAlbumMarkers(albums) {
    this.albums = albums
    this.isAlbumMode = true
    this.clearMarkers()

    if (!this.markerLayer) return

    // 如果没有相册，跳转到默认位置
    if (!albums.length) {
      this.updateMapView([])
      return
    }

    const validCoordinates = []

    albums.forEach((album) => {
      // 使用第一张照片的坐标作为相册坐标
      if (!album.photos || album.photos.length === 0 || !album.photos[0].coordinates) return

      const coordinates = album.photos[0].coordinates
      validCoordinates.push(coordinates)

      // 创建相册标记
      const marker = new Marker(coordinates, {
        symbol: {
          markerType: 'pin',
          markerFill: '#ff6b6b', // 相册使用红色
          markerLineColor: '#fff',
          markerLineWidth: 2,
          markerWidth: 35,
          markerHeight: 45,
        },
      })

      // 点击标记显示信息窗口
      marker.on('click', (e) => {
        this.showAlbumPopup(album, coordinates)
      })

      // 添加到图层
      marker.addTo(this.markerLayer)
    })

    // 智能定位
    this.updateMapView(validCoordinates)
  }

  /**
   * 显示照片弹窗
   */
  showPhotoPopup(photo, coordinates) {
    if (this.infoWindow) {
      this.infoWindow.remove()
    }

    this.infoWindow = new ui.InfoWindow({
      title: photo.title || '照片',
      content: `
        <div class="map-popup-content">
          <img src="${photo.url}" alt="${photo.title || '照片'}" style="width:100%;max-height:150px;object-fit:cover;" />
          <div class="popup-info">
            <p>${photo.description || ''}</p>
            <p><small>拍摄时间: ${photo.date || '未知'}</small></p>
            <button class="popup-view-btn" data-photo-id="${photo.id}">查看大图</button>
          </div>
        </div>
      `,
    })

    this.infoWindow.addTo(this.map).show(coordinates)

    // 为查看按钮添加点击事件
    setTimeout(() => {
      const viewBtn = document.querySelector('.popup-view-btn')
      if (viewBtn) {
        viewBtn.addEventListener('click', () => {
          eventBus.emit('photo-selected', photo)
          this.infoWindow.remove()
        })
      }
    }, 100)
  }

  /**
   * 显示相册弹窗
   */
  showAlbumPopup(album, coordinates) {
    if (this.infoWindow) {
      this.infoWindow.remove()
    }

    this.infoWindow = new ui.InfoWindow({
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

    this.infoWindow.addTo(this.map).show(coordinates)

    // 为查看按钮添加点击事件
    setTimeout(() => {
      const viewBtn = document.querySelector('.popup-view-btn')
      if (viewBtn) {
        viewBtn.addEventListener('click', () => {
          eventBus.emit('album-selected', album)
          this.infoWindow.remove()
        })
      }
    }, 100)
  }

  /**
   * 清除所有标记
   */
  clearMarkers() {
    if (this.markerLayer) {
      this.markerLayer.clear()
    }
    if (this.infoWindow) {
      this.infoWindow.remove()
      this.infoWindow = null
    }
  }

  /**
   * 智能定位地图视图
   */
  updateMapView(coordinates) {
    if (!this.map || !coordinates.length) {
      this.goHome()
      return
    }

    if (coordinates.length === 1) {
      // 只有一个坐标，定位到该点
      this.map.animateTo(
        {
          center: coordinates[0],
          zoom: 12,
        },
        {
          duration: 1000,
        },
      )
    } else {
      // 多个坐标，计算边界并自适应显示
      try {
        let minLng = coordinates[0][0],
          maxLng = coordinates[0][0]
        let minLat = coordinates[0][1],
          maxLat = coordinates[0][1]

        coordinates.forEach((coord) => {
          minLng = Math.min(minLng, coord[0])
          maxLng = Math.max(maxLng, coord[0])
          minLat = Math.min(minLat, coord[1])
          maxLat = Math.max(maxLat, coord[1])
        })

        // 添加一些边距
        const padding = 0.01
        const extent = [minLng - padding, minLat - padding, maxLng + padding, maxLat + padding]

        this.map.fitExtent(extent, 0, { animation: true })
      } catch (error) {
        console.warn('fitExtent failed, using center of first coordinate:', error)
        this.map.animateTo(
          {
            center: coordinates[0],
            zoom: 10,
          },
          {
            duration: 1000,
          },
        )
      }
    }
  }

  _showCore(options) {
    if (this.markerLayer) {
      this.markerLayer.show()
    }
    this._visible = true
  }

  _hideCore(options) {
    if (this.markerLayer) {
      this.markerLayer.hide()
    }
    if (this.infoWindow) {
      this.infoWindow.remove()
      this.infoWindow = null
    }
    this._visible = false
  }

  destroy() {
    this.clearMarkers()
    if (this.markerLayer) {
      this.map.removeLayer(this.markerLayer)
      this.markerLayer = null
    }

    // 批量移除事件监听器
    if (this.eventListeners) {
      this.eventListeners.forEach(({ event, handler }) => {
        eventBus.off(event, handler)
      })
      this.eventListeners = null
    }
  }
}

const photoLayer = new PhotoLayer()
export default photoLayer
