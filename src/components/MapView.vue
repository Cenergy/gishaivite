<template>
  <div class="gallery-map-container fade-in delay-2">
    <div id="map" ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, nextTick } from 'vue'
import { home as mapBus } from '@/map'
import mapStore from '@/stores/mapStore'

// 纯粹的地图容器组件，使用响应式状态管理

// 组件挂载时初始化地图
onMounted(() => {
  // 延迟初始化地图，确保DOM已渲染
  nextTick(() => {
    // 地图初始化
    if (mapBus.startup) {
      const mapInstance = mapBus.startup()
      // 将地图实例注册到状态管理器
      mapStore.setMapInstance(mapInstance)
    }
  })
})

// 组件卸载时销毁地图
onUnmounted(() => {
  if (mapBus.destroy) mapBus.destroy()
  // 清理状态管理器
  mapStore.destroy()
})
</script>

<style scoped>
/* 地图相关样式 */
.gallery-map-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-container {
  width: 100%;
  flex: 1;
  min-height: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.map-popup-content {
  padding: 8px;
  text-align: center;
}

@media (max-width: 768px) {
  .map-container {
    min-height: 450px;
  }
}

@media (max-width: 480px) {
  .map-container {
    min-height: 350px;
  }
}
</style>
