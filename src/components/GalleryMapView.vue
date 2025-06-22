<template>
  <div class="gallery-map-container fade-in delay-2">
    <div id="map-container" ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { MapManager } from '@/utils/MapManager.js'

// 接收照片数据和相册数据作为props
const props = defineProps({
  photos: {
    type: Array,
    required: true,
  },
  albumMode: {
    type: Boolean,
    default: false,
  },
  albums: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select-album', 'select-photo'])

// 地图相关
const mapContainer = ref(null)
let mapManager = null

// 初始化地图
const initMap = () => {
  if (!mapContainer.value) return

  // 创建地图管理器实例
  mapManager = new MapManager('map-container', {
    center: [116.4074, 39.9042], // 默认中心点（北京）
    zoom: 5,
  })

  // 监听地图事件
  setupMapEvents()

  // 初始化地图
  mapManager.init()

  // 添加初始标记
  updateMapMarkers()
}

// 设置地图事件监听
const setupMapEvents = () => {
  if (!mapManager) return

  // 监听相册选择事件
  mapManager.on('album-selected', (event) => {
    emit('select-album', event.detail)
  })

  // 监听照片选择事件
  mapManager.on('photo-selected', (event) => {
    emit('select-photo', event.detail)
  })

  // 监听地图初始化完成事件
  mapManager.on('map-initialized', (event) => {
    // 地图初始化完成
  })

  // 监听标记更新事件
  mapManager.on('markers-updated', (event) => {
    // 标记已更新
  })

  // 监听地图视图更新事件
  mapManager.on('map-view-updated', (event) => {
    // 地图视图已更新
  })
}

// 更新地图标记
const updateMapMarkers = () => {
  if (!mapManager) return

  if (props.albumMode) {
    mapManager.updateMarkers(props.albums, true)
  } else {
    mapManager.updateMarkers(props.photos, false)
  }
}



// 监听数据变化，更新地图标记
watch(
  [() => props.photos, () => props.albumMode, () => props.albums],
  () => {
    updateMapMarkers()
  },
  { deep: true, immediate: false }
)

// 组件挂载时初始化地图
onMounted(() => {
  // 延迟初始化地图，确保DOM已渲染
  setTimeout(() => {
    initMap()
  }, 100)
})

// 组件卸载时销毁地图
onUnmounted(() => {
  if (mapManager) {
    mapManager.destroy()
    mapManager = null
  }
})
</script>

<style scoped>
/* 地图相关样式 */
.gallery-map-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.map-container {
  width: 100%;
  flex: 1;
  min-height: 400px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.map-popup-content {
  padding: 8px;
  text-align: center;
}

@media (max-width: 768px) {
  .map-container {
    min-height: 450px;
  }
}

@media (max-width: 480px) {
  .map-container {
    min-height: 350px;
  }
}
</style>
