import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import UnoCSS from 'unocss/vite'
import compression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(), 
    vueDevTools(), 
    UnoCSS(),
    // gzip压缩
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024, // 只压缩大于1KB的文件
      deleteOriginFile: false, // 保留原文件
      filter: /\.(js|css|html|svg|json)$/i, // 压缩的文件类型
    }),
    // brotli压缩（可选，更好的压缩率）
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
      filter: /\.(js|css|html|svg|json)$/i,
    })
  ],
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
        // target: 'http://localhost:8000',
        target: 'https://api2.gishai.top',
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
