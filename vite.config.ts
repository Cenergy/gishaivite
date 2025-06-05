import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import UnoCSS from 'unocss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), UnoCSS()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    chunkSizeWarningLimit: 2500,
    rollupOptions: {
      output: {
        manualChunks: {
          // 基础框架
          'vendor-vue': ['vue', 'vue-router'],
          // UI组件库
          'vendor-element': ['element-plus'],
          // 工具库
          'vendor-utils': ['axios'],
          // 地图库单独分离，避免循环依赖
          'vendor-map': ['maptalks-gl'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        //target: 'https://api2.gishai.top',
        changeOrigin: true,
        rewrite: (path) => path,
      },
      '/static': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
})
