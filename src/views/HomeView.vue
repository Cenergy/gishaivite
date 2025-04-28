<template>
  <div class="home">
    <!-- 全屏背景图区域 -->
    <!-- <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title fade-in">及时嗨</h1>
        <p class="hero-subtitle fade-in delay-1">分享技术，记录生活</p>
      </div>
    </div> -->

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
              </div>
            </div>
          </div>
        </nav>
      </header>
    </el-affix>

    <main class="main-content">
      <h1 class="fade-in">欢迎来到及时嗨</h1>
      <p class="fade-in delay-1">源于"Web Log(网络日志)"，后来缩写为Blog</p>

      <el-row :gutter="20" class="cards-container fade-in delay-2">
        <el-col :span="8">
          <el-card class="card">
            <h3>项目展示</h3>
            <p>浏览我的最新作品和项目案例</p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="card">
            <h3>技术分享</h3>
            <p>阅读我的技术博客和学习笔记</p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card class="card">
            <h3>关于我</h3>
            <p>了解我的背景和专业技能</p>
          </el-card>
        </el-col>
      </el-row>

      <ToolsSection />
    </main>

    <footer class="footer fade-in delay-3">
      <p>© 2023 Gishai. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, ref, onUnmounted } from 'vue'
import ToolsSection from '@/components/ToolsSection.vue'

const isMenuOpen = ref(false)
const isHeaderFixed = ref(false)

// 声明函数引用，以便在onUnmounted中移除事件监听
let checkScroll
let handleScroll

onMounted(() => {
  // 平滑滚动效果
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault()
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth',
      })
    })
  })

  // 滚动动画效果
  checkScroll = () => {
    const scrollAnimations = document.querySelectorAll('.scroll-animation')
    scrollAnimations.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top
      const windowHeight = window.innerHeight
      if (elementTop < windowHeight * 0.8) {
        element.classList.add('active')
      }
    })
  }

  // 监听滚动固定header
  handleScroll = () => {
    const heroSection = document.querySelector('.hero-section')
    if (heroSection) {
      const heroHeight = heroSection.offsetHeight
      isHeaderFixed.value = window.scrollY > heroHeight - 80
    }
  }

  // 初始检查
  checkScroll()
  handleScroll()

  // 添加滚动事件监听
  window.addEventListener('scroll', checkScroll)
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  // 移除滚动监听
  window.removeEventListener('scroll', checkScroll)
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

:root {
  --primary-color: #0066cc;
  --secondary-color: #004d99;
  --text-color: #333;
  --card-background: white;
  --shadow-color: rgba(0, 0, 0, 0.1);
  --animation-duration: 1s;
}

/* 新的Bootstrap风格导航栏样式 */
.header {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 0;
  transition: all 0.3s ease;
  width: 100%;
  height: 60px; /* 固定导航栏高度 */
}

.navbar {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem;
  height: 100%; /* 使navbar填充整个header高度 */
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
}

.nav-link:hover {
  color: #0066cc;
  background-color: rgba(0, 102, 204, 0.05);
}

.nav-link.active {
  color: #0066cc;
  font-weight: bold;
  border-bottom: none; /* 移除边框，改用伪元素 */
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
  }

  .nav-link.active::after {
    display: none; /* 在移动端不显示下划线 */
  }

  .nav-link.active {
    border-left: 3px solid #0066cc; /* 在移动端使用左边框代替下划线 */
    padding-left: calc(1rem - 3px); /* 调整内边距以保持对齐 */
    background-color: rgba(0, 102, 204, 0.05);
  }

  .nav-link:last-child {
    border-bottom: none;
  }

  /* 修复卡片布局 */
  .cards-container {
    flex-direction: column;
    align-items: center;
  }

  .card,
  .tool-card {
    width: 90%;
    max-width: 350px;
    margin-bottom: 1.5rem;
  }

  /* 调整行列布局 */
  .el-row {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }

  .el-col {
    width: 100%;
    max-width: 100%;
    flex: 0 0 100%;
    margin-bottom: 1.5rem;
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

  .el-col {
    width: 50%;
    max-width: 50%;
    flex: 0 0 50%;
  }
}

@media (min-width: 993px) {
  .navbar-nav {
    gap: 1.5rem;
  }
}

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

.delay-1 {
  animation-delay: 0.5s;
}

.delay-2 {
  animation-delay: 1s;
}

.delay-3 {
  animation-delay: 1.5s;
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

/* 平滑滚动样式 */
html {
  scroll-behavior: smooth;
}

@media (max-width: 768px) {
  .nav {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0.75rem;
  }

  .nav-links {
    flex-direction: column;
    gap: 0.5rem;
    width: 100%;
    padding: 0.25rem 0;
  }

  .nav-link {
    width: 100%;
    text-align: center;
    padding: 0.25rem 0.5rem;
  }

  .cards-container {
    flex-direction: column;
    align-items: center;
  }

  .card,
  .tool-card {
    width: 90%;
    max-width: 350px;
    margin-bottom: 1.5rem;
  }
}
.cards-container {
  display: flex;
  justify-content: center;
  gap: 2.5rem;
  margin: 4rem auto;
  flex-wrap: wrap;
  max-width: 1200px;
  padding: 0 2rem;
}

.card {
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  width: 300px;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(0, 102, 204, 0.1);
}

.card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.12);
  background: linear-gradient(135deg, #ffffff 0%, #f0f6ff 100%);
}

.tool-card {
  background: var(--card-background, white);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 2.5rem;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  margin: 0.5rem;
}

.tool-card:hover {
  transform: translateY(-12px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  background: linear-gradient(135deg, #f5f9ff 0%, #e6f0ff 100%);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--primary-color, #0066cc);
}

.card-btn {
  background-color: var(--primary-color, #0066cc);
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s, transform 0.3s;
  margin-top: auto;
}

.card-btn:hover {
  background-color: var(--secondary-color, #004d99);
  transform: scale(1.05);
}

.footer {
  text-align: center;
  padding: 2rem;
  background-color: #f8f9fa;
  margin-top: auto;
}

@media (max-width: 768px) {
  .menu-btn {
    display: block;
  }
  .nav-links {
    position: absolute;
    top: 56px;
    right: 0;
    left: 0;
    background: #fff;
    flex-direction: column;
    gap: 0.5rem;
    width: 100vw;
    padding: 0.5rem 0;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    z-index: 1001;
    display: none;
    transition: all 0.3s;
  }
  .nav-links.open {
    display: flex;
  }
  .nav {
    position: relative;
  }
}
</style>
