# 地图模块响应式状态管理系统

## 概述

本项目已将地图模块的通信方式从事件总线（EventBus）升级为响应式状态管理系统（Reactive State Management），提供更好的开发体验和自动内存管理。

## 主要改进

### 1. 自动内存管理
- ✅ 不再需要手动注册和注销事件监听器
- ✅ Vue 3 响应式系统自动处理内存清理
- ✅ 避免内存泄漏风险

### 2. 类型安全
- ✅ 更好的 TypeScript 支持
- ✅ 编译时错误检查
- ✅ IDE 智能提示

### 3. 调试友好
- ✅ Vue DevTools 支持
- ✅ 状态变化可追踪
- ✅ 更清晰的数据流

### 4. 性能优化
- ✅ 响应式系统自动优化更新
- ✅ 减少不必要的重新渲染
- ✅ 更高效的状态同步

## 核心文件

### `/src/stores/mapStore.js`
响应式状态管理器，管理所有地图相关状态：
- 视图模式（list/map）
- 活跃分类
- 选中的相册
- 相册和照片数据
- 地图实例

### 主要方法
```javascript
// 设置状态
mapStore.setViewMode('map')
mapStore.setActiveCategory('nature')
mapStore.setSelectedAlbum(album)

// 注册图层（自动响应状态变化）
const cleanup = mapStore.registerLayer('photoLayer', layerInstance)

// 事件处理
mapStore.handleAlbumSelected(album)
mapStore.handlePhotoSelected(photo)

// 清理
cleanup()
```

## 修改的文件

### 1. `/src/map/layers/photoLayer.js`
- 移除 EventBus 依赖
- 使用 `mapStore.registerLayer()` 注册图层
- 自动响应状态变化更新标记

### 2. `/src/components/MapView.vue`
- 集成状态管理器
- 自动注册地图实例

### 3. `/src/views/GalleryView.vue`
- 移除手动事件监听器
- 使用响应式状态同步
- 简化状态管理逻辑

### 4. `/src/map/controls/home.js`
- 修改 `startup()` 方法返回地图实例

## 使用示例

### 在组件中使用状态管理器
```javascript
import mapStore from '@/stores/mapStore'
import { watch } from 'vue'

// 监听状态变化
watch(() => mapStore.state.selectedAlbum, (newAlbum) => {
  console.log('选中的相册变化:', newAlbum)
})

// 更新状态
mapStore.setViewMode('map')

// 监听事件
const cleanup = mapStore.on('album-selected', (album) => {
  console.log('相册被选中:', album)
})

// 清理（在 onUnmounted 中调用）
cleanup()
```

### 在图层中使用
```javascript
import mapStore from '@/stores/mapStore'

class CustomLayer {
  init(map) {
    // 注册到状态管理器，自动响应状态变化
    this.cleanup = mapStore.registerLayer('customLayer', this)
  }
  
  // 这些方法会被状态管理器自动调用
  updatePhotoMarkers(photos) {
    // 更新照片标记
  }
  
  updateAlbumMarkers(albums) {
    // 更新相册标记
  }
  
  destroy() {
    if (this.cleanup) {
      this.cleanup()
    }
  }
}
```

## 迁移指南

如果需要添加新的地图相关功能：

1. **不要使用 EventBus**，改用 `mapStore`
2. **图层注册**：使用 `mapStore.registerLayer()`
3. **状态更新**：使用 `mapStore.setXxx()` 方法
4. **事件监听**：使用 `mapStore.on()` 和 `mapStore.emit()`
5. **清理**：响应式系统会自动清理，但图层需要调用返回的清理函数

## 测试

启动开发服务器后，测试以下功能：

1. ✅ 切换视图模式（列表/地图）
2. ✅ 切换分类筛选
3. ✅ 点击相册进入相册详情
4. ✅ 在地图上点击相册标记
5. ✅ 在地图上点击照片标记
6. ✅ 照片查看器功能

所有功能应该与之前完全一致，但现在使用更优雅的响应式状态管理。