<template>
  <div class="gallery-container h-screen w-full flex flex-col">
    <div class="container-fluid flex flex-row justify-between gap-4 m-t-2 m-b-2">
      <div class="gallery-categories fade-in delay-1">
        <el-radio-group v-model="activeCategory" size="large">
          <el-radio-button
            v-for="category in categories"
            :key="category.id"
            :label="category.id"
          >
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
      <!-- 列表模式 - 相册列表 -->
      <div v-if="viewMode === 'list' && !selectedAlbum" class="albums-grid fade-in delay-2">
        <div v-for="album in filteredAlbums" :key="album.id" class="album-item" @click="openAlbum(album)">
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
              <span><el-icon><Calendar /></el-icon> {{ album.date }}</span>
              <span><el-icon><Location /></el-icon> {{ album.location }}</span>
            </div>
          </div>
        </div>
        <div v-if="filteredAlbums.length === 0" class="no-albums">
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
          <div v-for="(photo, index) in selectedAlbum.photos" :key="photo.id" class="photo-item" @click="openPhotoViewer(index)">
            <img :src="photo.url" :alt="photo.title" class="photo-image" />
            <div class="photo-info">
              <h3>{{ photo.title }}</h3>
              <p>{{ photo.description }}</p>
              <div class="photo-meta">
                <span><el-icon><Calendar /></el-icon> {{ photo.date }}</span>
                <span><el-icon><Location /></el-icon> {{ photo.location }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 地图模式 -->
      <GalleryMapView 
        v-if="viewMode === 'map'" 
        :photos="selectedAlbum ? selectedAlbum.photos : allPhotos" 
        :album-mode="!selectedAlbum"
        :albums="albums"
        @select-album="openAlbum"
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
import { ref, computed, watch } from "vue";
import { Picture, Calendar, Location, Grid, MapLocation, Back } from "@element-plus/icons-vue";
import GalleryMapView from "../components/GalleryMapView.vue";
import PhotoViewer from "../components/PhotoViewer.vue";

// 相册分类
const categories = [
  { id: "all", name: "全部" },
  { id: "nature", name: "自然风光" },
  { id: "city", name: "城市风貌" },
  { id: "travel", name: "旅行记忆" },
  { id: "food", name: "美食记录" },
];

// 当前选中的分类
const activeCategory = ref("all");

// 视图模式：列表/地图
const viewMode = ref("list");

// 当前选中的相册
const selectedAlbum = ref(null);

// 照片查看器状态
const photoViewerVisible = ref(false);
const selectedPhotoIndex = ref(0);

// 模拟相册数据
const albums = [
  {
    id: 1,
    title: "自然风光集锦",
    description: "收集了各地的自然风光照片",
    coverUrl: "https://picsum.photos/id/10/800/600",
    category: "nature",
    date: "2023-05-15",
    location: "中国各地",
    photos: [
      {
        id: 101,
        title: "山间晨雾",
        description: "清晨的山间雾气缭绕，宛如仙境",
        url: "https://picsum.photos/id/10/800/600",
        date: "2023-05-15",
        location: "黄山",
        coordinates: [118.1555, 30.1312], // 经度,纬度
      },
      {
        id: 102,
        title: "海边日落",
        description: "金色的阳光洒在海面上，美不胜收",
        url: "https://picsum.photos/id/30/800/600",
        date: "2023-07-05",
        location: "三亚",
        coordinates: [109.5082, 18.2478],
      },
      {
        id: 103,
        title: "雪山之巅",
        description: "登上雪山之巅，俯瞰壮丽山河",
        url: "https://picsum.photos/id/60/800/600",
        date: "2023-10-18",
        location: "四川",
        coordinates: [103.9526, 30.7617],
      }
    ]
  },
  {
    id: 2,
    title: "城市风貌",
    description: "记录现代都市的建筑与生活",
    coverUrl: "https://picsum.photos/id/20/800/600",
    category: "city",
    date: "2023-06-20",
    location: "多个城市",
    photos: [
      {
        id: 201,
        title: "城市夜景",
        description: "繁华都市的璀璨夜景",
        url: "https://picsum.photos/id/20/800/600",
        date: "2023-06-20",
        location: "上海",
        coordinates: [121.4737, 31.2304],
      },
      {
        id: 202,
        title: "现代建筑",
        description: "现代建筑的几何美学",
        url: "https://picsum.photos/id/70/800/600",
        date: "2023-11-22",
        location: "北京",
        coordinates: [116.4074, 39.9042],
      }
    ]
  },
  {
    id: 3,
    title: "旅行记忆",
    description: "旅途中的美好回忆",
    coverUrl: "https://picsum.photos/id/40/800/600",
    category: "travel",
    date: "2023-08-12",
    location: "多地",
    photos: [
      {
        id: 301,
        title: "古镇小巷",
        description: "雨后的古镇小巷，青石板路泛着微光",
        url: "https://picsum.photos/id/40/800/600",
        date: "2023-08-12",
        location: "乌镇",
        coordinates: [120.4942, 30.7457],
      }
    ]
  },
  {
    id: 4,
    title: "美食记录",
    description: "记录生活中的美食瞬间",
    coverUrl: "https://picsum.photos/id/50/800/600",
    category: "food",
    date: "2023-09-03",
    location: "各地美食",
    photos: [
      {
        id: 401,
        title: "美味早餐",
        description: "精致的早餐，开启美好的一天",
        url: "https://picsum.photos/id/50/800/600",
        date: "2023-09-03",
        location: "家里",
        coordinates: [116.4074, 39.9042],
      }
    ]
  }
];

// 根据分类筛选相册
const filteredAlbums = computed(() => {
  if (activeCategory.value === "all") {
    return albums;
  }
  return albums.filter(album => album.category === activeCategory.value);
});

// 获取所有照片（用于地图模式）
const allPhotos = computed(() => {
  let photos = [];
  filteredAlbums.value.forEach(album => {
    photos = [...photos, ...album.photos.map(photo => ({
      ...photo,
      albumId: album.id,
      albumTitle: album.title
    }))];
  });
  return photos;
});

// 打开相册
const openAlbum = (album) => {
  selectedAlbum.value = album;
};

// 返回相册列表
const backToAlbums = () => {
  selectedAlbum.value = null;
};

// 打开照片查看器
const openPhotoViewer = (index) => {
  selectedPhotoIndex.value = index;
  photoViewerVisible.value = true;
};

// 监听视图模式变化
watch(viewMode, () => {
  // 切换到地图模式时，可以保留当前选中的相册
});

// 监听分类变化
watch(activeCategory, () => {
  // 切换分类时，清除选中的相册
  selectedAlbum.value = null;
});
</script>

<style scoped>
.gallery-container {
  background-color: #f5f7fa;
}

.gallery-categories,
.gallery-view-mode {
  padding: 10px;
}

.gallery-content {
  padding: 0 20px 20px;
  overflow-y: auto;
}

/* 相册网格样式 */
.albums-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.album-item {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.album-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.album-cover {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.album-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.album-item:hover .album-image {
  transform: scale(1.05);
}

.album-photo-count {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.album-info {
  padding: 15px;
}

.album-info h3 {
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
}

.album-info p {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.album-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #999;
}

.album-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 相册内照片列表样式 */
.photos-view {
  padding: 20px 0;
}

.album-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.album-header h2 {
  margin: 15px 0 5px 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
}

.album-header p {
  margin: 0;
  color: #666;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
}

.photo-item {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.photo-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.photo-image {
  width: 100%;
  height: 180px;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.photo-item:hover .photo-image {
  transform: scale(1.05);
}

.photo-info {
  padding: 15px;
}

.photo-info h3 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.photo-info p {
  margin: 0 0 10px 0;
  font-size: 0.85rem;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.photo-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #999;
}

.photo-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.no-albums,
.no-photos {
  text-align: center;
  padding: 40px 0;
  color: #999;
  font-size: 1.1rem;
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
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .albums-grid,
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 15px;
  }
  
  .album-cover,
  .photo-image {
    height: 150px;
  }
}

@media (max-width: 480px) {
  .albums-grid,
  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 10px;
  }
  
  .album-cover,
  .photo-image {
    height: 120px;
  }
  
  .album-info h3,
  .photo-info h3 {
    font-size: 0.9rem;
  }
  
  .album-info p,
  .photo-info p {
    font-size: 0.8rem;
  }
}
</style>
