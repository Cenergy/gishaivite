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
    }),
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
          // 地图库单独分离
          'vendor-map': ['maptalks-gl'],
          // 图标库单独分离
          'vendor-icons': ['@element-plus/icons-vue'],
        },
        // 文件名优化
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 构建目标优化
    target: 'es2015',
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除console
        drop_debugger: true, // 移除debugger
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
        target: 'https://api2.gishai.top',
        changeOrigin: true,
        rewrite: (path) => path,
      },
      '/terrain': {
        target: 'https://api2.gishai.top',
        changeOrigin: true,
        rewrite: (path) => path,
      },
      '/terrains': {
        target: 'https://api2.gishai.top',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
})
