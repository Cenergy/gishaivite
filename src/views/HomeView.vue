<template>
  <div class="home">
    <header class="header">
      <nav class="nav">
        <router-link to="/" class="logo">及时嗨</router-link>
        <button class="menu-btn" @click="isMenuOpen = !isMenuOpen" aria-label="菜单" :aria-expanded="isMenuOpen.toString()">
          <span class="menu-icon" :class="{ open: isMenuOpen }">
            <span></span><span></span><span></span>
          </span>
        </button>
        <div class="nav-links" :class="{ open: isMenuOpen }">
          <router-link to="/home" class="nav-link" active-class="active-link">首页</router-link>
          <router-link to="/blog" class="nav-link" active-class="active-link">博客</router-link>
          <router-link to="/projects" class="nav-link" active-class="active-link">项目</router-link>
          <router-link to="/contact" class="nav-link" active-class="active-link">联系</router-link>
        </div>
      </nav>
    </header>
    
    <main class="main-content">
      <h1 class="fade-in">欢迎来到及时嗨</h1>
      <p class="fade-in delay-1">源于"Web Log(网络日志)"，后来缩写为Blog</p>
      
      <div class="cards-container fade-in delay-2">
        <div class="card">
          <h3>项目展示</h3>
          <p>浏览我的最新作品和项目案例</p>
        </div>
        <div class="card">
          <h3>技术分享</h3>
          <p>阅读我的技术博客和学习笔记</p>
        </div>
        <div class="card">
          <h3>关于我</h3>
          <p>了解我的背景和专业技能</p>
        </div>
      </div>
      
      <!-- 工具区域 -->
      <div class="section-title scroll-animation">
        <h2>实用工具</h2>
        <div class="underline"></div>
      </div>
      
      <div class="cards-container scroll-animation">
        <div class="card tool-card">
          <div class="card-icon">🔍</div>
          <h3>GIS数据查询</h3>
          <p>快速查询和检索地理信息系统数据，支持多种格式和坐标系</p>
          <button class="card-btn">立即使用</button>
        </div>
        
        <div class="card tool-card">
          <div class="card-icon">🗺️</div>
          <h3>地图可视化</h3>
          <p>将复杂的地理数据转化为直观的可视化地图，支持自定义样式</p>
          <button class="card-btn">立即使用</button>
        </div>
        
        <div class="card tool-card">
          <div class="card-icon">📊</div>
          <h3>空间分析</h3>
          <p>强大的空间分析工具，支持缓冲区分析、叠加分析和网络分析</p>
          <button class="card-btn">立即使用</button>
        </div>
        
        <div class="card tool-card">
          <div class="card-icon">📱</div>
          <h3>移动端采集</h3>
          <p>便捷的移动端数据采集工具，支持离线采集和实时同步</p>
          <button class="card-btn">立即使用</button>
        </div>
      </div>
    </main>
    
    <footer class="footer fade-in delay-3">
      <p>© 2023 Gishai. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const isMenuOpen = ref(false);

onMounted(() => {
  // 平滑滚动效果
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });
  // 滚动动画效果
  const scrollAnimations = document.querySelectorAll('.scroll-animation');
  const checkScroll = () => {
    scrollAnimations.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      if (elementTop < windowHeight * 0.8) {
        element.classList.add('active');
      }
    });
  };
  // 初始检查
  checkScroll();
  // 滚动时检查
  window.addEventListener('scroll', checkScroll);
});
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

.header {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 1rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #333;
  text-decoration: none;
  transition: all 0.3s;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.nav-link:hover {
  color: #0066cc;
  background-color: rgba(0, 102, 204, 0.1);
}

.active-link {
  color: #0066cc;
  font-weight: bold;
  border-bottom: 2px solid #0066cc;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
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
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
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
  
  .card, .tool-card {
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
.menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 1rem;
  z-index: 1002;
}
.menu-icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 28px;
  height: 28px;
  position: relative;
  transition: all 0.3s;
}
.menu-icon span {
  display: block;
  height: 3px;
  width: 100%;
  background: #333;
  margin: 4px 0;
  border-radius: 2px;
  transition: all 0.3s;
}
.menu-icon.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}
.menu-icon.open span:nth-child(2) {
  opacity: 0;
}
.menu-icon.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
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
    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
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