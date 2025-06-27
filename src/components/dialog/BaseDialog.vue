<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="width"
    :before-close="handleClose"
    :style="{ height: height }"
    class="centered-dialog"
    :align-center="true"
    v-bind="dialogAttrs"
    v-on="$attrs"
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
  // 接收所有额外的el-dialog属性
  dialogAttrs: {
    type: Object,
    default: () => ({}),
  },
})

// 定义组件可以触发的所有事件
const emit = defineEmits<{
  close: []
  confirm: []
  [key: string]: any // 允许传递任意事件
}>()

const dialogVisible = ref(true)

// 处理对话框关闭
const handleClose = () => {
  dialogVisible.value = false
  emit('close')
}

// 处理确认按钮点击
const handleConfirm = () => {
  emit('confirm')
  dialogVisible.value = false
}

// 转发所有其他事件
// const forwardEvent = (event: string, ...args: any[]) => {
//   emit(event, ...args)
// }
</script>

<style scoped>
.dialog-content {
  padding: 20px 0;
  max-height: calc(90vh - 100px); /* 减去标题栏和底部按钮高度 */
  overflow-y: auto;
  box-sizing: border-box;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 使对话框在视口中上下左右居中 */
:deep(.centered-dialog .el-dialog) {
  max-height: 90vh;
}
</style>