<template>
  <div>
    <h3>地图可视化工具</h3>
    <p>将复杂的地理数据转化为直观的可视化地图，支持自定义样式。</p>
    <div class="tool-form">
      <el-form label-position="top">
        <el-form-item label="底图类型">
          <el-radio-group v-model="mapType">
            <el-radio value="vector">矢量底图</el-radio>
            <el-radio value="satellite">卫星影像</el-radio>
            <el-radio value="terrain">地形图</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="可视化方式">
          <el-checkbox-group v-model="visualizationMethods">
            <el-checkbox label="heatmap">热力图</el-checkbox>
            <el-checkbox label="cluster">聚合图</el-checkbox>
            <el-checkbox label="choropleth">分级统计图</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

// 地图可视化工具的状态
const mapType = ref('vector')
const visualizationMethods = ref([])

// 在打开弹窗时传递额外属性
// openToolDialog('gis-query', 'GIS数据查询', {
//   'close-on-click-modal': false,
//   'close-on-press-escape': false,
//   'top': '10vh'
// })
</script>
