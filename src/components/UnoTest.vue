<template>
  <div class="p-4 m-4 bg-blue-500 text-white rounded-lg shadow-lg">
    <h2 class="text-xl font-bold mb-2">UnoCSS Tailwind预设测试</h2>
    <p class="opacity-80">这个组件使用了UnoCSS的Tailwind预设样式</p>
    <div class="mt-4 flex gap-2">
      <button
        class="px-4 py-2 bg-green-500 hover:bg-green-600 rounded transition-colors duration-300"
      >
        <i class="i-custom:circle" />
        <i class="i-logo:logo text-#1E80FF" />
        按钮1
      </button>

      <button
        class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 rounded transition-colors duration-300"
      >
        按钮2
      </button>
      
      <router-link 
        to="/geo-worker-demo"
        class="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded transition-colors duration-300 text-white no-underline inline-flex items-center"
      >
        <i class="i-tabler:cpu mr-2"></i>
        Web Worker 演示
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这个组件展示了UnoCSS的Tailwind预设功能
</script>
