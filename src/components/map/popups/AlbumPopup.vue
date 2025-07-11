<template>
  <div class="map-popup-content">
    <img
      :src="album.coverUrl"
      :alt="album.title"
      style="width: 100%; max-height: 150px; object-fit: cover;min-width: 150px;"
    />
    <div class="popup-info">
      <p>{{ album.description }}</p>
      <p><small>照片数量: {{ album.photos.length }}</small></p>
      <button class="popup-view-btn" :data-album-id="album.id" @click="handleViewAlbum">查看相册</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { Photo } from "@/types/photo";

// 定义相册类型
interface Album {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  photos: Photo[];
}

const props = defineProps<{
  album: Album;
}>();

// 定义事件
const emit = defineEmits<{
  albumSelected: [album: Album];
}>();

// 处理查看相册点击事件
const handleViewAlbum = () => {
  emit("albumSelected", props.album);
  console.log("查看相册:", props.album.title || props.album.id);
};

onMounted(() => {
  console.log("🚀 ~ onMounted ~ album:", props.album);
});
</script>
