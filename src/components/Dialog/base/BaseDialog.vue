<template>
  <el-dialog v-model="dialogVisible" :title="title" width="50%" :before-close="handleClose">
    <div class="dialog-content">
      <component :is="contentComponent" v-bind="contentProps"></component>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm">确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: '工具详情',
  },
  contentComponent: {
    type: Object,
    required: true,
  },
  contentProps: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const dialogVisible = ref(true)

const handleClose = () => {
  dialogVisible.value = false
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
  dialogVisible.value = false
}
</script>

<style scoped>
.dialog-content {
  padding: 20px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
