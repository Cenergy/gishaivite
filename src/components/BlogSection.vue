<template>
  <div>
    <!-- 博客区域 -->
    <div class="section-title scroll-animation">
      <h2 class="dark:text-gray-100">最新博客</h2>
      <div class="underline"></div>
    </div>

    <div class="blog-container scroll-animation">
      <div class="blog-card bg-white dark:bg-dark shadow-md dark:shadow-gray-800">
        <div class="blog-image">
          <img
            src="@/assets/blog-placeholder-1.jpg"
            alt="博客图片"
            onerror="this.src='https://gishai.top/assets/img/qrcode_for_weixin.6e038798.jpg'"
          />
        </div>
        <div class="blog-content dark:text-gray-200">
          <div class="blog-meta">
            <div class="blog-date dark:text-gray-300">2023-12-15</div>
            <div class="blog-tags">
              <el-tag size="small" type="success">Vue3</el-tag>
              <el-tag size="small" type="info">前端</el-tag>
            </div>
          </div>
          <h3 class="blog-title dark:text-white">Vue3 组合式API的最佳实践</h3>
          <p class="blog-excerpt dark:text-gray-300">
            探索Vue3组合式API的强大功能，了解如何使用setup、ref、reactive等特性构建更可维护的应用...
          </p>
          <el-button type="primary" class="blog-btn">阅读更多</el-button>
        </div>
      </div>

      <div class="blog-card bg-white dark:bg-dark shadow-md dark:shadow-gray-800">
        <div class="blog-image">
          <img
            src="@/assets/blog-placeholder-2.jpg"
            alt="博客图片"
            onerror="this.src='https://gishai.top/assets/img/qrcode_for_weixin.6e038798.jpg'"
          />
        </div>
        <div class="blog-content dark:text-gray-200">
          <div class="blog-meta">
            <div class="blog-date dark:text-gray-300">2023-11-28</div>
            <div class="blog-tags">
              <el-tag size="small" type="danger">GIS</el-tag>
              <el-tag size="small" type="warning">可视化</el-tag>
            </div>
          </div>
          <h3 class="blog-title dark:text-white">GIS数据可视化技术解析</h3>
          <p class="blog-excerpt dark:text-gray-300">
            深入了解地理信息系统(GIS)数据可视化的关键技术，包括地图投影、符号化和交互设计...
          </p>
          <el-button type="primary" class="blog-btn">阅读更多</el-button>
        </div>
      </div>

      <div class="blog-card bg-white dark:bg-dark shadow-md dark:shadow-gray-800">
        <div class="blog-image">
          <img
            src="@/assets/blog-placeholder-3.jpg"
            alt="博客图片"
            onerror="this.src='https://gishai.top/assets/img/qrcode_for_weixin.6e038798.jpg'"
          />
        </div>
        <div class="blog-content dark:text-gray-200">
          <div class="blog-meta">
            <div class="blog-date dark:text-gray-300">2023-10-15</div>
            <div class="blog-tags">
              <el-tag size="small" type="primary">Element Plus</el-tag>
              <el-tag size="small" type="info">UI框架</el-tag>
            </div>
          </div>
          <h3 class="blog-title dark:text-white">Element Plus在Vue项目中的应用</h3>
          <p class="blog-excerpt dark:text-gray-300">
            Element Plus作为一款流行的Vue3 UI框架，如何在实际项目中高效应用？本文分享实战经验...
          </p>
          <el-button type="primary" class="blog-btn">阅读更多</el-button>
        </div>
      </div>
    </div>

    <div class="view-more-container">
      <router-link to="/blog" class="view-more-btn">
        查看更多博客
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

.blog-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 2rem;
  margin: 2rem auto;
  max-width: 1200px;
}

.blog-card {
  background: #ffffff;
  padding-top: 1rem;
  border-radius: 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.4s ease;
  width: 350px;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(0, 102, 204, 0.1);
}

.blog-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
}

.blog-image {
  height: 200px;
  overflow: hidden;
}

.blog-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.blog-card:hover .blog-image img {
  transform: scale(1.05);
}

.blog-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.blog-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.blog-date {
  font-size: 0.85rem;
  color: #666;
}

.blog-tags {
  display: flex;
  gap: 0.5rem;
}

.blog-tags .el-tag {
  margin: 0;
  font-size: 0.7rem;
}

.blog-title {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #333;
  font-weight: 600;
  line-height: 1.4;
}

.blog-excerpt {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
  flex-grow: 1;
}

.blog-btn {
  align-self: center;
  margin-top: auto;
}

.view-more-container {
  text-align: center;
  margin: 2rem 0 4rem;
}

.view-more-btn {
  display: inline-flex;
  align-items: center;
  color: #0066cc;
  font-weight: 600;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.view-more-btn:hover {
  background-color: rgba(0, 102, 204, 0.1);
  transform: translateX(5px);
}

.view-more-btn i {
  margin-left: 0.5rem;
  transition: transform 0.3s ease;
}

.view-more-btn:hover i {
  transform: translateX(3px);
}

/* 响应式样式 */
@media (max-width: 1200px) {
  .blog-container {
    padding: 0 2rem;
  }
}

@media (max-width: 992px) {
  .blog-card {
    width: 300px;
  }
}

@media (max-width: 768px) {
  .blog-container {
    flex-direction: column;
    align-items: center;
  }

  .blog-card {
    width: 90%;
    max-width: 400px;
  }

  .section-title h2 {
    font-size: 2rem;
  }

  .blog-meta {
    flex-direction: column;
    align-items: flex-start;
  }

  .blog-tags {
    margin-top: 0.5rem;
  }
}
</style>
