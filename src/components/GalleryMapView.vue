<template>
  <div class="gallery-map-container fade-in delay-2">
    <div id="map-container" ref="mapContainer" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

import {
    Map,
    GroupGLLayer,
    VectorTileLayer,
    GLTFMarker,
    Marker,
    GLTFLayer,
    VectorLayer,
    PolygonLayer,
    ui
} from 'maptalks-gl';


import 'maptalks-gl/dist/maptalks-gl.css'

// 接收照片数据作为props
const props = defineProps({
  photos: {
    type: Array,
    required: true
  }
})

// 地图相关
const mapContainer = ref(null)
let map = null
let markerLayer = null

// 初始化地图
const initMap = () => {
  if (!mapContainer.value) return;
  
  


    map = new Map('map-container', {
          center: [116.4074, 39.9042], // 默认中心点（北京）
          zoom: 5,
    });
    const vtLayer = new VectorTileLayer('vt', {
        urlTemplate: 'http://tile.maptalks.com/test/planet-single/{z}/{x}/{y}.mvt'
    });

    const groupLayer = new GroupGLLayer('group', [vtLayer]).addTo(map);

    const gltfLayer = new GLTFLayer('gltflayer');
    groupLayer.addLayer(gltfLayer);

    const polygonLayer = new PolygonLayer('polygonlayer');
    groupLayer.addLayer(polygonLayer);

  
  // 创建标记图层
  markerLayer = new VectorLayer('markers').addTo(map)
  
  // 添加照片标记
  addPhotoMarkers()
}

// 添加照片标记到地图
const addPhotoMarkers = () => {
  if (!markerLayer) return
  
  // 清除现有标记
  markerLayer.clear()
  
  // 添加标记
  props.photos.forEach(photo => {
    if (!photo.coordinates) return
    
    // 创建标记
    const marker = new Marker(
      photo.coordinates,
      {
        symbol: {
          markerType: 'pin',
          markerFill: '#1890ff',
          markerLineColor: '#fff',
          markerLineWidth: 2,
          markerWidth: 30,
          markerHeight: 40
        }
      }
    )
    
    // 创建信息窗口
    const infoWindow = new ui.InfoWindow({
      title: photo.title,
      content: `
        <div class="map-popup-content">
          <img src="${photo.url}" alt="${photo.title}" style="width:100%;max-height:150px;object-fit:cover;" />
          <p>${photo.description}</p>
          <p><small>${photo.date} · ${photo.location}</small></p>
        </div>
      `,
      width: 300,
      height: 'auto',
      autoCloseOn: 'click',
      autoOpenOn: 'click'
    })
    
    // 将信息窗口添加到标记
    marker.setInfoWindow(infoWindow)
    
    // 将标记添加到图层
    markerLayer.addGeometry(marker)
  })
}

// 监听照片数据变化，更新地图标记
watch(() => props.photos, () => {
  if (map && markerLayer) {
    addPhotoMarkers()
  }
}, { deep: true })

// 组件挂载时初始化地图
onMounted(() => {
  // 延迟初始化地图，确保DOM已渲染
  setTimeout(() => {
    initMap()
  }, 100)
})

// 组件卸载时销毁地图
onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style scoped>
/* 地图相关样式 */
.gallery-map-container {
  width: 100%;
  margin-top: 2rem;
}

.map-container {
  width: 100%;
  height: 600px;
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
    height: 450px;
  }
}

@media (max-width: 480px) {
  .map-container {
    height: 350px;
  }
}

/* 动画效果 */
.fade-in {
  opacity: 0;
  animation: fadeIn 1s ease-in forwards;
}

.delay-2 {
  animation-delay: 0.6s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>