<template>
  <div class="gallery-view-mode fade-in">
    <el-radio-group v-model="selectedMode" size="large" @change="handleModeChange">
      <el-radio-button value="list">
        <el-icon><Grid /></el-icon> 列表模式
      </el-radio-button>
      <el-radio-button value="map">
        <el-icon><MapLocation /></el-icon> 地图模式
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Grid, MapLocation } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: String,
    required: true,
    validator: (value) => ['list', 'map'].includes(value)
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectedMode = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleModeChange = (value) => {
  emit('change', value)
}
</script>

<style scoped>
.gallery-view-mode {
  @apply p-2.5;
}

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
</style>