<template>
  <div class="map-popup-content">
    <img
      :src="photo.url"
      :alt="photo.title || '照片'"
      style="w-full max-h-37.5 object-cover"
    />
    <div class="popup-info">
      <p>{{ photo.description || '' }}</p>
      <p><small>拍摄时间: {{ photo.date || '未知' }}</small></p>
      <button class="popup-view-btn" :data-photo-id="photo.id" @click="handleViewPhoto">查看大图</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Photo } from "@/types/photo";

const props = defineProps<{
  photo: Photo
}>()

// 定义事件
const emit = defineEmits<{
  viewPhoto: [photoId: string, photo: Photo]
}>()

// 处理查看大图点击事件
const handleViewPhoto = () => {
  emit('viewPhoto', props.photo.id, props.photo)
  console.log('查看大图:', props.photo.title || props.photo.id)
}

onMounted(() => {
  console.log("🚀 ~ onMounted ~ photo:", props.photo);
})

</script>
