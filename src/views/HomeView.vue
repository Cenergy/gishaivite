<template>
  <div class="home">
    <UnoTest />
    <UnoAdvanced />
    <!-- 全屏背景图区域 -->
    <!-- <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title fade-in">及时嗨</h1>
        <p class="hero-subtitle fade-in delay-1">分享技术，记录生活</p>
      </div>
    </div> -->

    <AppHeader :is-header-fixed="isHeaderFixed" />
    <!-- 当头部固定时的占位元素，避免内容跳跃 -->
    <div v-if="isHeaderFixed" class="header-placeholder"></div>
    <MainContent />
    <FooterSection class="fade-in delay-3" />
  </div>
</template>

<script setup lang="js">
import { defineAsyncComponent } from 'vue'
import { useScrollEffects } from '@/composables/useScrollEffects'

// 导入新的组件
const AppHeader = defineAsyncComponent(() => import('@/components/layout/AppHeader.vue'))
const MainContent = defineAsyncComponent(() => import('@/components/layout/MainContent.vue'))

// 异步组件导入 - 懒加载优化
const UnoTest = defineAsyncComponent(() => import('@/components/demo/UnoTest.vue'))
const UnoAdvanced = defineAsyncComponent(() => import('@/components/demo/UnoAdvanced.vue'))
const FooterSection = defineAsyncComponent(() => import('@/components/layout/FooterSection.vue'))

// 使用滚动效果组合式函数
const { isHeaderFixed } = useScrollEffects()
</script>

<style scoped>
@import "@/assets/styles/animations.css";

.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header-placeholder {
  height: 60px; /* 与头部高度保持一致 */
  width: 100%;
}
</style>
