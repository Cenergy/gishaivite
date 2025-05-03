<template>
  <div>
    <h3>GIS数据查询工具</h3>
    <p>使用此工具可以快速查询和检索地理信息系统数据，支持多种格式和坐标系。</p>
    <div class="tool-form">
      <el-form label-position="top">
        <el-form-item label="数据类型">
          <el-select v-model="dataType" placeholder="请选择数据类型">
            <el-option label="矢量数据" value="vector"></el-option>
            <el-option label="栅格数据" value="raster"></el-option>
            <el-option label="属性数据" value="attribute"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="坐标系">
          <el-select v-model="coordinateSystem" placeholder="请选择坐标系">
            <el-option label="WGS84" value="wgs84"></el-option>
            <el-option label="CGCS2000" value="cgcs2000"></el-option>
            <el-option label="Web墨卡托" value="web-mercator"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// GIS数据查询工具的状态
const dataType = ref('')
const coordinateSystem = ref('')
</script>
