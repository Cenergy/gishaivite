<template>
  <div>
    <h3>空间分析工具</h3>
    <p>强大的空间分析工具，支持缓冲区分析、叠加分析和网络分析。</p>
    <div class="tool-form">
      <el-form label-position="top">
        <el-form-item label="分析类型">
          <el-select v-model="analysisType" placeholder="请选择分析类型">
            <el-option label="缓冲区分析" value="buffer"></el-option>
            <el-option label="叠加分析" value="overlay"></el-option>
            <el-option label="网络分析" value="network"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="参数设置">
          <el-input-number
            v-model="analysisParam"
            :min="1"
            :max="100"
            label="参数值"
          ></el-input-number>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 空间分析工具的状态
const analysisType = ref('')
const analysisParam = ref(10)
</script>
