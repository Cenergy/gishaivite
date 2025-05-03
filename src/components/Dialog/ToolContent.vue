<template>
  <div class="tool-content">
    <component :is="currentToolComponent"></component>

    <template v-if="!currentToolComponent">
      <h3>工具详情</h3>
      <p>该工具暂未配置详细信息，请稍后再试。</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, shallowRef, computed } from 'vue'
import GISQueryTool from './GISQueryTool.vue'
import MapVisualizationTool from './MapVisualizationTool.vue'
import SpatialAnalysisTool from './SpatialAnalysisTool.vue'
import MobileCollectionTool from './MobileCollectionTool.vue'

const props = defineProps({
  toolType: {
    type: String,
    default: '',
  },
})

// 根据工具类型动态加载对应的组件
const currentToolComponent = computed(() => {
  switch (props.toolType) {
    case 'gis-query':
      return GISQueryTool
    case 'map-visualization':
      return MapVisualizationTool
    case 'spatial-analysis':
      return SpatialAnalysisTool
    case 'mobile-collection':
      return MobileCollectionTool
    default:
      return null
  }
})
</script>

<style scoped>
.tool-content {
  padding: 20px;
}

.tool-form {
  margin-top: 20px;
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--primary-color, #0066cc);
}

p {
  margin-bottom: 20px;
  color: #666;
}
</style>
