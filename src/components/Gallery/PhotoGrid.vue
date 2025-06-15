<template>
  <div class="photos-view fade-in">
    <div class="album-header">
      <el-button type="primary" @click="handleBackClick" plain>
        <el-icon><Back /></el-icon> 返回相册列表
      </el-button>
      <h2>{{ album.title }}</h2>
      <p>{{ album.description }}</p>
    </div>

    <div class="photos-grid">
      <div
        v-for="(photo, index) in album.photos"
        :key="photo.id"
        class="photo-item"
        @click="handlePhotoClick(index)"
      >
        <img :src="photo.url" :alt="photo.title" class="photo-image" />
        <div class="photo-info">
          <h3>{{ photo.title }}</h3>
          <p>{{ photo.description }}</p>
          <div class="photo-meta">
            <span>
              <el-icon><Calendar /></el-icon> {{ photo.date }}
            </span>
            <span>
              <el-icon><Location /></el-icon> {{ photo.location }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Calendar, Location, Back } from '@element-plus/icons-vue'

const props = defineProps({
  album: {
    type: Object,
    required: true,
    default: () => ({
      title: '',
      description: '',
      photos: []
    })
  }
})

const emit = defineEmits(['back-click', 'photo-click'])

const handleBackClick = () => {
  emit('back-click')
}

const handlePhotoClick = (index) => {
  emit('photo-click', index)
}
</script>

<style scoped>
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

/* 动画效果 */
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
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
  .photos-grid {
    @apply grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5;
  }

  .photo-image {
    @apply h-36;
  }
}

@media (max-width: 480px) {
  .photos-grid {
    @apply grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2.5;
  }

  .photo-image {
    @apply h-28;
  }

  .photo-info h3 {
    @apply text-sm;
  }

  .photo-info p {
    @apply text-xs;
  }
}
</style>