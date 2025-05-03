/**
 * Dialog组件统一导出文件
 * 提供更清晰的组件导入方式
 */

// 基础对话框组件
export { default as BaseDialog } from './base/BaseDialog.vue'

// 工具对话框组件
export { default as ToolDialog } from './ToolDialog.vue'

// 工具内容组件
export { default as GISQueryTool } from './tools/GISQueryTool.vue'
export { default as MapVisualizationTool } from './tools/MapVisualizationTool.vue'
export { default as SpatialAnalysisTool } from './tools/SpatialAnalysisTool.vue'
export { default as MobileCollectionTool } from './tools/MobileCollectionTool.vue'
