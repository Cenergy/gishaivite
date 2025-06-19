<template>
  <div class="geo-worker-demo">
    <div class="demo-header">
      <h2>地理数据 Web Worker 处理演示</h2>
      <p class="description">
        使用 Web Worker 在后台处理大量地理数据，避免阻塞主线程
      </p>
    </div>

    <!-- 文件上传区域 -->
    <div class="upload-section">
      <div class="upload-area" @drop="handleDrop" @dragover.prevent @dragenter.prevent">
        <input
          ref="fileInput"
          type="file"
          accept=".json,.geojson"
          multiple
          @change="handleFileSelect"
          style="display: none"
        />
        <div class="upload-content" @click="$refs.fileInput.click()">
          <i class="i-tabler:upload upload-icon"></i>
          <p>点击选择或拖拽 GeoJSON 文件到此处</p>
          <p class="upload-hint">支持 .json 和 .geojson 格式</p>
        </div>
      </div>
      
      <!-- 生成测试数据按钮 -->
      <div class="test-data-section">
        <h3>或者生成测试数据</h3>
        <div class="test-data-controls">
          <div class="control-group">
            <label>数据类型:</label>
            <select v-model="testDataType">
              <option value="points">随机点数据</option>
              <option value="polygons">随机多边形</option>
              <option value="lines">随机线条</option>
              <option value="mixed">混合数据</option>
            </select>
          </div>
          <div class="control-group">
            <label>数据量:</label>
            <select v-model.number="testDataCount">
              <option :value="100">100 个要素</option>
              <option :value="500">500 个要素</option>
              <option :value="1000">1000 个要素</option>
              <option :value="5000">5000 个要素</option>
              <option :value="10000">10000 个要素</option>
            </select>
          </div>
          <button @click="generateTestData" class="generate-btn">
            <i class="i-tabler:dice"></i>
            生成测试数据
          </button>
        </div>
      </div>
    </div>

    <!-- 处理选项 -->
    <div class="options-section" v-if="uploadedFiles.length > 0">
      <h3>处理选项</h3>
      <div class="options-grid">
        <div class="option-group">
          <label>
            <input type="checkbox" v-model="options.simplify" />
            简化几何图形
          </label>
          <div v-if="options.simplify" class="sub-option">
            <label>
              容差值: 
              <input 
                type="number" 
                v-model.number="options.tolerance" 
                min="0.0001" 
                max="0.01" 
                step="0.0001"
                class="tolerance-input"
              />
            </label>
          </div>
        </div>

        <div class="option-group">
          <label>
            <input type="checkbox" v-model="options.filterByBounds" />
            按边界过滤
          </label>
          <div v-if="options.filterByBounds" class="bounds-inputs">
            <div class="bounds-row">
              <input type="number" v-model.number="bounds.minLng" placeholder="最小经度" />
              <input type="number" v-model.number="bounds.minLat" placeholder="最小纬度" />
            </div>
            <div class="bounds-row">
              <input type="number" v-model.number="bounds.maxLng" placeholder="最大经度" />
              <input type="number" v-model.number="bounds.maxLat" placeholder="最大纬度" />
            </div>
          </div>
        </div>

        <div class="option-group">
          <label>
            分块大小: 
            <select v-model.number="chunkSize">
              <option :value="500">500 (小文件)</option>
              <option :value="1000">1000 (中等文件)</option>
              <option :value="2000">2000 (大文件)</option>
              <option :value="5000">5000 (超大文件)</option>
            </select>
          </label>
        </div>
      </div>
    </div>

    <!-- 文件列表 -->
    <div class="files-section" v-if="uploadedFiles.length > 0">
      <h3>已上传文件 ({{ uploadedFiles.length }})</h3>
      <div class="files-list">
        <div 
          v-for="(file, index) in uploadedFiles" 
          :key="index" 
          class="file-item"
        >
          <div class="file-info">
            <i class="i-tabler:file-text"></i>
            <div class="file-details">
              <div class="file-name">{{ file.name }}</div>
              <div class="file-stats" v-if="file.stats">
                {{ file.stats.totalFeatures }} 个要素 | 
                {{ geoUtils.formatFileSize(file.stats.estimatedSize) }}
              </div>
            </div>
          </div>
          <button @click="removeFile(index)" class="remove-btn">
            <i class="i-tabler:x"></i>
          </button>
        </div>
      </div>

      <div class="action-buttons">
        <button 
          @click="processFiles" 
          :disabled="isProcessing"
          class="process-btn"
        >
          <i class="i-tabler:play" v-if="!isProcessing"></i>
          <i class="i-tabler:loader-2 animate-spin" v-else></i>
          {{ isProcessing ? '处理中...' : '开始处理' }}
        </button>
        <button @click="clearFiles" class="clear-btn">
          <i class="i-tabler:trash"></i>
          清空文件
        </button>
      </div>
    </div>

    <!-- 进度显示 -->
    <div class="progress-section" v-if="isProcessing">
      <h3>处理进度</h3>
      <div class="progress-container">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <div class="progress-text">{{ Math.round(progress) }}%</div>
      </div>
      <div class="progress-message" v-if="progressMessage">
        {{ progressMessage }}
      </div>
    </div>

    <!-- 错误显示 -->
    <div class="error-section" v-if="error">
      <div class="error-message">
        <i class="i-tabler:alert-circle"></i>
        {{ error }}
      </div>
    </div>

    <!-- 结果显示 -->
    <div class="results-section" v-if="result && !isProcessing">
      <h3>处理结果</h3>
      <div class="results-summary">
        <div class="summary-card" v-if="Array.isArray(result)">
          <h4>批量处理结果</h4>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">处理文件数:</span>
              <span class="stat-value">{{ result.length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">成功处理:</span>
              <span class="stat-value">{{ result.filter(r => !r.error).length }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">处理失败:</span>
              <span class="stat-value">{{ result.filter(r => r.error).length }}</span>
            </div>
          </div>
        </div>
        
        <div class="summary-card" v-else-if="result.metadata">
          <h4>单文件处理结果</h4>
          <div class="summary-stats">
            <div class="stat-item">
              <span class="stat-label">原始要素数:</span>
              <span class="stat-value">{{ result.metadata.originalCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">处理后要素数:</span>
              <span class="stat-value">{{ result.metadata.processedCount }}</span>
            </div>
            <div class="stat-item" v-if="result.metadata.simplified">
              <span class="stat-label">简化容差:</span>
              <span class="stat-value">{{ result.metadata.tolerance }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="result-actions">
        <button @click="downloadResult" class="download-btn">
          <i class="i-tabler:download"></i>
          下载处理结果
        </button>
        <button @click="visualizeResult" class="visualize-btn">
          <i class="i-tabler:map"></i>
          在地图上显示
        </button>
      </div>
    </div>

    <!-- Worker 状态 -->
    <div class="status-section">
      <h3>Worker 状态</h3>
      <div class="status-info">
        <div class="status-item">
          <span class="status-label">状态:</span>
          <span class="status-value" :class="{ 'status-ready': workerStatus.isReady }">
            {{ workerStatus.isReady ? '就绪' : '未就绪' }}
          </span>
        </div>
        <div class="status-item">
          <span class="status-label">待处理任务:</span>
          <span class="status-value">{{ workerStatus.pendingTasks }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useGeoWorker, geoUtils } from '@/composables/useGeoWorker'
import { ElMessage } from 'element-plus'

// 使用地理数据处理组合式函数
const {
  isProcessing,
  progress,
  progressMessage,
  error,
  result,
  processLargeGeoJSON,
  batchProcessGeoJSON,
  getWorkerStatus,
  resetState
} = useGeoWorker()

// 文件相关状态
const fileInput = ref(null)
const uploadedFiles = ref([])

// 处理选项
const options = reactive({
  simplify: false,
  tolerance: 0.001,
  filterByBounds: false
})

// 边界设置
const bounds = reactive({
  minLng: -180,
  minLat: -90,
  maxLng: 180,
  maxLat: 90
})

// 分块大小
const chunkSize = ref(1000)

// 测试数据相关
const testDataType = ref('points')
const testDataCount = ref(1000)

// Worker 状态
const workerStatus = ref({ isReady: false, pendingTasks: 0 })

// 更新 Worker 状态
const updateWorkerStatus = () => {
  workerStatus.value = getWorkerStatus()
}

// 生成随机坐标
const randomCoordinate = () => {
  const lng = Math.random() * 360 - 180 // -180 到 180
  const lat = Math.random() * 180 - 90  // -90 到 90
  return [lng, lat]
}

// 生成随机点数据
const generateRandomPoints = (count) => {
  const features = []
  for (let i = 0; i < count; i++) {
    features.push({
      type: 'Feature',
      properties: {
        id: i + 1,
        name: `Point ${i + 1}`,
        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        value: Math.floor(Math.random() * 100)
      },
      geometry: {
        type: 'Point',
        coordinates: randomCoordinate()
      }
    })
  }
  return features
}

// 生成随机多边形数据
const generateRandomPolygons = (count) => {
  const features = []
  for (let i = 0; i < count; i++) {
    const center = randomCoordinate()
    const size = Math.random() * 2 + 0.5 // 0.5 到 2.5 度
    const coordinates = [[
      [center[0] - size, center[1] - size],
      [center[0] + size, center[1] - size],
      [center[0] + size, center[1] + size],
      [center[0] - size, center[1] + size],
      [center[0] - size, center[1] - size] // 闭合
    ]]
    
    features.push({
      type: 'Feature',
      properties: {
        id: i + 1,
        name: `Polygon ${i + 1}`,
        area: (size * 2) * (size * 2),
        type: ['residential', 'commercial', 'industrial'][Math.floor(Math.random() * 3)]
      },
      geometry: {
        type: 'Polygon',
        coordinates
      }
    })
  }
  return features
}

// 生成随机线条数据
const generateRandomLines = (count) => {
  const features = []
  for (let i = 0; i < count; i++) {
    const start = randomCoordinate()
    const pointCount = Math.floor(Math.random() * 5) + 2 // 2-6个点
    const coordinates = [start]
    
    for (let j = 1; j < pointCount; j++) {
      const lastPoint = coordinates[j - 1]
      const nextPoint = [
        lastPoint[0] + (Math.random() - 0.5) * 2,
        lastPoint[1] + (Math.random() - 0.5) * 2
      ]
      coordinates.push(nextPoint)
    }
    
    features.push({
      type: 'Feature',
      properties: {
        id: i + 1,
        name: `Line ${i + 1}`,
        length: Math.random() * 100,
        highway: ['primary', 'secondary', 'tertiary'][Math.floor(Math.random() * 3)]
      },
      geometry: {
        type: 'LineString',
        coordinates
      }
    })
  }
  return features
}

// 生成测试数据
const generateTestData = () => {
  let features = []
  const count = testDataCount.value
  
  switch (testDataType.value) {
    case 'points':
      features = generateRandomPoints(count)
      break
    case 'polygons':
      features = generateRandomPolygons(count)
      break
    case 'lines':
      features = generateRandomLines(count)
      break
    case 'mixed':
      const pointCount = Math.floor(count * 0.5)
      const polygonCount = Math.floor(count * 0.3)
      const lineCount = count - pointCount - polygonCount
      features = [
        ...generateRandomPoints(pointCount),
        ...generateRandomPolygons(polygonCount),
        ...generateRandomLines(lineCount)
      ]
      break
  }
  
  const geoJSON = {
    type: 'FeatureCollection',
    features
  }
  
  // 计算统计信息
  const stats = {
    totalFeatures: features.length,
    estimatedSize: JSON.stringify(geoJSON).length
  }
  
  // 添加到文件列表
  uploadedFiles.value.push({
    name: `test_data_${testDataType.value}_${count}.geojson`,
    data: geoJSON,
    stats
  })
  
  ElMessage.success(`已生成 ${count} 个 ${testDataType.value} 测试数据`)
}

// 处理文件选择
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  processUploadedFiles(files)
}

// 处理拖拽上传
const handleDrop = (event) => {
  event.preventDefault()
  const files = Array.from(event.dataTransfer.files)
  processUploadedFiles(files)
}

// 处理上传的文件
const processUploadedFiles = async (files) => {
  for (const file of files) {
    if (file.type === 'application/json' || file.name.endsWith('.geojson') || file.name.endsWith('.json')) {
      try {
        const text = await file.text()
        const geoData = JSON.parse(text)
        
        if (geoUtils.isValidGeoJSON(geoData)) {
          const stats = geoUtils.getGeoJSONStats(geoData)
          uploadedFiles.value.push({
            name: file.name,
            data: geoData,
            stats,
            size: file.size
          })
        } else {
          ElMessage.error(`${file.name} 不是有效的 GeoJSON 文件`)
        }
      } catch (error) {
        ElMessage.error(`解析 ${file.name} 失败: ${error.message}`)
      }
    } else {
      ElMessage.warning(`${file.name} 不是支持的文件格式`)
    }
  }
}

// 移除文件
const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}

// 清空文件
const clearFiles = () => {
  uploadedFiles.value = []
  resetState()
}

// 处理文件
const processFiles = async () => {
  if (uploadedFiles.value.length === 0) {
    ElMessage.warning('请先上传文件')
    return
  }

  try {
    const processingOptions = {
      simplify: options.simplify,
      tolerance: options.tolerance,
      filterBounds: options.filterByBounds ? [
        bounds.minLng,
        bounds.minLat,
        bounds.maxLng,
        bounds.maxLat
      ] : null
    }

    if (uploadedFiles.value.length === 1) {
      // 单文件处理
      const file = uploadedFiles.value[0]
      await processLargeGeoJSON(file.data, processingOptions, chunkSize.value)
    } else {
      // 批量处理
      const geoDataList = uploadedFiles.value.map(file => file.data)
      await batchProcessGeoJSON(geoDataList, processingOptions)
    }

    ElMessage.success('处理完成！')
  } catch (err) {
    ElMessage.error(`处理失败: ${err.message}`)
  }
}

// 下载结果
const downloadResult = () => {
  if (!result.value) return

  const dataStr = JSON.stringify(result.value, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = 'processed_geodata.json'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
  ElMessage.success('文件下载已开始')
}

// 在地图上显示结果
const visualizeResult = () => {
  // 这里可以集成到地图组件中
  ElMessage.info('地图可视化功能待实现')
}

// 组件挂载时更新状态
onMounted(() => {
  updateWorkerStatus()
  // 定期更新状态
  setInterval(updateWorkerStatus, 1000)
})
</script>

<style scoped>
.geo-worker-demo {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.demo-header {
  text-align: center;
  margin-bottom: 30px;
}

.description {
  color: var(--color-text-secondary);
  font-size: 16px;
}

.upload-section {
  margin-bottom: 30px;
}

.upload-area {
  border: 2px dashed var(--color-border);
  border-radius: 8px;
  padding: 40px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upload-area:hover {
  border-color: var(--color-primary);
  background-color: var(--color-background-soft);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.upload-icon {
  font-size: 48px;
  color: var(--color-text-secondary);
}

.upload-hint {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.test-data-section {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
}

.test-data-section h3 {
  margin-bottom: 15px;
  color: var(--color-heading);
}

.test-data-controls {
  display: flex;
  gap: 15px;
  align-items: end;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.control-group label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
}

.control-group select {
  padding: 8px 12px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background-color: var(--color-background);
  color: var(--color-text);
  min-width: 150px;
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.generate-btn:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
}

.generate-btn i {
  font-size: 16px;
}

.options-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 15px;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sub-option {
  margin-left: 20px;
}

.tolerance-input {
  width: 100px;
  margin-left: 10px;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.bounds-inputs {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bounds-row {
  display: flex;
  gap: 10px;
}

.bounds-row input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
}

.files-section {
  margin-bottom: 30px;
}

.files-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 15px 0;
}

.file-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background-color: var(--color-background-soft);
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-weight: 500;
}

.file-stats {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.remove-btn {
  padding: 8px;
  border: none;
  background: none;
  color: var(--color-danger);
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background-color: var(--color-danger-light);
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.process-btn, .clear-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.process-btn {
  background-color: var(--color-primary);
  color: white;
}

.process-btn:hover:not(:disabled) {
  background-color: var(--color-primary-dark);
}

.process-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.clear-btn {
  background-color: var(--color-background);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}

.clear-btn:hover {
  background-color: var(--color-background-soft);
}

.progress-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.progress-container {
  display: flex;
  align-items: center;
  gap: 15px;
  margin: 15px 0;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background-color: var(--color-background-soft);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--color-primary);
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: 500;
  min-width: 50px;
}

.progress-message {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin-top: 10px;
}

.error-section {
  margin-bottom: 30px;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background-color: var(--color-danger-light);
  color: var(--color-danger);
  border-radius: 8px;
  border: 1px solid var(--color-danger);
}

.results-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.results-summary {
  margin: 15px 0;
}

.summary-card {
  padding: 15px;
  background-color: var(--color-background-soft);
  border-radius: 6px;
  margin-bottom: 15px;
}

.summary-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
}

.stat-label {
  color: var(--color-text-secondary);
}

.stat-value {
  font-weight: 500;
}

.result-actions {
  display: flex;
  gap: 10px;
}

.download-btn, .visualize-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.download-btn {
  background-color: var(--color-success);
  color: white;
}

.download-btn:hover {
  background-color: var(--color-success-dark);
}

.visualize-btn {
  background-color: var(--color-info);
  color: white;
}

.visualize-btn:hover {
  background-color: var(--color-info-dark);
}

.status-section {
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 8px;
}

.status-info {
  display: flex;
  gap: 30px;
  margin-top: 15px;
}

.status-item {
  display: flex;
  gap: 10px;
}

.status-label {
  color: var(--color-text-secondary);
}

.status-value {
  font-weight: 500;
}

.status-ready {
  color: var(--color-success);
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>