<template>
  <footer class="footer-section">
    <div class="footer-wave">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" preserveAspectRatio="none">
        <path
          fill="#e9f0f7"
          fill-opacity="0.5"
          d="M0,32L60,42.7C120,53,240,75,360,74.7C480,75,600,53,720,42.7C840,32,960,32,1080,37.3C1200,43,1320,53,1380,58.7L1440,64L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"
        ></path>
      </svg>
    </div>
    <div class="footer-container">
      <div class="footer-row">
        <!-- 网站信息 -->
        <div class="footer-col">
          <h3 class="footer-title">及时嗨</h3>
          <p class="footer-desc">分享技术，记录生活</p>
        </div>

        <!-- 快速链接 -->
        <div class="footer-col">
          <h3 class="footer-title">快速链接</h3>
          <ul class="footer-links">
            <li><router-link to="/home">友情链接</router-link></li>
          </ul>
        </div>

        <!-- 联系方式 -->
        <div class="footer-col">
          <h3 class="footer-title">联系我们</h3>
          <p class="contact-item">
            <el-icon><Message /></el-icon> <span>contact@gishai.top</span>
          </p>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="copyright">
        <p>© {{ currentYear }} 及时嗨. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted } from 'vue'
// 使用Element Plus提供的图标组件
import { Message } from '@element-plus/icons-vue'

// 获取当前年份
const currentYear = ref(new Date().getFullYear())

// 添加滚动动画效果
onMounted(() => {
  const footerCols = document.querySelectorAll('.footer-col')

  // 为每个列添加延迟动画
  footerCols.forEach((col, index) => {
    setTimeout(() => {
      col.classList.add('footer-col-visible')
    }, 100 * index)
  })
})
</script>

<style scoped>
.footer-section {
  background: linear-gradient(to bottom, #f8f9fa, #e9f0f7);
  color: #333;
  padding: 3rem 0 0 0;
  margin-top: 3rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 -5px 15px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
}

.footer-wave {
  position: absolute;
  top: -50px;
  left: 0;
  width: 100%;
  height: 50px;
  overflow: hidden;
}

.footer-wave svg {
  width: 100%;
  height: 100%;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.footer-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.footer-col {
  flex: 1;
  min-width: 200px;
  margin-bottom: 2rem;
  padding: 0 1rem;
  transition: transform 0.3s ease, opacity 0.3s ease;
  opacity: 0;
  transform: translateY(20px);
}

.footer-col-visible {
  opacity: 1;
  transform: translateY(0);
}

.footer-col:hover {
  transform: translateY(-5px);
}

.footer-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  position: relative;
  color: #0055b3;
  letter-spacing: 0.5px;
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.8);
}

.footer-title::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -8px;
  width: 40px;
  height: 2px;
  background: linear-gradient(to right, #0066cc, #4d94ff);
  border-radius: 2px;
}

.footer-desc {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #666;
  position: relative;
  padding-left: 10px;
}

.footer-desc::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 3px;
  height: 3px;
  background-color: #0066cc;
  border-radius: 50%;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-links a {
  color: #555;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-block;
  position: relative;
  padding-left: 0;
}

.footer-links a::before {
  content: '→';
  position: absolute;
  left: -15px;
  opacity: 0;
  transition: all 0.3s ease;
}

.footer-links a::after {
  content: '';
  position: absolute;
  width: 0;
  height: 2px;
  bottom: -2px;
  left: 0;
  background: linear-gradient(to right, #0066cc, #4d94ff);
  transition: width 0.3s ease;
  border-radius: 2px;
}

.footer-links a:hover {
  color: #0055b3;
  padding-left: 15px;
}

.footer-links a:hover::before {
  opacity: 1;
  left: 0;
}

.footer-links a:hover::after {
  width: 100%;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  color: #666;
}

.contact-item .el-icon {
  margin-right: 0.75rem;
  color: #0066cc;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.1));
  transition: transform 0.3s ease;
}

.contact-item:hover .el-icon {
  transform: scale(1.2);
}

.footer-bottom {
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding: 1.5rem 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(to right, rgba(0, 102, 204, 0.05), rgba(77, 148, 255, 0.05));
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  box-sizing: border-box;
  position: relative;
}

.copyright {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
}

/* 响应式样式 */
@media (max-width: 768px) {
  .footer-row {
    flex-direction: column;
  }

  .footer-col {
    width: 100%;
    margin-bottom: 2rem;
    padding: 0;
  }

  .footer-wave {
    top: -30px;
    height: 30px;
  }
}

@media (max-width: 480px) {
  .footer-section {
    padding: 2rem 0 0 0;
  }

  .footer-container {
    padding: 0 1rem;
  }

  .footer-title {
    font-size: 1.1rem;
  }
}
</style>
