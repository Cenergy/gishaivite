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
    <MainContent />
    <FooterSection class="fade-in delay-3" />
  </div>
</template>

<script setup lang="js">
import { defineAsyncComponent } from 'vue'
import { useScrollEffects } from '@/composables/useScrollEffects'

// 导入新的组件
import AppHeader from '@/components/AppHeader.vue'
import MainContent from '@/components/MainContent.vue'

// 异步组件导入 - 懒加载优化
const UnoTest = defineAsyncComponent(() => import('../components/UnoTest.vue'))
const UnoAdvanced = defineAsyncComponent(() => import('../components/UnoAdvanced.vue'))
const FooterSection = defineAsyncComponent(() => import('@/components/FooterSection.vue'))

// 使用滚动效果组合式函数
const { isHeaderFixed } = useScrollEffects()
</script>

<style scoped>
@import '@/assets/styles/animations.css';

.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}


</style>
