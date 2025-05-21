<template>
  <div class="gallery-container">
    <h1 class="gallery-title fade-in">我的相册</h1>
    
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
    
    <div class="gallery-categories fade-in delay-1" v-if="viewMode === 'list'">
      <el-radio-group v-model="activeCategory" size="large">
        <el-radio-button v-for="category in categories" :key="category.id" :label="category.id">
          {{ category.name }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <!-- 列表模式 -->
    <div v-if="viewMode === 'list'" class="gallery-grid fade-in delay-2">
      <div v-for="(photo, index) in filteredPhotos" :key="index" class="gallery-item">
        <el-image 
          :src="photo.url" 
          :alt="photo.title"
          fit="cover"
          loading="lazy"
          :preview-src-list="[photo.url]"
          :initial-index="index"
          class="gallery-image"
        >
          <template #placeholder>
            <div class="image-placeholder">
              <el-icon><Picture /></el-icon>
            </div>
          </template>
        </el-image>
        <div class="gallery-item-info">
          <h3>{{ photo.title }}</h3>
          <p>{{ photo.description }}</p>
          <div class="gallery-item-meta">
            <span><el-icon><Calendar /></el-icon> {{ photo.date }}</span>
            <span><el-icon><Location /></el-icon> {{ photo.location }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 地图模式 -->
    <GalleryMapView v-if="viewMode === 'map'" :photos="filteredPhotos" />

    <div v-if="viewMode === 'list' && filteredPhotos.length === 0" class="no-photos fade-in delay-2">
      <el-empty description="暂无照片" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Picture, Calendar, Location, Grid, MapLocation } from '@element-plus/icons-vue'
import GalleryMapView from '../components/GalleryMapView.vue'

// 相册分类
const categories = [
  { id: 'all', name: '全部' },
  { id: 'nature', name: '自然风光' },
  { id: 'city', name: '城市风貌' },
  { id: 'travel', name: '旅行记忆' },
  { id: 'food', name: '美食记录' }
]

// 当前选中的分类
const activeCategory = ref('all')

// 视图模式：列表/地图
const viewMode = ref('list')

// 模拟照片数据
const photos = [
  {
    id: 1,
    title: '山间晨雾',
    description: '清晨的山间雾气缭绕，宛如仙境',
    url: 'https://picsum.photos/id/10/800/600',
    category: 'nature',
    date: '2023-05-15',
    location: '黄山',
    coordinates: [118.1555, 30.1312] // 经度,纬度
  },
  {
    id: 2,
    title: '城市夜景',
    description: '繁华都市的璀璨夜景',
    url: 'https://picsum.photos/id/20/800/600',
    category: 'city',
    date: '2023-06-20',
    location: '上海',
    coordinates: [121.4737, 31.2304]
  },
  {
    id: 3,
    title: '海边日落',
    description: '金色的阳光洒在海面上，美不胜收',
    url: 'https://picsum.photos/id/30/800/600',
    category: 'nature',
    date: '2023-07-05',
    location: '三亚',
    coordinates: [109.5082, 18.2478]
  },
  {
    id: 4,
    title: '古镇小巷',
    description: '雨后的古镇小巷，青石板路泛着微光',
    url: 'https://picsum.photos/id/40/800/600',
    category: 'travel',
    date: '2023-08-12',
    location: '乌镇',
    coordinates: [120.4942, 30.7457]
  },
  {
    id: 5,
    title: '美味早餐',
    description: '精致的早餐，开启美好的一天',
    url: 'https://picsum.photos/id/50/800/600',
    category: 'food',
    date: '2023-09-03',
    location: '家里',
    coordinates: [116.4074, 39.9042] // 默认北京坐标
  },
  {
    id: 6,
    title: '雪山之巅',
    description: '登上雪山之巅，俯瞰壮丽山河',
    url: 'https://picsum.photos/id/60/800/600',
    category: 'nature',
    date: '2023-10-18',
    location: '四川',
    coordinates: [103.9526, 30.7617]
  },
  {
    id: 7,
    title: '现代建筑',
    description: '现代建筑的几何美学',
    url: 'https://picsum.photos/id/70/800/600',
    category: 'city',
    date: '2023-11-22',
    location: '北京',
    coordinates: [116.4074, 39.9042]
  },
  {
    id: 8,
    title: '地方特色小吃',
    description: '品尝当地特色美食，感受舌尖上的风味',
    url: 'https://picsum.photos/id/80/800/600',
    category: 'food',
    date: '2023-12-05',
    location: '西安',
    coordinates: [108.9402, 34.3416]
  }
]

// 根据分类筛选照片
const filteredPhotos = computed(() => {
  if (activeCategory.value === 'all') {
    return photos
  } else {
    return photos.filter(photo => photo.category === activeCategory.value)
  }
})




</script>

<style scoped>
.gallery-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  /* 添加暗黑模式样式 */
  @apply dark:text-gray-200;
}

.gallery-title {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary-color, #0066cc);
  /* 添加暗黑模式样式 */
  @apply dark:text-blue-400;
}

.gallery-view-mode {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.gallery-categories {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.gallery-item {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-color: #fff;
  /* 添加暗黑模式样式 */
  @apply dark:bg-gray-800 dark:shadow-gray-900/30;
}

.gallery-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.gallery-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.gallery-item-info {
  padding: 1.5rem;
}

.gallery-item-info h3 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  font-weight: bold;
  color: #333;
  /* 添加暗黑模式样式 */
  @apply dark:text-gray-100;
}

.gallery-item-info p {
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  /* 添加暗黑模式样式 */
  @apply dark:text-gray-300;
}

.gallery-item-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #888;
  /* 添加暗黑模式样式 */
  @apply dark:text-gray-400;
}

.gallery-item-meta span {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.image-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 2rem;
  /* 添加暗黑模式样式 */
  @apply dark:bg-gray-700 dark:text-gray-500;
}

.no-photos {
  text-align: center;
  margin-top: 3rem;
}

/* 动画效果 */
.fade-in {
  opacity: 0;
  animation: fadeIn 1s ease-in forwards;
}

.delay-1 {
  animation-delay: 0.3s;
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

/* 响应式调整 */
@media (max-width: 768px) {
  .gallery-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
  
  .gallery-categories {
    overflow-x: auto;
    padding-bottom: 1rem;
    justify-content: flex-start;
  }
}

@media (max-width: 480px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
  
  .gallery-container {
    padding: 1rem;
  }
}


</style>