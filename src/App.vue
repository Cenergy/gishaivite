<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <div class="min-h-screen transition-colors duration-300">
    <RouterView />
  </div>
</template>

<style>
:root {
  /* 亮色模式变量 */
  --color-primary: #0066cc;
  --color-secondary: #004d99;
  --color-success: #15803d;
  --color-warning: #f59e0b;
  --color-danger: #dc2626;
  --color-info: #3b82f6;
  --color-dark: #18181c;
  --color-light: #ffffff;
  --color-light-border: #efeff5;
  --color-dark-border: #2d2d30;
  --color-background: #ffffff;
  --color-text: #18181c;
}

.dark {
  /* 暗色模式变量 */
  --color-primary: #3b82f6;
  --color-secondary: #60a5fa;
  --color-success: #22c55e;
  --color-warning: #fbbf24;
  --color-danger: #ef4444;
  --color-info: #38bdf8;
  --color-dark: #f8fafc;
  --color-light: #1e293b;
  --color-light-border: #334155;
  --color-dark-border: #cbd5e1;
  --color-background: #0f172a;
  --color-text: #f8fafc;
}

body {
  background-color: var(--color-background);
  color: var(--color-text);
}

/* 保留一些无法用UnoCSS表达的样式 */
nav a.router-link-exact-active {
  color: var(--color-primary);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a:first-of-type {
  border: 0 !important;
}
</style>
