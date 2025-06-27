<script setup lang="ts">
// 主题演示组件
</script>

<template>
  <div class="p-8 transition-colors duration-300">
    <h1 class="text-3xl font-bold mb-6 text-primary">主题切换演示</h1>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <!-- 卡片示例 -->
      <div
        class="card p-6 bg-light dark:bg-dark border border-light-border dark:border-dark-border rounded-lg shadow-md"
      >
        <h2 class="text-xl font-semibold mb-4">卡片组件</h2>
        <p class="mb-4">这是一个卡片组件，会根据当前主题自动调整样式。</p>
        <div class="flex gap-2">
          <button class="btn">主要按钮</button>
          <button class="btn-outline">次要按钮</button>
        </div>
      </div>

      <!-- 表单示例 -->
      <div
        class="card p-6 bg-light dark:bg-dark border border-light-border dark:border-dark-border rounded-lg shadow-md"
      >
        <h2 class="text-xl font-semibold mb-4">表单元素</h2>
        <div class="space-y-4">
          <div>
            <label class="block mb-1">输入框</label>
            <input
              type="text"
              class="input-base w-full dark:bg-gray-800 dark:border-gray-700"
              placeholder="请输入内容"
            />
          </div>
          <div>
            <label class="block mb-1">选择框</label>
            <select class="input-base w-full dark:bg-gray-800 dark:border-gray-700">
              <option>选项一</option>
              <option>选项二</option>
              <option>选项三</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- 颜色示例 -->
    <div
      class="card p-6 bg-light dark:bg-dark border border-light-border dark:border-dark-border rounded-lg shadow-md mb-8"
    >
      <h2 class="text-xl font-semibold mb-4">主题颜色</h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-primary"></div>
          <span class="mt-2">主要色</span>
        </div>
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-secondary"></div>
          <span class="mt-2">次要色</span>
        </div>
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-success"></div>
          <span class="mt-2">成功色</span>
        </div>
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-warning"></div>
          <span class="mt-2">警告色</span>
        </div>
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-danger"></div>
          <span class="mt-2">危险色</span>
        </div>
        <div class="flex flex-col items-center">
          <div class="w-16 h-16 rounded-full bg-info"></div>
          <span class="mt-2">信息色</span>
        </div>
      </div>
    </div>

    <!-- 文本示例 -->
    <div
      class="card p-6 bg-light dark:bg-dark border border-light-border dark:border-dark-border rounded-lg shadow-md"
    >
      <h2 class="text-xl font-semibold mb-4">文本样式</h2>
      <div class="space-y-2">
        <p class="text-sm">小号文本 - 适合辅助信息</p>
        <p>默认文本 - 适合正文内容</p>
        <p class="text-lg">大号文本 - 适合小标题</p>
        <p class="text-xl font-semibold">特大文本 - 适合主标题</p>
        <p class="text-primary">主题色文本 - 强调重点</p>
        <p class="text-success">成功色文本 - 表示积极结果</p>
        <p class="text-warning">警告色文本 - 表示需要注意</p>
        <p class="text-danger">危险色文本 - 表示错误或危险</p>
      </div>
    </div>
  </div>
</template>