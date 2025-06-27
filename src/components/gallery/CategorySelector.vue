<template>
  <div class="gallery-categories fade-in delay-1">
    <el-radio-group v-model="selectedCategory" size="large" @change="handleCategoryChange">
      <el-radio-button v-for="category in categories" :key="category.id" :label="category.id">
        {{ category.name }}
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  categories: {
    type: Array,
    required: true,
    default: () => []
  },
  modelValue: {
    type: String,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const selectedCategory = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const handleCategoryChange = (value) => {
  emit('change', value)
}
</script>

<style scoped>
.gallery-categories {
  @apply p-2.5;
}

.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

.delay-1 {
  animation-delay: 0.1s;
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