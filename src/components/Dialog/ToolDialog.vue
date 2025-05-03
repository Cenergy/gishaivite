<template>
  <BaseDialog
    :title="dialogTitle"
    :content-component="currentToolComponent"
    :content-props="contentProps"
    @close="$emit('close')"
    @confirm="$emit('confirm')"
  />
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
import BaseDialog from './base/BaseDialog.vue'
import GISQueryTool from './tools/GISQueryTool.vue'
import MapVisualizationTool from './tools/MapVisualizationTool.vue'
import SpatialAnalysisTool from './tools/SpatialAnalysisTool.vue'
import MobileCollectionTool from './tools/MobileCollectionTool.vue'

const props = defineProps({
  toolType: {
    type: String,
    default: '',
  },
  dialogTitle: {
    type: String,
    default: '工具详情',
  },
  contentProps: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['close', 'confirm'])

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
