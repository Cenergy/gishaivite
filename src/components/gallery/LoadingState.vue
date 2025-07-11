<template>
  <div class="state-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container" v-loading="true" :element-loading-text="loadingText">
      <div class="w-full h-full min-h-[200px]"></div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-alert 
        title="加载失败" 
        :description="error" 
        type="error" 
        show-icon 
        :closable="false" 
      />
      <el-button 
        v-if="showRetry"
        type="primary" 
        @click="handleRetry" 
        class="mt-4"
      > 
        重新加载 
      </el-button>
    </div>

    <!-- 空状态 -->
    <div v-else-if="isEmpty" class="empty-container">
      <el-empty :description="emptyText" />
    </div>

    <!-- 内容插槽 -->
    <slot v-else></slot>
  </div>
</template>

<script setup>
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  isEmpty: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: '正在加载数据...'
  },
  emptyText: {
    type: String,
    default: '暂无数据'
  },
  showRetry: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['retry'])

const handleRetry = () => {
  emit('retry')
}
</script>

<style scoped>
.state-container {
  @apply w-full h-full;
}

/* 加载状态样式 */
.loading-container {
  @apply flex items-center justify-center min-h-96;
}

/* 错误状态样式 */
.error-container {
  @apply flex flex-col items-center justify-center min-h-96 p-8;
}

/* 空状态样式 */
.empty-container {
  @apply flex items-center justify-center min-h-96;
}
</style>