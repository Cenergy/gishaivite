<template>
  <div>
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
        <el-button
          type="primary"
          class="card-btn"
          @click="openToolDialog('gis-query', 'GIS数据查询')"
          >立即使用</el-button
        >
      </div>

      <div class="card tool-card">
        <div class="card-icon">🗺️</div>
        <h3>地图可视化</h3>
        <p>将复杂的地理数据转化为直观的可视化地图，支持自定义样式</p>
        <el-button
          type="primary"
          class="card-btn"
          @click="openToolDialog('map-visualization', '地图可视化')"
          >立即使用</el-button
        >
      </div>

      <div class="card tool-card">
        <div class="card-icon">📊</div>
        <h3>空间分析</h3>
        <p>强大的空间分析工具，支持缓冲区分析、叠加分析和网络分析</p>
        <el-button
          type="primary"
          class="card-btn"
          @click="openToolDialog('spatial-analysis', '空间分析')"
          >立即使用</el-button
        >
      </div>

      <div class="card tool-card">
        <div class="card-icon">📱</div>
        <h3>移动端采集</h3>
        <p>便捷的移动端数据采集工具，支持离线采集和实时同步</p>
        <el-button
          type="primary"
          class="card-btn"
          @click="openToolDialog('mobile-collection', '移动端采集')"
          >立即使用</el-button
        >
      </div>
      <div class="card tool-card">
        <div class="card-icon">📱</div>
        <h3>移动端采集</h3>
        <p>便捷的移动端数据采集工具，支持离线采集和实时同步</p>
        <el-button
          type="primary"
          class="card-btn"
          @click="openToolDialog('mobile-collection', '移动端采集')"
          >立即使用</el-button
        >
      </div>

      <div class="card tool-card">
        <div class="card-icon">🔄</div>
        <h3>坐标转换</h3>
        <p>支持WGS84、GCJ02、BD09等常用坐标系之间的转换</p>
        <el-button
          type="primary"
          class="card-btn"
          @click="openToolDialog('coordinate-transform', '坐标转换')"
          >立即使用</el-button
        >
      </div>
    </div>

    <!-- 通用弹窗组件 -->
    <ToolDialog
      v-if="showDialog"
      :dialog-title="dialogTitle"
      :tool-type="currentToolType"
      :dialog-attrs="dialogAttrs"
      @close="closeDialog"
      @confirm="handleDialogConfirm"
      @opened="handleDialogOpened"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ToolDialog } from './Dialog/index'

// 弹窗状态管理
const showDialog = ref(false)
const dialogTitle = ref('')
const currentToolType = ref('')
const dialogAttrs = ref({}) // 存储额外的dialog属性

// 打开工具弹窗
const openToolDialog = (toolType: string, title: string, attrs = {}) => {
  currentToolType.value = toolType
  dialogTitle.value = title
  dialogAttrs.value = attrs
  showDialog.value = true
}

// 关闭弹窗
const closeDialog = () => {
  showDialog.value = false
}

// 处理弹窗确认
const handleDialogConfirm = () => {
  console.log('工具操作已确认:', currentToolType.value)
  // 这里可以添加具体的工具操作逻辑
  showDialog.value = false
}

// 处理弹窗打开事件
const handleDialogOpened = () => {
  console.log('工具对话框已打开:', currentToolType.value)
}
</script>

<style scoped>
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

  /* 移除冗余样式 */
  .menu-btn {
    display: none;
  }

  .nav-links {
    display: none;
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
