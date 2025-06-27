<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

// 定义主题类型
type Theme = 'light' | 'dark'

// 创建主题状态
const currentTheme = ref<Theme>('light')

// 切换主题函数
const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
  updateTheme()
}

// 更新主题并保存到localStorage
const updateTheme = () => {
  // 更新HTML元素的class
  if (currentTheme.value === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }

  // 保存到localStorage
  localStorage.setItem('theme', currentTheme.value)
}

// 初始化主题
onMounted(() => {
  // 从localStorage获取保存的主题，如果没有则使用系统偏好
  const savedTheme = localStorage.getItem('theme') as Theme | null
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

  currentTheme.value = savedTheme || (prefersDark ? 'dark' : 'light')
  updateTheme()
})
</script>

<template>
  <!-- 按钮居中 -->
  <div class="flex justify-center items-center h-full w-full">
    <button
      @click="toggleTheme"
      class="p-2 transition-colors duration-300 focus:outline-none border-none bg-transparent"
      aria-label="切换主题模式"
    >
      <!-- 太阳图标 (亮色模式) -->
      <div
        v-if="currentTheme === 'light'"
        class="i-tabler:sun text-xl text-yellow-500 border-none outline-none"
      ></div>

      <!-- 月亮图标 (暗色模式) -->
      <div v-else class="i-tabler:moon text-xl text-blue-300 border-none outline-none"></div>
    </button>
  </div>
</template>