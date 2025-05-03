<template>
  <div class="tool-content">
    <template v-if="toolType === 'gis-query'">
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
    </template>

    <template v-else-if="toolType === 'map-visualization'">
      <h3>地图可视化工具</h3>
      <p>将复杂的地理数据转化为直观的可视化地图，支持自定义样式。</p>
      <div class="tool-form">
        <el-form label-position="top">
          <el-form-item label="底图类型">
            <el-radio-group v-model="mapType">
              <el-radio label="vector">矢量底图</el-radio>
              <el-radio label="satellite">卫星影像</el-radio>
              <el-radio label="terrain">地形图</el-radio>
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
    </template>

    <template v-else-if="toolType === 'spatial-analysis'">
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
    </template>

    <template v-else-if="toolType === 'mobile-collection'">
      <h3>移动端采集工具</h3>
      <p>便捷的移动端数据采集工具，支持离线采集和实时同步。</p>
      <div class="tool-form">
        <el-form label-position="top">
          <el-form-item label="采集模式">
            <el-radio-group v-model="collectionMode">
              <el-radio label="online">在线模式</el-radio>
              <el-radio label="offline">离线模式</el-radio>
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
    </template>

    <template v-else>
      <h3>工具详情</h3>
      <p>该工具暂未配置详细信息，请稍后再试。</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps } from 'vue'

const props = defineProps({
  toolType: {
    type: String,
    default: '',
  },
})

// GIS数据查询工具的状态
const dataType = ref('')
const coordinateSystem = ref('')

// 地图可视化工具的状态
const mapType = ref('vector')
const visualizationMethods = ref([])

// 空间分析工具的状态
const analysisType = ref('')
const analysisParam = ref(10)

// 移动端采集工具的状态
const collectionMode = ref('online')
const dataTypes = ref([])
</script>

<style scoped>
.tool-content {
  padding: 20px;
}

.tool-form {
  margin-top: 20px;
}

h3 {
  margin-top: 0;
  margin-bottom: 10px;
  color: var(--primary-color, #0066cc);
}

p {
  margin-bottom: 20px;
  color: #666;
}
</style>
