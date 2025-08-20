<template>
  <div class="test-container">
    <!-- 左侧功能点击栏 -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h3>测试用例</h3>
      </div>
      <div class="test-list">
        <button 
          v-for="(test, index) in testList" 
          :key="index"
          class="test-button"
          :class="{ active: activeTest === index }"
          @click="selectTest(index)"
          :title="test.description"
        >
          <div class="test-info">
            <div class="test-name">{{ test.name }}</div>
          </div>
          <div class="test-tooltip">{{ test.description }}</div>
        </button>
      </div>
    </div>

    <!-- 右侧展示区域 -->
    <div class="content-area">
       <div v-if="!currentTest" class="empty-state">
          <div class="empty-icon">📋</div>
          <h3>选择一个测试用例</h3>
          <p>从左侧列表中选择一个测试用例来查看详细内容</p>
        </div>
        <component 
          v-else-if="currentTest.component" 
          :is="currentTest.component"
          class="test-component"
        />
        <div v-else class="test-content">
          <h4>{{ currentTest.name }}</h4>
          <p>{{ currentTest.content || '该测试用例暂无具体内容' }}</p>
        </div>
    </div>
  </div>
</template>

<script setup lang="js">
import { ref, computed, defineAsyncComponent } from 'vue'

// 测试用例列表
const testList = [
  {
    name: "三维测试",
    description: "3D模型展示和交互测试",
    icon: "🎮",
    component: defineAsyncComponent(() => import("@/views/ThreeDView.vue"))
  },
  {
    name: "地图测试",
    description: "地图功能和图片标记测试",
    icon: "🗺️",
    component: defineAsyncComponent(() => import("@/views/GalleryMapView.vue"))
  },
  {
    name: "图库测试",
    description: "图片展示和筛选功能测试",
    icon: "🖼️",
    component: defineAsyncComponent(() => import("@/views/GalleryView.vue"))
  },
  {
    name: "API测试",
    description: "接口调用和数据处理测试",
    icon: "🔌",
    content: "这里可以添加API测试相关的内容和工具"
  },
  {
    name: "组件测试",
    description: "UI组件功能和样式测试",
    icon: "🧩",
    content: "这里可以添加各种组件的测试用例"
  }
]

// 当前选中的测试用例索引
const activeTest = ref(null)

// 当前测试用例
const currentTest = computed(() => {
  return activeTest.value !== null ? testList[activeTest.value] : null
})

// 选择测试用例
const selectTest = (index) => {
  activeTest.value = index
}
</script>

<style scoped>
@import "@/assets/styles/animations.css";

.test-container {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 左侧边栏样式 */
.sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #e0e0e0;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.test-list {
  padding: 10px 0;
}

.test-button {
  width: max-content;
  margin: 10px;
  padding: 16px 20px;
  border: none;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 4px solid transparent;
  border-radius: 12px;
  text-align: left;
  font-family: inherit;
  outline: none;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.test-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.test-button:hover {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  transform: translateX(6px) scale(1.02);
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
}

.test-button:hover::before {
  opacity: 1;
}

.test-button.active {
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  transform: translateX(8px) scale(1.03);
  box-shadow: 0 6px 25px rgba(33, 150, 243, 0.3), 0 3px 12px rgba(0, 0, 0, 0.15);
}

.test-button.active::before {
  background: linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(25, 118, 210, 0.1) 100%);
  opacity: 1;
}

.test-button:focus {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}

.test-button:active {
  transform: translateX(4px) scale(0.98);
  transition: all 0.1s ease;
}

.test-icon {
  margin-right: 15px;
  font-size: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.test-button:hover .test-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: rotate(5deg) scale(1.1);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.test-button.active .test-icon {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
  transform: rotate(-5deg) scale(1.15);
  box-shadow: 0 6px 16px rgba(33, 150, 243, 0.4);
}

.test-button:hover .test-icon .icon,
.test-button.active .test-icon .icon {
  filter: brightness(0) invert(1);
}

.test-info {
  flex: 1;
  position: relative;
  z-index: 1;
}

.test-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
  font-size: 15px;
  letter-spacing: 0.3px;
  transition: all 0.3s ease;
}

.test-button:hover .test-name {
  color: #667eea;
  transform: translateX(2px);
}

.test-button.active .test-name {
  color: #2196f3;
  transform: translateX(4px);
  font-weight: 700;
}

.test-tooltip {
  position: absolute;
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  margin-left: 15px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: white;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  pointer-events: none;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2), 0 4px 10px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  letter-spacing: 0.3px;
}

.test-tooltip::before {
  content: '';
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border: 6px solid transparent;
  border-right-color: #2c3e50;
  filter: drop-shadow(-1px 0 2px rgba(0, 0, 0, 0.1));
}

.test-button:hover .test-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateY(-50%) translateX(5px) scale(1.02);
}

/* 右侧内容区域样式 */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.content-header {
  padding: 20px 30px;
  border-bottom: 1px solid #e0e0e0;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.content-header h2 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 24px;
  font-weight: 600;
}

.test-description {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.content-body {
  flex: 1;
  overflow-y: auto;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  color: #666;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

/* 测试组件容器 */
.test-component {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.test-content {
  padding: 20px;
  background: #f9f9f9;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.test-content h4 {
  margin: 0 0 12px 0;
  color: #333;
}

.test-content p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .test-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    max-height: 80vh;
    overflow-y: auto;
  }
}

/* 动画效果 */
.test-button {
  animation: fadeIn 0.3s ease-out;
}

.content-area {
  animation: fadeIn 0.5s ease-out;
}

.test-component {
  animation: fadeIn 0.4s ease-out;
}
</style>
