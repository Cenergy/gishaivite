import { nextTick } from 'vue'
import eventBus from '@/utils/EventBus'
import photoLayer from '@/map/layers/photoLayer'

/**
 * 地图事件处理 Composable
 * 处理地图模式切换和事件监听
 */
export function useMapEvents() {
  // 切换地图模式
  const switchMapMode = (mode, data) => {
    nextTick(() => {
      setTimeout(() => {
        if (mode === 'photo') {
          // 显示照片模式
          eventBus.emit('switchMapMode', {
            mode: 'photo',
            photos: data.photos || [],
            albums: []
          })
        } else {
          // 显示相册模式
          eventBus.emit('switchMapMode', {
            mode: 'album',
            photos: [],
            albums: data.albums || []
          })
        }
      }, 100)
    })
  }

  // 处理视图模式变化
  const handleViewModeChange = (newMode, selectedAlbum, filteredAlbums) => {
    if (newMode === 'map') {
      // 切换到地图模式时，延迟更新地图标记以确保地图已初始化
      if (selectedAlbum) {
        // 如果有选中的相册，显示该相册的照片
        switchMapMode('photo', { photos: selectedAlbum.photos || [] })
      } else {
        // 否则显示所有相册
        switchMapMode('album', { albums: filteredAlbums || [] })
      }
    } else {
      // 切换到列表模式时，销毁地图图层
      photoLayer.destroy()
    }
  }

  // 处理分类变化
  const handleCategoryChange = (viewMode, filteredAlbums) => {
    // 如果当前是地图模式，更新地图标记
    if (viewMode === 'map') {
      switchMapMode('album', { albums: filteredAlbums || [] })
    }
  }

  // 设置事件监听器
  const setupEventListeners = (handlers) => {
    const { onAlbumSelected, onPhotoSelected } = handlers
    
    eventBus.on('album-selected', onAlbumSelected)
    eventBus.on('photo-selected', onPhotoSelected)
    
    // 返回清理函数
    return () => {
      eventBus.off('album-selected', onAlbumSelected)
      eventBus.off('photo-selected', onPhotoSelected)
    }
  }

  return {
    switchMapMode,
    handleViewModeChange,
    handleCategoryChange,
    setupEventListeners
  }
}