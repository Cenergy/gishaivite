<template>
  <div class="coordinate-transform-tool">
    <h3>坐标转换工具</h3>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="单个转换" name="manual">
        <el-form label-width="100px">
          <div class="coordinate-system-row">
            <el-form-item label="源坐标系" class="coordinate-system-item">
              <el-select v-model="sourceCrs" placeholder="请选择源坐标系">
                <el-option label="WGS84" value="WGS84"></el-option>
                <el-option label="GCJ02" value="GCJ02"></el-option>
                <el-option label="BD09" value="BD09"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="目标坐标系" class="coordinate-system-item">
              <el-select v-model="targetCrs" placeholder="请选择目标坐标系">
                <el-option label="WGS84" value="WGS84"></el-option>
                <el-option label="GCJ02" value="GCJ02"></el-option>
                <el-option label="BD09" value="BD09"></el-option>
              </el-select>
            </el-form-item>
          </div>

          <el-form-item label="经度">
            <el-input v-model="longitude" placeholder="请输入经度"></el-input>
          </el-form-item>

          <el-form-item label="纬度">
            <el-input v-model="latitude" placeholder="请输入纬度"></el-input>
          </el-form-item>

          <el-form-item>
            <el-button
              type="primary"
              @click="transformCoordinates"
              :disabled="sourceCrs === targetCrs"
              >转换坐标</el-button
            >
            <div v-if="sourceCrs === targetCrs" class="error-message" style="margin-top: 10px">
              <el-alert type="warning" size="small" :closable="false" show-icon>
                源坐标系与目标坐标系不能相同
              </el-alert>
            </div>
          </el-form-item>

          <el-form-item label="结果" v-if="result">
            <el-input v-model="result" readonly></el-input>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <el-tab-pane label="批量转换" name="excel">
        <el-form label-width="100px" style="margin-bottom: 20px">
          <div class="coordinate-system-row">
            <el-form-item label="源坐标系" class="coordinate-system-item">
              <el-select v-model="excelSourceCrs" placeholder="请选择源坐标系">
                <el-option label="WGS84" value="WGS84"></el-option>
                <el-option label="GCJ02" value="GCJ02"></el-option>
                <el-option label="BD09" value="BD09"></el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="目标坐标系" class="coordinate-system-item">
              <el-select v-model="excelTargetCrs" placeholder="请选择目标坐标系">
                <el-option label="WGS84" value="WGS84"></el-option>
                <el-option label="GCJ02" value="GCJ02"></el-option>
                <el-option label="BD09" value="BD09"></el-option>
              </el-select>
            </el-form-item>
          </div>

          <div v-if="excelSourceCrs === excelTargetCrs" class="error-message">
            <el-alert type="warning" size="small" :closable="false" show-icon>
              源坐标系与目标坐标系不能相同
            </el-alert>
          </div>
        </el-form>

        <div class="excel-container">
          <div class="excel-section">
            <h4>第一步：下载模板</h4>
            <el-button type="primary" @click="downloadTemplate" class="excel-button">
              <i class="el-icon-download"></i> 下载Excel模板
            </el-button>
          </div>

          <div class="excel-section">
            <h4>第二步：上传文件</h4>
            <el-upload
              class="excel-upload"
              action=""
              :auto-upload="false"
              :on-change="handleFileChange"
              accept=".xlsx,.xls"
              drag
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
              <template #tip>
                <div class="el-upload__tip">请上传包含经纬度数据的Excel文件</div>
              </template>
            </el-upload>
          </div>

          <div class="excel-section">
            <h4>第三步：处理文件</h4>
            <el-button
              type="primary"
              @click="processExcel"
              :disabled="!uploadFile || excelSourceCrs === excelTargetCrs"
              class="excel-button"
            >
              <i class="el-icon-refresh"></i> 处理Excel文件
            </el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const sourceCrs = ref('WGS84')
const targetCrs = ref('GCJ02')
const longitude = ref('')
const latitude = ref('')
const result = ref('')
const activeTab = ref('manual')
const uploadFile = ref<File | null>(null)
const excelSourceCrs = ref('WGS84')
const excelTargetCrs = ref('GCJ02')

const handleFileChange = (file: File) => {
  uploadFile.value = file
}

const downloadTemplate = () => {
  // 调用后端API下载Excel模板
  console.log('准备下载Excel模板')
  ElMessage.success('开始下载Excel模板')

  // 实际项目中应该使用window.open或axios下载文件
  // 例如:
  // window.open('/api/coordinate/download-template', '_blank')
  // 或者使用axios
  // axios({
  //   url: '/api/coordinate/download-template',
  //   method: 'GET',
  //   responseType: 'blob'
  // }).then(response => {
  //   const url = window.URL.createObjectURL(new Blob([response.data]))
  //   const link = document.createElement('a')
  //   link.href = url
  //   link.setAttribute('download', '坐标转换模板.xlsx')
  //   document.body.appendChild(link)
  //   link.click()
  //   document.body.removeChild(link)
  // }).catch(error => {
  //   ElMessage.error('模板下载失败')
  // })
}

const processExcel = () => {
  if (!uploadFile.value) return

  // 创建FormData对象，用于发送文件到后端API
  const formData = new FormData()
  formData.append('file', uploadFile.value)
  formData.append('sourceCrs', excelSourceCrs.value)
  formData.append('targetCrs', excelTargetCrs.value)

  // 这里应该调用后端API处理Excel文件
  console.log('准备发送文件到后端API:', uploadFile.value.name)
  ElMessage.success('文件已上传，等待后端处理')

  // 实际项目中应该使用axios或fetch发送请求
  // 例如:
  // axios.post('/api/coordinate/transform-excel', formData)
  //   .then(response => {
  //     ElMessage.success('文件处理成功')
  //   })
  //   .catch(error => {
  //     ElMessage.error('文件处理失败')
  //   })
}

const transformCoordinates = () => {
  if (!longitude.value || !latitude.value) {
    ElMessage.warning('请输入经纬度')
    return
  }

  // 准备发送到后端API的数据
  const params = {
    sourceCrs: sourceCrs.value,
    targetCrs: targetCrs.value,
    longitude: longitude.value,
    latitude: latitude.value,
  }

  // 显示临时结果
  result.value = `正在转换: ${longitude.value}, ${latitude.value} (${sourceCrs.value} → ${targetCrs.value})`

  // 实际项目中应该调用后端API进行坐标转换
  console.log('准备发送坐标转换请求:', params)
  ElMessage.success('坐标转换请求已发送')

  // 实际项目中应该使用axios或fetch发送请求
  // 例如:
  // axios.post('/api/coordinate/transform', params)
  //   .then(response => {
  //     result.value = `转换结果: ${response.data.longitude}, ${response.data.latitude}`
  //     ElMessage.success('坐标转换成功')
  //   })
  //   .catch(error => {
  //     ElMessage.error('坐标转换失败')
  //   })
}
</script>

<style scoped>
.coordinate-transform-tool {
  padding: 20px;
}

.error-message {
  margin-bottom: 10px;
}

:deep(.el-alert) {
  padding: 1px 12px;
  font-size: 12px;
}

.coordinate-system-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
}

.coordinate-system-item {
  flex: 1;
  min-width: 250px;
}

/* 批量转换样式 */
.excel-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.excel-section {
  background-color: white;
  border-radius: 6px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.excel-section h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #409eff;
  font-weight: 500;
  font-size: 16px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.excel-button {
  width: 100%;
  margin-top: 8px;
}

.excel-upload {
  width: 100%;
}

:deep(.excel-upload .el-upload) {
  width: 100%;
}

:deep(.excel-upload .el-upload-dragger) {
  width: 100%;
  height: auto;
  padding: 20px;
}

:deep(.el-upload__text) {
  margin: 10px 0;
}

:deep(.el-upload__text em) {
  color: #409eff;
  font-style: normal;
  text-decoration: underline;
  cursor: pointer;
}

@media screen and (max-width: 768px) {
  .coordinate-system-item {
    min-width: 100%;
  }

  .excel-container {
    gap: 15px;
    padding: 15px;
  }

  .excel-section {
    padding: 12px;
  }
}
</style>
