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
  TileLayer,
  GLTFMarker,
  Marker,
  GLTFLayer,
  VectorLayer,
  PolygonLayer,
  ui,
} from 'maptalks-gl'

import 'maptalks-gl/dist/maptalks-gl.css'

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

const emit = defineEmits(['select-album'])

// 地图相关
const mapContainer = ref(null)
let map = null
let markerLayer = null

// 初始化地图
const initMap = () => {
  if (!mapContainer.value) return

  map = new Map('map-container', {
    center: [116.4074, 39.9042], // 默认中心点（北京）
    zoom: 5,
    baseLayer: new TileLayer('base', {
      urlTemplate:
        'https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}',
      subdomains: ['a', 'b', 'c', 'd'],
      // attribution: "&copy; <a href='http://osm.org'>OpenStreetMap</a> contributors, &copy; <a href='https://carto.com/'>CARTO</a>",
    }),
  })

  const vtLayer = new VectorTileLayer('vt', {
    urlTemplate: 'http://tile.maptalks.com/test/planet-single/{z}/{x}/{y}.mvt',
  })

  const groupLayer = new GroupGLLayer('group', [vtLayer]).addTo(map)

  const gltfLayer = new GLTFLayer('gltflayer')
  groupLayer.addLayer(gltfLayer)

  const polygonLayer = new PolygonLayer('polygonlayer')
  groupLayer.addLayer(polygonLayer)

  // 创建标记图层
  markerLayer = new VectorLayer('markers').addTo(map)

  // 添加照片标记
  addPhotoMarkers()
}

// 添加标记到地图
const addPhotoMarkers = () => {
  if (!markerLayer) return

  // 清除现有标记
  markerLayer.clear()

  if (props.albumMode) {
    // 相册模式：添加相册标记
    props.albums.forEach((album) => {
      // 使用第一张照片的坐标作为相册坐标
      if (!album.photos || album.photos.length === 0 || !album.photos[0].coordinates) return

      const coordinates = album.photos[0].coordinates

      // 创建标记
      const marker = new Marker(coordinates, {
        symbol: {
          markerType: 'pin',
          markerFill: '#ff6b6b', // 相册使用不同颜色
          markerLineColor: '#fff',
          markerLineWidth: 2,
          markerWidth: 35,
          markerHeight: 45,
        },
      })

      // 创建信息窗口
      const infoWindow = new ui.InfoWindow({
        title: album.title,
        content: `
          <div class="map-popup-content">
            <img src="${album.coverUrl}" alt="${album.title}" style="width:100%;max-height:150px;object-fit:cover;" />
            <div class="popup-info">
              <p>${album.description}</p>
              <p><small>照片数量: ${album.photos.length}</small></p>
              <button class="popup-view-btn">查看相册</button>
            </div>
          </div>
        `,
      })

      // 点击标记显示信息窗口
      marker.on('click', (e) => {
        infoWindow.addTo(map).show(coordinates)

        // 为查看按钮添加点击事件
        setTimeout(() => {
          const viewBtn = document.querySelector('.popup-view-btn')
          if (viewBtn) {
            viewBtn.addEventListener('click', () => {
              emit('select-album', album)
              infoWindow.remove()
            })
          }
        }, 100)
      })

      // 添加到图层
      marker.addTo(markerLayer)
    })
  } else {
    // 照片模式：添加照片标记
    props.photos.forEach((photo) => {
      if (!photo.coordinates) return

      // 创建标记
      const marker = new Marker(photo.coordinates, {
        symbol: {
          markerType: 'pin',
          markerFill: '#1890ff',
          markerLineColor: '#fff',
          markerLineWidth: 2,
          markerWidth: 30,
          markerHeight: 40,
        },
      })

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
        autoOpenOn: 'click',
      })

      // 将信息窗口添加到标记
      marker.setInfoWindow(infoWindow)

      // 将标记添加到图层
      markerLayer.addGeometry(marker)
    })
  }
}

// 监听数据变化，更新地图标记
watch(
  [() => props.photos, () => props.albumMode, () => props.albums],
  () => {
    if (map && markerLayer) {
      // 清除现有标记并重新添加
      markerLayer.clear()
      addPhotoMarkers()
    }
  },
  { deep: true, immediate: true }
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
