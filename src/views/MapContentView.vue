<template>
  <div class="map-view">
    <MapView :mapBus="testMapBus" />
    <LayerControl />
  </div>
</template>

<script setup>
import MapView from '@/components/MapView.vue'
import LayerControl from '@/components/LayerControl/index.vue'
import { test as testMapBus } from '@/map'

// 使用test控制器的地图页面
</script>

<style scoped>
.map-view {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}
</style>