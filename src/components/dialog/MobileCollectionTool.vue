<template>
  <div>
    <h3>移动端采集工具</h3>
    <p>便捷的移动端数据采集工具，支持离线采集和实时同步。</p>
    <div class="tool-form">
      <el-form label-position="top">
        <el-form-item label="采集模式">
          <el-radio-group v-model="collectionMode">
            <el-radio value="online">在线模式</el-radio>
            <el-radio value="offline">离线模式</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数据类型">
          <el-checkbox-group v-model="dataTypes">
            <el-checkbox label="point">点数据</el-checkbox>
            <el-checkbox label="line">线数据</el-checkbox>
            <el-checkbox label="polygon">面数据</el-checkbox>
            <el-checkbox label="attribute">属性数据</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 移动端采集工具的状态
const collectionMode = ref('online')
const dataTypes = ref([])
</script>
