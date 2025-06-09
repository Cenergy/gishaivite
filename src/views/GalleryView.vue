<template>
  <div class="gallery-container h-screen w-full flex flex-col">
    <div class="container-fluid flex flex-row justify-between gap-4 m-t-2 m-b-2">
      <div class="gallery-categories fade-in delay-1">
        <el-radio-group v-model="activeCategory" size="large">
          <el-radio-button v-for="category in categories" :key="category.id" :label="category.id">
            {{ category.name }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="gallery-view-mode fade-in">
        <el-radio-group v-model="viewMode" size="large">
          <el-radio-button label="list">
            <el-icon><Grid /></el-icon> 列表模式
          </el-radio-button>
          <el-radio-button label="map">
            <el-icon><MapLocation /></el-icon> 地图模式
          </el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <div class="gallery-content flex-1 w-full h-full">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-loading-directive
          v-loading="true"
          element-loading-text="正在加载相册数据..."
          class="w-full h-full"
        />
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-container">
        <el-alert title="加载失败" :description="error" type="error" show-icon :closable="false" />
        <el-button type="primary" @click="loadAlbums" class="mt-4"> 重新加载 </el-button>
      </div>

      <!-- 列表模式 - 相册列表 -->
      <div v-else-if="viewMode === 'list' && !selectedAlbum" class="albums-grid fade-in delay-2">
        <div
          v-for="album in filteredAlbums"
          :key="album.id"
          class="album-item"
          @click="openAlbum(album)"
        >
          <div class="album-cover">
            <img :src="album.coverUrl" :alt="album.title" class="album-image" />
            <div class="album-photo-count">
              <el-icon><Picture /></el-icon>
              <span>{{ album.photos.length }}</span>
            </div>
          </div>
          <div class="album-info">
            <h3>{{ album.title }}</h3>
            <p>{{ album.description }}</p>
            <div class="album-meta">
              <span
                ><el-icon><Calendar /></el-icon> {{ album.date }}</span
              >
              <span
                ><el-icon><Location /></el-icon> {{ album.location }}</span
              >
            </div>
          </div>
        </div>
        <div v-if="filteredAlbums.length === 0 && !loading" class="no-albums">
          <p>当前分类下暂无相册</p>
        </div>
      </div>

      <!-- 相册内照片列表 -->
      <div v-if="viewMode === 'list' && selectedAlbum" class="photos-view fade-in">
        <div class="album-header">
          <el-button type="primary" @click="backToAlbums" plain>
            <el-icon><Back /></el-icon> 返回相册列表
          </el-button>
          <h2>{{ selectedAlbum.title }}</h2>
          <p>{{ selectedAlbum.description }}</p>
        </div>

        <div class="photos-grid">
          <div
            v-for="(photo, index) in selectedAlbum.photos"
            :key="photo.id"
            class="photo-item"
            @click="openPhotoViewer(index)"
          >
            <img :src="photo.url" :alt="photo.title" class="photo-image" />
            <div class="photo-info">
              <h3>{{ photo.title }}</h3>
              <p>{{ photo.description }}</p>
              <div class="photo-meta">
                <span
                  ><el-icon><Calendar /></el-icon> {{ photo.date }}</span
                >
                <span
                  ><el-icon><Location /></el-icon> {{ photo.location }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 地图模式 -->
      <MapView
        v-if="viewMode === 'map'"
        class="w-full h-full flex-1"
      />

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
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { Picture, Calendar, Location, Grid, MapLocation, Back } from '@element-plus/icons-vue'
import { defineAsyncComponent } from 'vue'
import eventBus from '@/utils/EventBus'

const MapView = defineAsyncComponent(() => import('../components/MapView.vue'))
const PhotoViewer = defineAsyncComponent(() => import('../components/PhotoViewer.vue'))
import albumsAPI from '../api/albums'

// 相册分类
const categories = ref([{ id: 'all', name: '全部' }])

// 当前选中的分类
const activeCategory = ref('all')

// 视图模式：列表/地图
const viewMode = ref('list')

// 当前选中的相册
const selectedAlbum = ref(null)

// 照片查看器状态
const photoViewerVisible = ref(false)
const selectedPhotoIndex = ref(0)

// 数据状态
const albums = ref([])
const loading = ref(false)
const error = ref(null)

// 数据转换函数
const transformAlbumData = (apiAlbum) => {
  return {
    id: apiAlbum.id,
    title: apiAlbum.name,
    description: apiAlbum.description || '',
    coverUrl: apiAlbum.cover_image || 'https://picsum.photos/800/600',
    category: apiAlbum.category_id || 'all',
    date: new Date(apiAlbum.created_at).toLocaleDateString('zh-CN'),
    location: apiAlbum.location || '未知位置',
    sortOrder: apiAlbum.sort_order || 0,
    photos: [],
  }
}

const transformPhotoData = (apiPhoto, albumLocation = '未知位置') => {
  return {
    id: apiPhoto.id,
    title: apiPhoto.title || '未命名照片',
    description: apiPhoto.description || '',
    // 缩略图用于列表显示
    url: apiPhoto.thumbnail_url,
    // 预览图用于查看器显示
    previewUrl: apiPhoto.preview_url,
    // 原图URL
    originalUrl:
      apiPhoto.original_url && apiPhoto.original_url.length > 0
        ? apiPhoto.original_url[0]
        : apiPhoto.preview_url,
    date: apiPhoto.taken_at
      ? new Date(apiPhoto.taken_at).toLocaleDateString('zh-CN')
      : new Date(apiPhoto.created_at).toLocaleDateString('zh-CN'),
    location: apiPhoto.location || albumLocation,
    coordinates:
      apiPhoto.longitude && apiPhoto.latitude ? [apiPhoto.longitude, apiPhoto.latitude] : null,
    fileFormat: apiPhoto.file_format,
    fileSize: apiPhoto.file_size,
    width: apiPhoto.width,
    height: apiPhoto.height,
  }
}

// 加载分类数据
const loadCategories = async () => {
  try {
    const response = await albumsAPI.getCategories({ is_public: true })
    console.log('分类API响应:', response)

    if (response && !response.error) {
      // 处理不同的响应格式
      let categoriesData = response
      if (response.data) {
        categoriesData = response.data
      }
      if (response.items) {
        categoriesData = response.items
      }

      if (Array.isArray(categoriesData)) {
        const apiCategories = categoriesData.map((cat) => ({
          id: cat.id,
          name: cat.name,
        }))
        categories.value = [{ id: 'all', name: '全部' }, ...apiCategories]
      } else {
        console.warn('分类数据格式不正确:', categoriesData)
        // 使用默认分类
        categories.value = [
          { id: 'all', name: '全部' },
          { id: 'landscape', name: '风景' },
          { id: 'portrait', name: '人像' },
          { id: 'street', name: '街拍' },
        ]
      }
    } else {
      console.error('分类API返回错误:', response?.error)
      // 使用默认分类
      categories.value = [
        { id: 'all', name: '全部' },
        { id: 'landscape', name: '风景' },
        { id: 'portrait', name: '人像' },
        { id: 'street', name: '街拍' },
      ]
    }
  } catch (err) {
    console.error('加载分类失败:', err)
    // 使用默认分类
    categories.value = [
      { id: 'all', name: '全部' },
      { id: 'landscape', name: '风景' },
      { id: 'portrait', name: '人像' },
      { id: 'street', name: '街拍' },
    ]
  }
}

// 加载相册数据
const loadAlbums = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await albumsAPI.getAlbums({
      is_public: true,
      with_photo_count: true,
    })

    console.log('相册API响应:', response)

    if (response && !response.error) {
      // 处理不同的响应格式
      let albumsData = response
      if (response.data) {
        albumsData = response.data
      }
      if (response.items) {
        albumsData = response.items
      }

      if (Array.isArray(albumsData)) {
        const transformedAlbums = albumsData.map(transformAlbumData)

        // 为每个相册加载照片
        for (const album of transformedAlbums) {
          try {
            const photosResponse = await albumsAPI.getPhotos({
              album_id: album.id,
              is_public: true,
            })

            console.log(`相册 ${album.id} 照片响应:`, photosResponse)

            if (photosResponse && !photosResponse.error) {
              let photosData = photosResponse
              if (photosResponse.data) {
                photosData = photosResponse.data
              }
              if (photosResponse.items) {
                photosData = photosResponse.items
              }

              if (Array.isArray(photosData)) {
                album.photos = photosData.map((photo) => transformPhotoData(photo, album.location))
              } else {
                album.photos = []
              }
            } else {
              album.photos = []
            }
          } catch (photoErr) {
            console.error(`加载相册 ${album.id} 的照片失败:`, photoErr)
            album.photos = []
          }
        }

        albums.value = transformedAlbums
        console.log('最终相册数据:', albums.value)
      } else {
        console.warn('相册数据格式不正确:', albumsData)
        // 创建一些示例数据用于测试
        albums.value = [
          {
            id: '1',
            title: '示例相册1',
            description: '这是一个示例相册',
            coverUrl: 'https://picsum.photos/800/600?random=1',
            category: 'landscape',
            date: new Date().toLocaleDateString('zh-CN'),
            location: '示例位置',
            photos: [
              {
                id: '1',
                title: '示例照片1',
                description: '示例照片描述',
                url: 'https://picsum.photos/800/600?random=1',
                date: new Date().toLocaleDateString('zh-CN'),
                location: '示例位置',
                coordinates: [116.4074, 39.9042],
              },
            ],
          },
        ]
      }
    } else {
      console.error('相册API返回错误:', response?.error)
      throw new Error(response?.error || '获取相册数据失败')
    }
  } catch (err) {
    console.error('加载相册失败:', err)
    error.value = err.message || '加载数据失败'

    // 创建一些示例数据用于测试
    albums.value = [
      {
        id: '1',
        title: '示例相册1',
        description: '这是一个示例相册',
        coverUrl: 'https://picsum.photos/800/600?random=1',
        category: 'landscape',
        date: new Date().toLocaleDateString('zh-CN'),
        location: '示例位置',
        photos: [
          {
            id: '1',
            title: '示例照片1',
            description: '示例照片描述',
            url: 'https://picsum.photos/800/600?random=1',
            date: new Date().toLocaleDateString('zh-CN'),
            location: '示例位置',
            coordinates: [116.4074, 39.9042],
          },
        ],
      },
    ]
  } finally {
    loading.value = false
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadCategories()
  await loadAlbums()
  
  // 监听地图事件
  eventBus.on('album-selected', handleAlbumSelected)
  eventBus.on('photo-selected', handlePhotoSelected)
})

// 根据分类筛选相册
const filteredAlbums = computed(() => {
  let filtered = []
  if (activeCategory.value === 'all') {
    filtered = albums.value
  } else {
    filtered = albums.value.filter((album) => album.category === activeCategory.value)
  }

  // 根据 sort_order 排序，越大在前面
  return filtered.sort((a, b) => b.sortOrder - a.sortOrder)
})

// 获取所有照片（用于地图模式）
const allPhotos = computed(() => {
  let photos = []
  filteredAlbums.value.forEach((album) => {
    photos = [
      ...photos,
      ...album.photos.map((photo) => ({
        ...photo,
        albumId: album.id,
        albumTitle: album.title,
      })),
    ]
  })
  return photos
})

// 打开相册
const openAlbum = (album) => {
  selectedAlbum.value = album
  
  // 如果当前是地图模式，切换到显示该相册的照片
  if (viewMode.value === 'map') {
    nextTick(() => {
      setTimeout(() => {
        eventBus.emit('switchMapMode', {
          mode: 'photo',
          photos: album.photos || [],
          albums: []
        })
      }, 100)
    })
  }
}

// 返回相册列表
const backToAlbums = () => {
  selectedAlbum.value = null
}

// 打开照片查看器
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

// 监听视图模式变化
watch(viewMode, (newMode) => {
  if (newMode === 'map') {
    // 切换到地图模式时，延迟更新地图标记以确保地图已初始化
    nextTick(() => {
      setTimeout(() => {
        if (selectedAlbum.value) {
          // 如果有选中的相册，显示该相册的照片
          eventBus.emit('switchMapMode', {
            mode: 'photo',
            photos: selectedAlbum.value.photos || [],
            albums: []
          })
        } else {
          // 否则显示所有相册
          eventBus.emit('switchMapMode', {
            mode: 'album',
            photos: [],
            albums: filteredAlbums.value || []
          })
        }
      }, 100)
    })
  }
})

// 监听分类变化
watch(activeCategory, () => {
  // 切换分类时，清除选中的相册
  selectedAlbum.value = null
  // 如果当前是地图模式，更新地图标记
  if (viewMode.value === 'map') {
    nextTick(() => {
      setTimeout(() => {
        eventBus.emit('switchMapMode', {
          mode: 'album',
          photos: [],
          albums: filteredAlbums.value || []
        })
      }, 100)
    })
  }
})

// 事件处理函数
const handleAlbumSelected = (album) => {
  openAlbum(album)
}

const handlePhotoSelected = (photo) => {
  openPhotoViewer(photo)
}



// 组件卸载时清理事件监听
onUnmounted(() => {
  eventBus.off('album-selected', handleAlbumSelected)
  eventBus.off('photo-selected', handlePhotoSelected)
})
</script>

<style scoped>
.gallery-container {
  @apply bg-gray-50 dark:bg-gray-800;
}

.gallery-categories,
.gallery-view-mode {
  @apply p-2.5;
}

.gallery-content {
  @apply px-5 pb-5 overflow-y-auto;
}

/* 相册网格样式 */
.albums-grid {
  @apply grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5 py-5;
}

.album-item {
  @apply bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md transition-all duration-300 ease-in-out cursor-pointer;
}

.album-item:hover {
  @apply -translate-y-1 shadow-lg dark:shadow-gray-900/30;
}

.album-cover {
  @apply relative h-44 overflow-hidden;
}

.album-image {
  @apply w-full h-full object-cover transition-transform duration-500 ease-in-out;
}

.album-item:hover .album-image {
  @apply scale-105;
}

.album-photo-count {
  @apply absolute bottom-2.5 right-2.5 bg-black/60 text-white px-2 py-1 rounded text-sm flex items-center gap-1;
}

.album-info {
  @apply p-3.5;
}

.album-info h3 {
  @apply m-0 mb-2 text-lg font-semibold text-gray-800 dark:text-gray-200;
}

.album-info p {
  @apply m-0 mb-2.5 text-sm text-gray-600 dark:text-gray-300 line-clamp-2;
}

.album-meta {
  @apply flex justify-between text-xs text-gray-500 dark:text-gray-400;
}

.album-meta span {
  @apply flex items-center gap-1;
}

/* 相册内照片列表样式 */
.photos-view {
  @apply py-5;
}

.album-header {
  @apply mb-5 pb-3.5 border-b border-gray-200 dark:border-gray-600;
}

.album-header h2 {
  @apply my-3.5 mt-3 text-xl font-semibold text-gray-800 dark:text-gray-200;
}

.album-header p {
  @apply m-0 text-gray-600 dark:text-gray-300;
}

.photos-grid {
  @apply grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-5;
}

.photo-item {
  @apply bg-white dark:bg-gray-700 rounded-lg overflow-hidden shadow-md transition-all duration-300 ease-in-out cursor-pointer;
}

.photo-item:hover {
  @apply -translate-y-1 shadow-lg dark:shadow-gray-900/30;
}

.photo-image {
  @apply w-full h-44 object-cover transition-transform duration-500 ease-in-out;
}

.photo-item:hover .photo-image {
  @apply scale-105;
}

.photo-info {
  @apply p-3.5;
}

.photo-info h3 {
  @apply m-0 mb-2 text-base font-semibold text-gray-800 dark:text-gray-200;
}

.photo-info p {
  @apply m-0 mb-2.5 text-sm text-gray-600 dark:text-gray-300 line-clamp-2;
}

.photo-meta {
  @apply flex justify-between text-xs text-gray-500 dark:text-gray-400;
}

.photo-meta span {
  @apply flex items-center gap-1;
}

.no-albums,
.no-photos {
  @apply text-center py-10 text-gray-500 dark:text-gray-400 text-lg;
}

/* 加载和错误状态样式 */
.loading-container {
  @apply flex items-center justify-center min-h-96;
}

.error-container {
  @apply flex flex-col items-center justify-center min-h-96 p-8;
}

/* 动画效果 */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.delay-1 {
  animation-delay: 0.1s;
}

.delay-2 {
  animation-delay: 0.2s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .albums-grid,
  .photos-grid {
    @apply grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5;
  }

  .album-cover,
  .photo-image {
    @apply h-36;
  }
}

@media (max-width: 480px) {
  .albums-grid,
  .photos-grid {
    @apply grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5;
  }

  .album-cover,
  .photo-image {
    @apply h-28;
  }

  .album-info h3,
  .photo-info h3 {
    @apply text-sm;
  }

  .album-info p,
  .photo-info p {
    @apply text-xs;
  }
}
</style>
