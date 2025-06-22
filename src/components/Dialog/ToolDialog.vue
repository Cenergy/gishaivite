<template>
  <BaseDialog
    :title="dialogTitle"
    :content-component="currentToolComponent"
    :content-props="contentProps"
    :width="'80%'"
    :dialog-attrs="dialogAttrs"
    v-on="$attrs"
    @close="$emit('close')"
    @confirm="$emit('confirm')"
    @opened="handleDialogOpened"
  />
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue'
import { BaseDialog } from './base'
import {
  GISQueryTool,
  MapVisualizationTool,
  SpatialAnalysisTool,
  MobileCollectionTool,
  CoordinateTransformTool,
} from './tools'

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
  // 接收额外的dialog属性
  dialogAttrs: {
    type: Object,
    default: () => ({}),
  },
})

// 定义组件可以触发的所有事件
const emit = defineEmits<{
  close: []
  confirm: []
  opened: []
  [key: string]: any // 允许传递任意事件
}>()

// 处理弹窗打开事件
const handleDialogOpened = () => {
  // 弹窗已打开
}

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
    case 'coordinate-transform':
      return CoordinateTransformTool
    default:
      return GISQueryTool
  }
})
</script>
