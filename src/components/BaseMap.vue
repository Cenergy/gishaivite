<template>
  <div class="gallery-map-container fade-in delay-2">
    <div id="map" ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, nextTick, computed } from 'vue';
import { home as defaultMapBus } from '@/map';

// 定义props
const props = defineProps({
  mapBus: {
    type: Object,
    default: null,
  },
});

// 计算属性：如果传递了mapBus则使用传递的，否则使用默认导入的
const mapBus = computed(() => props.mapBus || defaultMapBus);

// 纯粹的地图容器组件，不处理业务逻辑

// 组件挂载时初始化地图
onMounted(() => {
  // 延迟初始化地图，确保DOM已渲染
  nextTick(() => {
    // 地图初始化
    if (mapBus.value.startup) mapBus.value.startup();

    // 地图初始化完成，父组件可以调用updateMarkers进行标记更新
  });
});

// 组件卸载时销毁地图
onUnmounted(() => {
  if (mapBus.value.destroy) mapBus.value.destroy();
});
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
