<template>
  <div>
    <!-- 资源区域 -->
    <div class="section-title scroll-animation">
      <h2>资源下载</h2>
      <div class="underline"></div>
    </div>

    <div class="resources-container scroll-animation">
      <div class="resource-card">
        <div class="resource-icon">📚</div>
        <div class="resource-content">
          <h3 class="resource-title">Vue3 完全指南</h3>
          <p class="resource-description">
            全面介绍Vue3的新特性、Composition API和最佳实践的电子书
          </p>
          <div class="resource-meta">
            <span class="resource-size">5.2MB</span>
            <span class="resource-format">PDF</span>
          </div>
          <el-button type="primary" class="resource-btn">下载资源</el-button>
        </div>
      </div>

      <div class="resource-card">
        <div class="resource-icon">🧩</div>
        <div class="resource-content">
          <h3 class="resource-title">GIS数据处理工具包</h3>
          <p class="resource-description">包含常用GIS数据处理脚本和工具的开源软件包</p>
          <div class="resource-meta">
            <span class="resource-size">12.8MB</span>
            <span class="resource-format">ZIP</span>
          </div>
          <el-button type="primary" class="resource-btn">下载资源</el-button>
        </div>
      </div>

      <div class="resource-card">
        <div class="resource-icon">🎨</div>
        <div class="resource-content">
          <h3 class="resource-title">Element Plus UI模板</h3>
          <p class="resource-description">基于Element Plus的后台管理系统UI模板，包含多种常用组件</p>
          <div class="resource-meta">
            <span class="resource-size">8.5MB</span>
            <span class="resource-format">ZIP</span>
          </div>
          <el-button type="primary" class="resource-btn">下载资源</el-button>
        </div>
      </div>
      <div class="resource-card">
        <div class="resource-icon">🎨</div>
        <div class="resource-content">
          <h3 class="resource-title">Element Plus UI模板</h3>
          <p class="resource-description">基于Element Plus的后台管理系统UI模板，包含多种常用组件</p>
          <div class="resource-meta">
            <span class="resource-size">8.5MB</span>
            <span class="resource-format">ZIP</span>
          </div>
          <el-button type="primary" class="resource-btn">下载资源</el-button>
        </div>
      </div>
    </div>

    <div class="view-more-container">
      <router-link to="/resources" class="view-more-btn">
        查看更多资源
        <i class="el-icon-arrow-right"></i>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
// 组件逻辑可以在这里添加
</script>

<style scoped>
.section-title {
  text-align: center;
  margin-bottom: 3rem;
  margin-top: 4rem;
}

.section-title h2 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 1rem;
}

.underline {
  height: 4px;
  width: 80px;
  background: linear-gradient(90deg, #0066cc, #66a3ff);
  margin: 0 auto;
  border-radius: 2px;
}

.resources-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  justify-content: center;
}

.resource-card {
  display: flex;
  background: linear-gradient(135deg, #ffffff 0%, #f8faff 100%);
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  width: calc(50% - 1rem);
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1px solid rgba(0, 102, 204, 0.1);
  /* 添加暗黑模式样式 */
  @apply dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900 dark:text-gray-200 dark:border-gray-700 dark:shadow-gray-900/30;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  background: linear-gradient(135deg, #ffffff 0%, #f0f6ff 100%);
  /* 添加暗黑模式悬停样式 */
  @apply dark:bg-gradient-to-br dark:from-gray-700 dark:to-gray-800 dark:shadow-gray-900/40;
}

.resource-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  padding: 1.5rem;
  background-color: rgba(0, 102, 204, 0.05);
  color: #0066cc;
  min-width: 100px;
  /* 添加暗黑模式样式 */
  @apply dark:bg-gray-700 dark:text-blue-400;
}

.resource-content {
  padding: 1.5rem;
  flex: 1;
}

.resource-title {
  font-size: 1.25rem;
  margin-bottom: 0.75rem;
  color: #333;
  /* 添加暗黑模式文字颜色 */
  @apply dark:text-white;
}

.resource-description {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
  /* 添加暗黑模式文字颜色 */
  @apply dark:text-gray-300;
}

.resource-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #888;
  /* 添加暗黑模式文字颜色 */
  @apply dark:text-gray-400;
}

.resource-size,
.resource-format {
  display: inline-flex;
  align-items: center;
}

.resource-size::before {
  content: '📊';
  margin-right: 0.25rem;
}

.resource-format::before {
  content: '📄';
  margin-right: 0.25rem;
}

.resource-btn {
  margin-top: 0.5rem;
}

.view-more-container {
  text-align: center;
  margin-top: 2.5rem;
  margin-bottom: 2rem;
}

.view-more-btn {
  display: inline-flex;
  align-items: center;
  color: #0066cc;
  font-weight: 600;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s;
}

.view-more-btn:hover {
  background-color: rgba(0, 102, 204, 0.1);
  transform: translateY(-2px);
}

.view-more-btn i {
  margin-left: 0.5rem;
  transition: transform 0.3s;
}

.view-more-btn:hover i {
  transform: translateX(3px);
}

/* 响应式样式 */
@media (max-width: 768px) {
  .resources-container {
    padding: 0 1rem;
  }

  .resource-card {
    flex-direction: column;
    width: 100%;
  }

  .resource-icon {
    min-width: auto;
    padding: 1.5rem 0;
    width: 100%;
  }
}

@media (min-width: 769px) and (max-width: 992px) {
  .resources-container {
    max-width: 900px;
  }

  .resource-card {
    width: calc(50% - 1rem);
  }
}

@media (min-width: 993px) {
  .resource-card {
    width: calc(50% - 1rem);
  }
}
</style>
