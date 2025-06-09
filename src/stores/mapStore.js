import { reactive, watch, computed } from 'vue'

/**
 * 地图状态管理器
 * 使用 Vue 3 的响应式系统替代事件总线，自动管理状态变化和内存清理
 */
class MapStore {
  constructor() {
    // 响应式状态
    this.state = reactive({
      // 视图模式: 'list' | 'map'
      viewMode: 'list',
      // 当前活跃分类
      activeCategory: 'all',
      // 选中的相册
      selectedAlbum: null,
      // 所有相册数据
      albums: [],
      // 所有照片数据
      photos: [],
      // 地图实例
      mapInstance: null,
      // 照片查看器状态
      photoViewerVisible: false,
      selectedPhotoIndex: 0
    })
    
    // 注册的图层映射
    this.layers = new Map()
    // 监听器清理函数
    this.watchers = new Set()
    // 事件回调映射
    this.eventCallbacks = new Map()
    
    // 设置计算属性
    this.setupComputedProperties()
  }
  
  /**
   * 设置计算属性
   */
  setupComputedProperties() {
    // 根据分类筛选相册
    this.filteredAlbums = computed(() => {
      let filtered = []
      if (this.state.activeCategory === 'all') {
        filtered = this.state.albums
      } else {
        filtered = this.state.albums.filter((album) => album.category === this.state.activeCategory)
      }
      
      // 根据 sort_order 排序，越大在前面
      return filtered.sort((a, b) => b.sortOrder - a.sortOrder)
    })
    
    // 获取所有照片（用于地图模式）
    this.allPhotos = computed(() => {
      let photos = []
      this.filteredAlbums.value.forEach((album) => {
        photos = [
          ...photos,
          ...album.photos.map((photo) => ({
            ...photo,
            albumId: album.id,
            albumTitle: album.title,
          })),
        ]
      })
      return photos
    })
  }
  
  /**
   * 注册图层到状态管理器
   * @param {string} name 图层名称
   * @param {Object} layer 图层实例
   * @returns {Function} 清理函数
   */
  registerLayer(name, layer) {
    this.layers.set(name, layer)
    
    // 监听状态变化，自动更新图层
    const unwatch = watch(
      () => [this.state.viewMode, this.state.selectedAlbum, this.filteredAlbums.value],
      ([viewMode, selectedAlbum, filteredAlbums]) => {
        if (viewMode === 'map') {
          if (selectedAlbum) {
            // 显示选中相册的照片
            layer.updatePhotoMarkers && layer.updatePhotoMarkers(selectedAlbum.photos || [])
          } else {
            // 显示所有相册
            layer.updateAlbumMarkers && layer.updateAlbumMarkers(filteredAlbums || [])
          }
        }
      },
      { immediate: true }
    )
    
    this.watchers.add(unwatch)
    
    // 返回清理函数
    return () => {
      this.layers.delete(name)
      this.watchers.delete(unwatch)
      unwatch()
    }
  }
  
  /**
   * 更新视图模式
   * @param {string} mode 'list' | 'map'
   */
  setViewMode(mode) {
    this.state.viewMode = mode
  }
  
  /**
   * 更新活跃分类
   * @param {string} category 分类ID
   */
  setActiveCategory(category) {
    this.state.activeCategory = category
    // 切换分类时清除选中的相册
    this.state.selectedAlbum = null
  }
  
  /**
   * 设置选中的相册
   * @param {Object|null} album 相册对象
   */
  setSelectedAlbum(album) {
    this.state.selectedAlbum = album
  }
  
  /**
   * 更新相册数据
   * @param {Array} albums 相册数组
   */
  setAlbums(albums) {
    this.state.albums = albums
  }
  
  /**
   * 更新照片数据
   * @param {Array} photos 照片数组
   */
  setPhotos(photos) {
    this.state.photos = photos
  }
  
  /**
   * 设置地图实例
   * @param {Object} mapInstance 地图实例
   */
  setMapInstance(mapInstance) {
    this.state.mapInstance = mapInstance
  }
  
  /**
   * 打开照片查看器
   * @param {number|Object} indexOrPhoto 照片索引或照片对象
   */
  openPhotoViewer(indexOrPhoto) {
    if (typeof indexOrPhoto === 'number') {
      // 来自相册列表的索引
      this.state.selectedPhotoIndex = indexOrPhoto
    } else {
      // 来自地图模式的照片对象
      const photos = this.state.selectedAlbum ? this.state.selectedAlbum.photos : this.allPhotos.value
      const index = photos.findIndex(photo => photo.id === indexOrPhoto.id)
      this.state.selectedPhotoIndex = index >= 0 ? index : 0
    }
    this.state.photoViewerVisible = true
  }
  
  /**
   * 关闭照片查看器
   */
  closePhotoViewer() {
    this.state.photoViewerVisible = false
  }
  
  /**
   * 处理相册选择（来自地图）
   * @param {Object} album 选中的相册
   */
  handleAlbumSelected(album) {
    this.setSelectedAlbum(album)
    // 触发自定义事件，让组件知道相册被选中
    this.emit('album-selected', album)
  }
  
  /**
   * 处理照片选择（来自地图）
   * @param {Object} photo 选中的照片
   */
  handlePhotoSelected(photo) {
    this.openPhotoViewer(photo)
    // 触发自定义事件，让组件知道照片被选中
    this.emit('photo-selected', photo)
  }
  
  /**
   * 返回相册列表
   */
  backToAlbums() {
    this.state.selectedAlbum = null
  }
  
  /**
   * 获取当前显示的照片列表
   */
  getCurrentPhotos() {
    return this.state.selectedAlbum ? this.state.selectedAlbum.photos : this.allPhotos.value
  }
  
  /**
   * 注册事件回调
   * @param {string} event 事件名称
   * @param {Function} callback 回调函数
   * @returns {Function} 清理函数
   */
  on(event, callback) {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set())
    }
    this.eventCallbacks.get(event).add(callback)
    
    return () => {
      const callbacks = this.eventCallbacks.get(event)
      if (callbacks) {
        callbacks.delete(callback)
      }
    }
  }
  
  /**
   * 触发事件
   * @param {string} event 事件名称
   * @param {*} data 事件数据
   */
  emit(event, data) {
    const callbacks = this.eventCallbacks.get(event)
    if (callbacks) {
      callbacks.forEach(callback => callback(data))
    }
  }
  
  /**
   * 清理所有监听器
   */
  destroy() {
    this.watchers.forEach(unwatch => unwatch())
    this.watchers.clear()
    this.layers.clear()
    this.eventCallbacks.clear()
  }
}

// 创建全局实例
const mapStore = new MapStore()

export default mapStore