<template>
  <el-affix :offset="0">
    <header class="header" :class="{ 'fixed-header': isHeaderFixed }">
      <nav class="navbar">
        <div class="navbar-container">
          <router-link to="/" class="navbar-brand">及时嗨</router-link>
          <el-button
            class="navbar-toggler"
            @click="isMenuOpen = !isMenuOpen"
            aria-label="菜单"
            :aria-expanded="isMenuOpen.toString()"
          >
            <span class="navbar-toggler-icon" :class="{ open: isMenuOpen }">
              <span></span><span></span><span></span>
            </span>
          </el-button>
          <div class="navbar-collapse" :class="{ show: isMenuOpen }">
            <div class="navbar-nav">
              <div class="nav-item">
                <router-link to="/home" class="nav-link" active-class="active">首页</router-link>
              </div>
              <div class="nav-item">
                <router-link to="/blog" class="nav-link" active-class="active">博客</router-link>
              </div>
              <div class="nav-item">
                <router-link to="/projects" class="nav-link" active-class="active"
                  >项目</router-link
                >
              </div>
              <div class="nav-item">
                <router-link to="/contact" class="nav-link" active-class="active"
                  >联系</router-link
                >
              </div>
              <div class="nav-item">
                <router-link to="/gallery" class="nav-link" active-class="active">相册</router-link>
              </div>
              <div class="nav-item">
                <ThemeToggle class="nav-theme-toggle" />
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  </el-affix>
</template>

<script setup lang="js">
import { ref, defineAsyncComponent } from 'vue'

// 异步组件导入
const ThemeToggle = defineAsyncComponent({
  loader: () => import('@/components/common/ThemeToggle.vue'),
  delay: 100,
  timeout: 3000
})

// Props
defineProps({
  isHeaderFixed: {
    type: Boolean,
    default: false
  }
})

// 响应式数据
const isMenuOpen = ref(false)
</script>

<style scoped>
/* 新的Bootstrap风格导航栏样式 */
.header {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
  transition: all 0.3s ease;
  width: 100%;
  height: 60px; /* 固定导航栏高度 */
  /* 添加暗黑模式样式 */
  @apply dark:bg-gray-900/80 dark:backdrop-blur-md;
}

.navbar {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 100%; /* 使navbar填充整个header高度 */
  /* 添加暗黑模式样式 */
  @apply dark:text-gray-100;
}

.navbar-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 15px;
  height: 100%; /* 确保容器也是100%高度 */
}

.navbar-brand {
  display: inline-flex; /* 改为inline-flex以便垂直居中 */
  align-items: center; /* 垂直居中 */
  height: 100%; /* 使logo区域填充整个高度 */
  padding-top: 0;
  padding-bottom: 0;
  margin-right: 1rem;
  font-size: 1.25rem;
  line-height: 1;
  white-space: nowrap;
  font-weight: bold;
  color: #333;
  text-decoration: none;
  /* 添加暗黑模式样式 */
  @apply dark:text-blue-400;
}

.navbar-toggler {
  padding: 0.25rem 0.75rem;
  font-size: 1.25rem;
  line-height: 1;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  display: none;
  height: 40px; /* 固定按钮高度 */
}

.navbar-toggler-icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 28px;
  height: 28px;
  position: relative;
  transition: all 0.3s;
}

.navbar-toggler-icon span {
  display: block;
  height: 3px;
  width: 100%;
  background: #333;
  margin: 4px 0;
  border-radius: 2px;
  transition: all 0.3s;
}

.navbar-toggler-icon.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.navbar-toggler-icon.open span:nth-child(2) {
  opacity: 0;
}

.navbar-toggler-icon.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.navbar-collapse {
  flex-basis: auto;
  flex-grow: 1;
  align-items: center;
  display: flex;
  height: 100%; /* 确保collapse区域也是100%高度 */
  position: static; /* 确保不会脱离文档流 */
}

.navbar-nav {
  display: flex;
  flex-direction: row;
  padding-left: 0;
  margin-bottom: 0;
  list-style: none;
  margin-left: auto;
  height: 100%; /* 确保nav区域也是100%高度 */
  align-items: center; /* 确保垂直居中 */
  justify-content: flex-end; /* 确保靠右对齐 */
  /* 添加暗黑模式样式 */
  @apply dark:text-gray-200;
}

.nav-item {
  margin: 0 0.5rem;
  height: 100%; /* 确保每个nav-item也是100%高度 */
  display: flex;
  align-items: center;
  position: relative; /* 确保定位正确 */
}

.nav-link {
  display: flex;
  align-items: center;
  height: 100%; /* 确保链接也是100%高度 */
  padding: 0 1rem;
  color: #333;
  text-decoration: none;
  transition: all 0.3s;
  border-radius: 0; /* 移除圆角 */
  position: relative; /* 为下划线定位做准备 */
  /* 添加暗黑模式样式 */
  @apply dark:text-gray-300 dark:hover:text-white;
}

.nav-link:hover {
  color: #0066cc;
  background-color: rgba(0, 102, 204, 0.05);
  /* 添加暗黑模式样式 */
  @apply dark:text-blue-400;
}

.nav-link.active {
  color: #0066cc;
  font-weight: bold;
  border-bottom: none; /* 移除边框，改用伪元素 */
}

.nav-theme-toggle {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.nav-link.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #0066cc;
}

.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  /* 添加暗黑模式样式 */
  @apply dark:bg-gray-900/90 dark:backdrop-blur-md dark:border-b dark:border-gray-800 dark:shadow-gray-900/50;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .navbar-toggler {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .navbar-collapse {
    display: block;
    position: absolute;
    top: 60px; /* 与header高度一致 */
    left: 0;
    right: 0;
    background-color: #fff;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.35s ease, padding 0.35s ease, opacity 0.35s ease, visibility 0.35s ease;
    padding-top: 0;
    padding-bottom: 0;
    width: 100%;
    z-index: 1000;
    visibility: hidden;
    opacity: 0;
    height: auto; /* 在移动端，高度由内容决定 */
    /* 添加暗黑模式样式 */
    @apply dark:bg-gray-800 dark:shadow-gray-900/50;
  }

  .navbar-collapse.show {
    max-height: 300px; /* 足够容纳菜单项的高度 */
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
    visibility: visible;
    opacity: 1;
  }

  .navbar-nav {
    flex-direction: column;
    width: 100%;
    margin-left: 0;
    padding: 0 1rem;
    height: auto; /* 在移动端，高度由内容决定 */
    align-items: flex-start; /* 确保左对齐 */
  }

  .nav-item {
    margin: 0;
    width: 100%;
    height: auto; /* 在移动端，高度由内容决定 */
  }

  .nav-link {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    width: 100%;
    text-align: left;
    height: auto; /* 在移动端，高度由内容决定 */
    display: block;
    /* 添加暗黑模式样式 */
    @apply dark:border-gray-700;
  }

  .nav-link.active::after {
    display: none; /* 在移动端不显示下划线 */
  }

  .nav-link.active {
    border-left: 3px solid #0066cc; /* 在移动端使用左边框代替下划线 */
    padding-left: calc(1rem - 3px); /* 调整内边距以保持对齐 */
    background-color: rgba(0, 102, 204, 0.05);
    /* 添加暗黑模式样式 */
    @apply dark:border-blue-400 dark:bg-blue-900/20;
  }

  .nav-link:last-child {
    border-bottom: none;
  }
}

/* 添加更多断点以实现更好的响应式效果 */
@media (min-width: 769px) and (max-width: 992px) {
  .navbar-nav {
    gap: 1rem;
  }

  .nav-link {
    padding: 0 0.75rem;
  }
}

@media (min-width: 993px) {
  .navbar-nav {
    gap: 1.5rem;
  }
}
</style>