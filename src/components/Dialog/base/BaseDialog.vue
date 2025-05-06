<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :before-close="handleClose"
    :style="{ height: height }"
  >
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
  width: {
    type: String,
    default: '50%',
  },
  height: {
    type: String,
    default: '',
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
  max-height: calc(100vh - 200px); /* 减去标题栏和底部按钮高度 */
  overflow-y: auto;
  box-sizing: border-box;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
