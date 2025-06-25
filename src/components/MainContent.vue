<template>
  <main class="main-content">
    <h1 class="fade-in">欢迎来到及时嗨</h1>

    <ToolsSection />
    <GallerySection />
    <BlogSection />
    <ResourcesSection />
    <FollowSection />
  </main>
</template>

<script setup lang="js">
import { defineAsyncComponent } from 'vue'

// 首屏下方组件 - 懒加载
const ToolsSection = defineAsyncComponent(() => import('@/components/ToolsSection.vue'))
const BlogSection = defineAsyncComponent(() => import('@/components/BlogSection.vue'))
const ResourcesSection = defineAsyncComponent(() => import('@/components/ResourcesSection.vue'))
const GallerySection = defineAsyncComponent(() => import('@/components/GallerySection.vue'))
const FollowSection = defineAsyncComponent(() => import('@/components/FollowSection.vue'))
</script>

<style scoped>
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding: 2rem;
  text-align: center;
}

.fade-in {
  opacity: 0;
  animation: fadeIn 1s ease-in forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>