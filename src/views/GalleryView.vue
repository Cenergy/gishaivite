<template>
  <div class="gallery-container h-screen w-full flex flex-col">
    <!-- 顶部控制栏 -->
    <div class="container-fluid flex flex-row justify-between gap-4 m-t-2 m-b-2">
      <CategorySelector 
        v-model="activeCategory" 
        :categories="categories" 
        @change="handleCategoryChange"
      />
      <ViewModeSelector 
        v-model="viewMode" 
        @change="handleViewModeChange"
      />
    </div>

    <!-- 主要内容区域 -->
    <div class="gallery-content flex-1 w-full h-full">
      <LoadingState 
        :loading="loading" 
        :error="error" 
        :is-empty="filteredAlbums.length === 0 && !loading"
        empty-text="当前分类下暂无相册"
        @retry="loadAlbums"
      >
        <!-- 列表模式 - 相册列表 -->
        <AlbumGrid 
          v-if="viewMode === 'list' && !selectedAlbum"
          :albums="filteredAlbums"
          @album-click="openAlbum"
        />

        <!-- 相册内照片列表 -->
        <PhotoGrid 
          v-if="viewMode === 'list' && selectedAlbum"
          :album="selectedAlbum"
          @back-click="backToAlbums"
          @photo-click="openPhotoViewer"
        />

        <!-- 地图模式 -->
        <MapView
          v-if="viewMode === 'map'"
          class="w-full h-full flex-1"
        />
      </LoadingState>

      <!-- 照片查看器 -->
      <PhotoViewer
        v-model:visible="photoViewerVisible"
        :photos="selectedAlbum ? selectedAlbum.photos : []"
        :initial-index="selectedPhotoIndex"
        :album-title="selectedAlbum ? selectedAlbum.title : ''"
        @close="photoViewerVisible = false"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { defineAsyncComponent } from 'vue'

// 组件导入
const MapView = defineAsyncComponent(() => import('../components/MapView.vue'))
const PhotoViewer = defineAsyncComponent(() => import('../components/PhotoViewer.vue'))
import CategorySelector from '../components/Gallery/CategorySelector.vue'
import ViewModeSelector from '../components/Gallery/ViewModeSelector.vue'
import AlbumGrid from '../components/Gallery/AlbumGrid.vue'
import PhotoGrid from '../components/Gallery/PhotoGrid.vue'
import LoadingState from '../components/Gallery/LoadingState.vue'

// Composables导入
import { useGalleryData } from '@/composables/useGalleryData'
import { useMapEvents } from '@/composables/useMapEvents'

// 使用数据管理 composable
const {
  categories,
  albums,
  loading,
  error,
  initializeData,
  getFilteredAlbums,
  getAllPhotos,
  loadAlbums
} = useGalleryData()

// 使用地图事件 composable
const {
  handleViewModeChange: mapHandleViewModeChange,
  handleCategoryChange: mapHandleCategoryChange,
  setupEventListeners
} = useMapEvents()

// 本地状态
const activeCategory = ref('all')
const viewMode = ref('list')
const selectedAlbum = ref(null)
const photoViewerVisible = ref(false)
const selectedPhotoIndex = ref(0)

// 计算属性
const filteredAlbums = computed(() => {
  return getFilteredAlbums(activeCategory.value)
})

const allPhotos = computed(() => {
  return getAllPhotos(filteredAlbums.value)
})

// 事件处理函数
const handleCategoryChange = () => {
  // 切换分类时，清除选中的相册
  selectedAlbum.value = null
  // 处理地图事件
  mapHandleCategoryChange(viewMode.value, filteredAlbums.value)
}

const handleViewModeChange = () => {
  // 处理地图事件
  mapHandleViewModeChange(viewMode.value, selectedAlbum.value, filteredAlbums.value)
}

// 相册和照片操作
const openAlbum = (album) => {
  selectedAlbum.value = album
  
  // 如果当前是地图模式，切换到显示该相册的照片
  if (viewMode.value === 'map') {
    mapHandleViewModeChange('map', album, filteredAlbums.value)
  }
}

const backToAlbums = () => {
  selectedAlbum.value = null
}

const openPhotoViewer = (indexOrPhoto) => {
  if (typeof indexOrPhoto === 'number') {
    // 来自列表模式的索引
    selectedPhotoIndex.value = indexOrPhoto
  } else {
    // 来自地图模式的照片对象
    const photos = selectedAlbum.value ? selectedAlbum.value.photos : allPhotos.value
    const index = photos.findIndex(photo => photo.id === indexOrPhoto.id)
    selectedPhotoIndex.value = index >= 0 ? index : 0
  }
  photoViewerVisible.value = true
}

// 地图事件处理
const handleAlbumSelected = (album) => {
  openAlbum(album)
}

const handlePhotoSelected = (photo) => {
  openPhotoViewer(photo)
}

// 生命周期钩子
onMounted(async () => {
  await initializeData()
  
  // 设置事件监听器
  const cleanup = setupEventListeners({
    onAlbumSelected: handleAlbumSelected,
    onPhotoSelected: handlePhotoSelected
  })
  
  // 保存清理函数
  onUnmounted(cleanup)
})
</script>

<style scoped>
.gallery-container {
  @apply bg-gray-50 dark:bg-gray-800;
}

.gallery-content {
  @apply px-5 pb-5 overflow-y-auto;
}
</style>
