<template>
  <div class="gallery-section">
    <div class="section-title scroll-animation">
      <h2>精选相册</h2>
      <div class="underline"></div>
    </div>

    <div class="gallery-preview scroll-animation">
      <div v-for="(category, index) in featuredCategories" :key="index" class="gallery-preview-item">
        <router-link to="/gallery" class="gallery-preview-link">
          <div class="gallery-preview-image" :style="{ backgroundImage: `url(${category.coverImage})` }">
            <div class="gallery-preview-overlay">
              <h3>{{ category.name }}</h3>
              <p>{{ category.photoCount }}张照片</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>

    <div class="view-more-container">
      <router-link to="/gallery" class="view-more-btn">
        查看全部相册 <el-icon><ArrowRight /></el-icon>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'

// 精选相册分类
const featuredCategories = ref([
  {
    name: '自然风光',
    photoCount: 12,
    coverImage: 'https://picsum.photos/id/10/400/300'
  },
  {
    name: '城市风貌',
    photoCount: 8,
    coverImage: 'https://picsum.photos/id/20/400/300'
  },
  {
    name: '旅行记忆',
    photoCount: 15,
    coverImage: 'https://picsum.photos/id/40/400/300'
  }
])
</script>

<style scoped>
.gallery-section {
  margin: 4rem 0;
  width: 100%;
}

.section-title {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title h2 {
  font-size: 2rem;
  font-weight: bold;
  color: var(--primary-color, #0066cc);
  margin-bottom: 0.5rem;
  /* 添加暗黑模式样式 */
  @apply dark:text-blue-400;
}

.underline {
  height: 3px;
  width: 80px;
  background-color: var(--primary-color, #0066cc);
  margin: 0 auto;
  /* 添加暗黑模式样式 */
  @apply dark:bg-blue-400;
}

.gallery-preview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin: 2rem auto;
  max-width: 1200px;
  padding: 0 1rem;
}

.gallery-preview-item {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  height: 220px;
  /* 添加暗黑模式样式 */
  @apply dark:shadow-gray-900/30;
}

.gallery-preview-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.gallery-preview-link {
  display: block;
  height: 100%;
  text-decoration: none;
}

.gallery-preview-image {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
}

.gallery-preview-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  color: white;
  transition: opacity 0.3s ease;
}

.gallery-preview-overlay h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: bold;
}

.gallery-preview-overlay p {
  margin: 0;
  font-size: 0.9rem;
  opacity: 0.8;
}

.view-more-container {
  text-align: center;
  margin-top: 2rem;
}

.view-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: var(--primary-color, #0066cc);
  color: white;
  border-radius: 4px;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.3s, transform 0.3s;
  /* 添加暗黑模式样式 */
  @apply dark:bg-blue-600;
}

.view-more-btn:hover {
  background-color: var(--secondary-color, #004d99);
  transform: translateY(-2px);
  /* 添加暗黑模式悬停样式 */
  @apply dark:bg-blue-700;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .gallery-preview {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .gallery-preview {
    grid-template-columns: 1fr;
  }
}

/* 滚动动画 */
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