<template>
  <div>
    <!-- 关注区域 -->
    <div class="section-title scroll-animation">
      <h2 class="dark:text-gray-100">关注我们</h2>
      <div class="underline"></div>
    </div>

    <div class="follow-container scroll-animation">
      <!-- 微信卡片 -->
      <div class="follow-card bg-white dark:bg-dark shadow-md dark:shadow-gray-800">
        <div class="follow-content dark:text-gray-200">
          <div class="follow-icon dark:text-gray-100">
            <el-icon><ChatDotSquare /></el-icon>
          </div>
          <h3 class="follow-title dark:text-white">微信公众号</h3>
          <p class="follow-description dark:text-gray-300">获取最新技术文章和资源更新</p>
          <div class="qrcode-container dark:border-gray-700">
            <img
              class="qrcode-image"
              src="https://gishai.top/assets/img/qrcode_for_weixin.6e038798.jpg"
              alt="微信公众号二维码"
            />
          </div>
          <a href="#" class="follow-link dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >关注公众号</a
          >
        </div>
      </div>

      <!-- 微博卡片 -->
      <div class="follow-card bg-white dark:bg-dark shadow-md dark:shadow-gray-800">
        <div class="follow-content dark:text-gray-200">
          <div class="follow-icon dark:text-gray-100">
            <el-icon><Promotion /></el-icon>
          </div>
          <h3 class="follow-title dark:text-white">微博</h3>
          <p class="follow-description dark:text-gray-300">关注我们的微博，获取实时动态</p>
          <div class="social-image dark:border-gray-700">
            <img
              class="platform-image"
              src="https://gishai.top/assets/img/small_applets.df610077.jpg"
              alt="微博主页"
            />
          </div>
          <a href="#" class="follow-link dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >前往微博</a
          >
        </div>
      </div>

      <!-- GitHub卡片 -->
      <div class="follow-card bg-white dark:bg-dark shadow-md dark:shadow-gray-800">
        <div class="follow-content dark:text-gray-200">
          <div class="follow-icon dark:text-gray-100">
            <el-icon><Platform /></el-icon>
          </div>
          <h3 class="follow-title dark:text-white">GitHub</h3>
          <p class="follow-description dark:text-gray-300">查看我们的开源项目和代码仓库</p>
          <div class="social-image dark:border-gray-700">
            <img
              class="platform-image"
              src="https://gishai.top/assets/img/small_applets.df610077.jpg"
              alt="GitHub仓库"
            />
          </div>
          <a href="#" class="follow-link dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
            >访问GitHub</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ChatDotSquare, Promotion, Platform, User } from '@element-plus/icons-vue'
// 组件逻辑可以在这里添加
</script>

<style scoped>
.section-title {
  text-align: center;
  margin: 4rem 0 2rem;
}

.section-title h2 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
  /* 添加暗黑模式文字颜色 */
  @apply dark:text-white;
}

.underline {
  height: 4px;
  width: 80px;
  background: linear-gradient(90deg, #0066cc, #66b3ff);
  margin: 0 auto;
  border-radius: 2px;
  /* 添加暗黑模式样式 */
  @apply dark:bg-gradient-to-r dark:from-blue-600 dark:to-blue-400;
}

.follow-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin: 2rem auto 4rem;
  max-width: 1200px;
  padding: 0 2rem;
}

.follow-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  text-align: center;
  border: 1px solid rgba(0, 102, 204, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  /* 添加暗黑模式样式 */
  @apply dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:text-gray-200 dark:border-gray-700 dark:shadow-gray-900/30;
}

.follow-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
  /* 添加暗黑模式悬停样式 */
  @apply dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-800 dark:shadow-gray-900/40;
}

.follow-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;
}

.follow-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #f0f6ff;
  color: #0066cc;
  font-size: 1.8rem;
  margin: 0 auto 1.5rem;
  transition: all 0.3s ease;
  /* 添加暗黑模式样式 */
  @apply dark:bg-gray-700 dark:text-blue-400;
}

.follow-card:hover .follow-icon {
  background-color: #0066cc;
  color: white;
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 102, 204, 0.3);
}

.follow-title {
  font-size: 1.6rem;
  margin-bottom: 0.8rem;
  color: #333;
  /* 添加暗黑模式文字颜色 */
  @apply dark:text-white;
}

.follow-description {
  color: #666;
  margin-bottom: 1.5rem;
  font-size: 1rem;
  /* 添加暗黑模式文字颜色 */
  @apply dark:text-gray-300;
}

.qrcode-container,
.social-image {
  margin: 1rem auto;
  max-width: 180px;
}

.qrcode-image,
.platform-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.qrcode-image:hover,
.platform-image:hover {
  transform: scale(1.05);
}

.follow-link {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.6rem 1.5rem;
  background-color: #0066cc;
  color: white;
  border-radius: 30px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  /* 添加暗黑模式样式 */
  @apply dark:bg-blue-600 dark:text-white dark:hover:bg-blue-700;
}

.follow-link:hover {
  background-color: #004c99;
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0, 102, 204, 0.3);
}

/* 响应式样式 */
@media (max-width: 1200px) {
  .follow-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 992px) {
  .follow-container {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .follow-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .follow-card {
    padding: 1.5rem;
  }

  .follow-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }

  .follow-title {
    font-size: 1.4rem;
  }

  .follow-description {
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .qrcode-container,
  .social-image {
    max-width: 140px;
  }

  .follow-link {
    padding: 0.5rem 1.2rem;
    font-size: 0.9rem;
  }
}

/* 动画效果 */
.scroll-animation {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.scroll-animation.active {
  opacity: 1;
  transform: translateY(0);
}
</style>
