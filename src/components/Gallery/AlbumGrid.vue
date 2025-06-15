<template>
  <div class="albums-grid fade-in delay-2">
    <div
      v-for="album in albums"
      :key="album.id"
      class="album-item"
      @click="handleAlbumClick(album)"
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
          <span>
            <el-icon><Calendar /></el-icon> {{ album.date }}
          </span>
          <span>
            <el-icon><Location /></el-icon> {{ album.location }}
          </span>
        </div>
      </div>
    </div>
    <div v-if="albums.length === 0" class="no-albums">
      <p>当前分类下暂无相册</p>
    </div>
  </div>
</template>

<script setup>
import { Picture, Calendar, Location } from '@element-plus/icons-vue'

const props = defineProps({
  albums: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['album-click'])

const handleAlbumClick = (album) => {
  emit('album-click', album)
}
</script>

<style scoped>
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

.no-albums {
  @apply text-center py-10 text-gray-500 dark:text-gray-400 text-lg;
}

/* 动画效果 */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
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
  .albums-grid {
    @apply grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5;
  }

  .album-cover {
    @apply h-36;
  }
}

@media (max-width: 480px) {
  .albums-grid {
    @apply grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5;
  }

  .album-cover {
    @apply h-28;
  }

  .album-info h3 {
    @apply text-sm;
  }

  .album-info p {
    @apply text-xs;
  }
}
</style>