<template>
  <div class="map-view">
    <BaseMap :mapBus="testMapBus" />
    <LayerControl />
    <MapDetail />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { test as testMapBus } from '@/map'

// 异步组件导入 - 懒加载优化
const BaseMap = defineAsyncComponent({
  loader: () => import('@/components/BaseMap.vue'),
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