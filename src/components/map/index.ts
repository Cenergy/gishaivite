import { defineAsyncComponent } from 'vue';

// 懒加载组件
export const LayerControl = defineAsyncComponent(() => import('./LayerControl.vue'));
export const MapDetail = defineAsyncComponent(() => import('./MapDetail.vue'));
export const MapToolbar = defineAsyncComponent(() => import('./MapToolbar.vue'));

// 导出 popups 模块
export * from './popups';
