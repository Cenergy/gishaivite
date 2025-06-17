<template>
  <div class="map-view">
    <MapView :mapBus="testMapBus" />
    <LayerControl />
    <MapDetail />
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue'
import { test as testMapBus } from '@/map'

// 异步组件导入 - 懒加载优化
const MapView = defineAsyncComponent({
  loader: () => import('@/components/MapView.vue'),
  delay: 200,
  timeout: 3000
})

const LayerControl = defineAsyncComponent(() => import('@/components/LayerControl/index.vue'))
const MapDetail = defineAsyncComponent(() => import('@/components/MapDetail/index.vue'))

// 使用test控制器的地图页面
</script>

<style scoped>
.map-view {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>