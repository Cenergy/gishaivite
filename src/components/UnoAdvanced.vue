<template>
  <div class="p-6 m-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-xl">
    <h2 class="text-2xl font-bold text-white mb-4">UnoCSS 高级示例</h2>
    
    <!-- 卡片容器 -->
    <div class="flex flex-wrap gap-4 justify-center">
      <!-- 卡片1 - 使用类模式 -->
      <div class="bg-white/90 backdrop-blur rounded-lg shadow-md p-4 w-64 flex flex-col items-center transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg">
        <div class="text-3xl mb-2 text-blue-600">🚀</div>
        <h3 class="text-lg font-semibold mb-2 text-gray-800">类模式</h3>
        <p class="text-gray-600 text-center mb-4">使用传统的类名方式应用UnoCSS样式</p>
        <button class="mt-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
          了解更多
        </button>
      </div>

      <!-- 卡片2 - 使用属性模式 -->
      <div 
        bg="white/90" 
        backdrop-blur 
        rounded="lg" 
        shadow="md" 
        p="4" 
        w="64" 
        flex="~ col" 
        items="center" 
        transition="all duration-300"
        hover="transform scale-105 shadow-lg"
      >
        <div text="3xl blue-600" mb="2">⚡</div>
        <h3 text="lg gray-800" font="semibold" mb="2">属性模式</h3>
        <p text="gray-600 center" mb="4">使用属性方式应用UnoCSS样式，更清晰</p>
        <button 
          mt="auto" 
          px="4" 
          py="2" 
          bg="blue-500 hover:blue-600" 
          text="white" 
          rounded 
          transition="colors"
        >
          了解更多
        </button>
      </div>

      <!-- 卡片3 - 响应式设计 -->
      <div class="bg-white/90 backdrop-blur rounded-lg shadow-md p-4 w-full md:w-64 flex flex-col items-center transition-all duration-300 hover:transform hover:scale-105 hover:shadow-lg">
        <div class="text-3xl mb-2 text-blue-600">📱</div>
        <h3 class="text-lg font-semibold mb-2 text-gray-800">响应式设计</h3>
        <p class="text-gray-600 text-center mb-4">使用sm:、md:、lg:、xl:前缀实现响应式布局</p>
        <div class="w-full flex flex-col sm:flex-row gap-2 justify-center">
          <button class="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors">
            移动端
          </button>
          <button class="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors">
            桌面端
          </button>
        </div>
      </div>
    </div>

    <!-- 动画示例 -->
    <div class="mt-8 p-4 bg-white/20 backdrop-blur rounded-lg">
      <h3 class="text-xl font-bold text-white mb-4 text-center">动画效果</h3>
      <div class="flex flex-wrap gap-6 justify-center">
        <div class="animate-bounce bg-white p-2 w-10 h-10 ring-1 ring-slate-900/5 shadow-lg rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-blue-500" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </div>

        <div class="animate-pulse bg-white p-2 w-10 h-10 ring-1 ring-slate-900/5 shadow-lg rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-red-500" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        </div>

        <div class="animate-spin bg-white p-2 w-10 h-10 ring-1 ring-slate-900/5 shadow-lg rounded-full flex items-center justify-center">
          <svg class="w-6 h-6 text-green-500" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 这个组件展示了UnoCSS的高级用法，包括：
// 1. 类模式和属性模式
// 2. 响应式设计
// 3. 悬停状态
// 4. 动画效果
// 5. 渐变和透明度
</script>