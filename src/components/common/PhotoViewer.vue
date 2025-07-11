<template>
  <div class="photo-viewer-container" v-if="visible" @click.self="closeViewer">
    <div class="photo-viewer-content">
      <div class="photo-viewer-header">
        <div class="photo-viewer-title">
          <h4 v-if="props.albumTitle" class="album-title">{{ props.albumTitle }}</h4>
          <h3>{{ currentPhoto.title }}</h3>
        </div>
        <el-button link @click="closeViewer" class="close-btn">
          <el-icon><Close /></el-icon>
        </el-button>
      </div>
      
      <div class="photo-viewer-body">
        <el-button link @click="prevPhoto" class="nav-btn prev-btn" :disabled="currentIndex <= 0">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        
        <div class="photo-container" @click="toggleZoom">
          <img 
            :src="currentPhoto.previewUrl || currentPhoto.url" 
            :alt="currentPhoto.title" 
            :class="['photo', { 'zoomed': isZoomed }]"
            ref="photoRef"
            @mousedown="startDrag"
            @mousemove="onDrag"
            @mouseup="stopDrag"
            @mouseleave="stopDrag"
          />
        </div>
        
        <el-button link @click="nextPhoto" class="nav-btn next-btn" :disabled="currentIndex >= photos.length - 1">
          <el-icon><ArrowRight /></el-icon>
        </el-button>
      </div>
      
      <div class="photo-viewer-footer">
        <div class="photo-info">
          <p class="photo-description">{{ currentPhoto.description }}</p>
          <div class="photo-meta">
            <span><el-icon><Calendar /></el-icon> {{ currentPhoto.date }}</span>
            <span><el-icon><Location /></el-icon> {{ currentPhoto.location }}</span>
          </div>
        </div>
        
        <div class="photo-thumbnails">
          <div 
            v-for="(photo, index) in photos" 
            :key="photo.id"
            :class="['thumbnail-item', { 'active': index === currentIndex }]"
            @click="selectPhoto(index)"
          >
            <img :src="photo.url" :alt="photo.title" class="thumbnail" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { Close, ArrowLeft, ArrowRight, Calendar, Location, ZoomIn, ZoomOut } from '@element-plus/icons-vue';

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  photos: {
    type: Array,
    default: () => []
  },
  initialIndex: {
    type: Number,
    default: 0
  },
  albumTitle: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'update:visible']);

// 当前显示的照片索引
const currentIndex = ref(props.initialIndex);

// 计算当前照片
const currentPhoto = computed(() => {
  return props.photos[currentIndex.value] || {};
});

// 缩放状态
const isZoomed = ref(false);
const photoRef = ref(null);

// 拖动相关状态
const isDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const translateX = ref(0);
const translateY = ref(0);

// 监听初始索引变化
watch(() => props.initialIndex, (newVal) => {
  currentIndex.value = newVal;
});

// 监听可见性变化
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyDown);
    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
  } else {
    // 移除键盘事件监听
    document.removeEventListener('keydown', handleKeyDown);
    // 恢复背景滚动
    document.body.style.overflow = '';
    // 重置缩放状态
    isZoomed.value = false;
    translateX.value = 0;
    translateY.value = 0;
  }
});

// 组件卸载时清理
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown);
  document.body.style.overflow = '';
});

// 键盘事件处理
const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    closeViewer();
  } else if (e.key === 'ArrowLeft') {
    prevPhoto();
  } else if (e.key === 'ArrowRight') {
    nextPhoto();
  } else if (e.key === ' ') { // 空格键
    toggleZoom();
    e.preventDefault(); // 防止页面滚动
  }
};

// 关闭查看器
const closeViewer = () => {
  emit('update:visible', false);
  emit('close');
};

// 上一张照片
const prevPhoto = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    resetZoom();
  }
};

// 下一张照片
const nextPhoto = () => {
  if (currentIndex.value < props.photos.length - 1) {
    currentIndex.value++;
    resetZoom();
  }
};

// 选择特定照片
const selectPhoto = (index) => {
  currentIndex.value = index;
  resetZoom();
};

// 切换缩放状态
const toggleZoom = () => {
  isZoomed.value = !isZoomed.value;
  if (!isZoomed.value) {
    resetZoom();
  }
};

// 重置缩放和位置
const resetZoom = () => {
  isZoomed.value = false;
  translateX.value = 0;
  translateY.value = 0;
  
  // 重置CSS变量
  if (photoRef.value) {
    photoRef.value.style.setProperty('--tx', 0);
    photoRef.value.style.setProperty('--ty', 0);
  }
};

// 开始拖动
const startDrag = (e) => {
  if (isZoomed.value) {
    isDragging.value = true;
    dragStartX.value = e.clientX - translateX.value;
    dragStartY.value = e.clientY - translateY.value;
  }
};

// 拖动中
const onDrag = (e) => {
  if (isDragging.value && isZoomed.value) {
    translateX.value = e.clientX - dragStartX.value;
    translateY.value = e.clientY - dragStartY.value;
    
    // 更新CSS变量以实现拖动效果
    if (photoRef.value) {
      photoRef.value.style.setProperty('--tx', translateX.value);
      photoRef.value.style.setProperty('--ty', translateY.value);
    }
  }
};

// 停止拖动
const stopDrag = () => {
  isDragging.value = false;
};
</script>

<style scoped>
.photo-viewer-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  z-index: 1000;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: fadeIn 0.3s ease;
}

.photo-viewer-content {
  width: 90%;
  height: 90%;
  max-width: 1200px;
  background-color: rgba(30, 30, 30, 0.8);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
}

.photo-viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
}

.photo-viewer-title {
  display: flex;
  flex-direction: column;
}

.photo-viewer-title .album-title {
  margin: 0 0 4px 0;
  font-size: 0.9rem;
  font-weight: 400;
  color: #bbb;
}

.photo-viewer-header h3 {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 500;
}

.close-btn {
  color: white;
  font-size: 1.2rem;
}

.photo-viewer-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background-color: rgba(0, 0, 0, 0.3);
}

.photo-container {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: zoom-in;
}

.photo {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.photo.zoomed {
  transform: scale(2) translate(calc(var(--tx, 0) * 1px), calc(var(--ty, 0) * 1px));
  cursor: move;
  --tx: 0;
  --ty: 0;
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.prev-btn {
  left: 20px;
}

.next-btn {
  right: 20px;
}

.photo-viewer-footer {
  padding: 15px 20px;
  background-color: rgba(0, 0, 0, 0.5);
  color: white;
}

.photo-info {
  margin-bottom: 15px;
}

.photo-description {
  margin: 0 0 10px 0;
  font-size: 0.9rem;
  color: #e0e0e0;
}

.photo-meta {
  display: flex;
  gap: 15px;
  font-size: 0.8rem;
  color: #bbb;
}

.photo-meta span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.photo-thumbnails {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 5px;
}

.thumbnail-item {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.6;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.thumbnail-item:hover {
  opacity: 0.8;
}

.thumbnail-item.active {
  opacity: 1;
  border-color: #409EFF;
}

.thumbnail {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 响应式调整 */
@media (max-width: 768px) {
  .photo-viewer-content {
    width: 95%;
    height: 95%;
  }
  
  .nav-btn {
    width: 36px;
    height: 36px;
  }
  
  .photo-thumbnails {
    gap: 6px;
  }
  
  .thumbnail-item {
    width: 50px;
    height: 35px;
  }
}

@media (max-width: 480px) {
  .photo-viewer-header h3 {
    font-size: 1rem;
  }
  
  .photo-description {
    font-size: 0.8rem;
  }
  
  .nav-btn {
    width: 32px;
    height: 32px;
  }
  
  .thumbnail-item {
    width: 40px;
    height: 30px;
  }
}
</style>