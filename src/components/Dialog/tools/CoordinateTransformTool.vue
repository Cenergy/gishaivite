<template>
  <div class="coordinate-transform-tool">
    <h3>坐标转换工具</h3>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="单个转换" name="manual">
        <el-form label-width="100px" style="margin-bottom: 20px">
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

          <div v-if="sourceCrs === targetCrs" class="error-message">
            <el-alert type="warning" size="small" :closable="false" show-icon>
              源坐标系与目标坐标系不能相同
            </el-alert>
          </div>
        </el-form>

        <div class="manual-container">
          <div class="manual-section unified-section">
            <el-form label-width="100px">
              <div class="coordinate-input-row">
                <el-form-item label="经度" class="coordinate-input-item">
                  <el-input v-model="longitude" placeholder="请输入经度"></el-input>
                </el-form-item>

                <el-form-item label="纬度" class="coordinate-input-item">
                  <el-input v-model="latitude" placeholder="请输入纬度"></el-input>
                </el-form-item>
              </div>

              <el-form-item>
                <el-button
                  type="primary"
                  @click="transformCoordinates"
                  :disabled="sourceCrs === targetCrs || !longitude || !latitude"
                  class="transform-button"
                >
                  <i class="el-icon-refresh"></i> 转换坐标
                </el-button>
              </el-form-item>

              <el-form-item v-if="result" label="转换结果">
                <el-input v-model="result" readonly></el-input>
              </el-form-item>
            </el-form>
          </div>
        </div>
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
              :on-exceed="handleExceed"
              :on-remove="handleRemove"
              :limit="1"
              :file-list="fileList"
              accept=".xlsx,.xls"
              drag
            >
              <i class="el-icon-upload"></i>
              <div class="el-upload__text">拖拽文件到此处或 <em>点击上传</em></div>
              <template #tip>
                <div class="el-upload__tip">请上传包含经纬度数据的Excel文件</div>
              </template>
            </el-upload>
            
            <div v-if="fileList.length > 0" class="file-actions" style="margin-top: 10px;">
              <el-button size="small" type="danger" @click="clearUploadFile">
                <i class="el-icon-delete"></i> 清除文件
              </el-button>
            </div>
          </div>

          <div class="excel-section">
            <h4>第三步：处理文件</h4>
            <el-button
              type="primary"
              @click="processExcel"
              :disabled="!uploadFile || excelSourceCrs === excelTargetCrs || isProcessing"
              class="excel-button"
            >
              <i class="el-icon-refresh"></i> 处理Excel文件
            </el-button>
          </div>

          <div class="excel-section">
            <h4>第四步：下载结果</h4>
            <el-button
              type="success"
              @click="downloadConvertedFile"
              :disabled="!convertedFileBlob"
              class="excel-button"
            >
              <i class="el-icon-download"></i> 下载转换结果
            </el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'

const sourceCrs = ref('WGS84')
const targetCrs = ref('GCJ02')
const longitude = ref('')
const latitude = ref('')
const result = ref('')
const activeTab = ref('manual')
const uploadFile = ref<File | null>(null)
const excelSourceCrs = ref('WGS84')
const excelTargetCrs = ref('GCJ02')
const fileList = ref<any[]>([])
const isProcessing = ref(false) // 添加处理状态变量，用于控制处理按钮的禁用状态

const handleExceed = () => {
  ElMessage.warning('只能上传一个文件，请先删除当前文件再上传新文件')
}

const handleRemove = () => {
  uploadFile.value = null
  fileList.value = []
  ElMessage.info('已移除上传文件')
}

const handleFileChange = (file: any) => {
  // 当文件状态为ready时才更新文件（避免重复处理）
  if (file.status === 'ready') {
    uploadFile.value = file.raw
    fileList.value = [file]
    // 重置处理状态，允许用户处理新上传的文件
    isProcessing.value = false
    ElMessage.success('文件已选择: ' + file.name)
  }
}

const downloadTemplate = () => {
  window.location.href = 'http://localhost:8000/api/v1/converters/coords/templates/gps'
}

// 清除已上传的文件
const clearUploadFile = () => {
  uploadFile.value = null
  fileList.value = []
  // 重置处理状态
  isProcessing.value = false
  ElMessage.info('已清除上传文件')
}

// 存储转换后的文件数据
const convertedFileBlob = ref<Blob | null>(null)
const convertedFileName = ref('')

const processExcel = () => {
  if (!uploadFile.value) return
  
  // 设置处理状态为true，禁用处理按钮
  isProcessing.value = true

  // 重置之前的转换结果
  convertedFileBlob.value = null
  convertedFileName.value = ''

  // 创建FormData对象，用于发送文件到后端API
  const formData = new FormData()
  formData.append('file', uploadFile.value)

  // 根据源坐标系和目标坐标系构建转换类型参数
  let type = ''
  if (excelSourceCrs.value === 'WGS84' && excelTargetCrs.value === 'GCJ02') {
    type = 'wgs84_to_gcj02'
  } else if (excelSourceCrs.value === 'GCJ02' && excelTargetCrs.value === 'WGS84') {
    type = 'gcj02_to_wgs84'
  } else if (excelSourceCrs.value === 'WGS84' && excelTargetCrs.value === 'BD09') {
    type = 'wgs84_to_bd09'
  } else if (excelSourceCrs.value === 'BD09' && excelTargetCrs.value === 'WGS84') {
    type = 'bd09_to_wgs84'
  } else if (excelSourceCrs.value === 'GCJ02' && excelTargetCrs.value === 'BD09') {
    type = 'gcj02_to_bd09'
  } else if (excelSourceCrs.value === 'BD09' && excelTargetCrs.value === 'GCJ02') {
    type = 'bd09_to_gcj02'
  }

  formData.append('type', type)

  // 显示加载提示
  ElMessage.info('正在处理文件，请稍候...')

  // 调用API处理Excel文件
  axios
    .post('/api/v1/converters/coords/convert_from_excel', formData, {
      responseType: 'blob' // 设置响应类型为blob，用于处理StreamingResponse
    })
    .then((response) => {
      console.log("🚀 ~ .then ~ response:", response);
      console.log(response, '转换结果')
      // 直接使用响应数据作为Blob对象
      const blob = new Blob([response.data], {
        type:
          response.headers['content-type'] ||
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })

      // 保存转换结果
      convertedFileBlob.value = blob
      convertedFileName.value = `转换结果_${new Date().getTime()}.xlsx`

      // 不重置处理状态，保持处理按钮禁用状态直到用户上传新文件
      // isProcessing.value = false

      ElMessage.success('坐标转换成功，请点击下载按钮获取结果文件')
    })
    .catch((error) => {
      console.error('坐标转换请求失败:', error)
      // 重置处理状态，允许用户重新尝试处理文件
      isProcessing.value = false

      ElMessage.error(
        '坐标转换失败: ' + (error.response?.data?.message || error.message || '未知错误')
      )
    })
}

const downloadConvertedFile = () => {
  if (!convertedFileBlob.value) {
    ElMessage.warning('没有可下载的文件，请先处理Excel文件')
    return
  }

  // 创建下载链接
  const downloadLink = document.createElement('a')
  
  // 创建URL对象
  const url = window.URL.createObjectURL(convertedFileBlob.value)
  downloadLink.href = url
  downloadLink.download = convertedFileName.value

  // 添加到DOM并触发点击事件
  document.body.appendChild(downloadLink)
  downloadLink.click()

  // 清理
  window.URL.revokeObjectURL(url)
  document.body.removeChild(downloadLink)

  ElMessage.success('文件已下载')
}

const transformCoordinates = () => {
  if (!longitude.value || !latitude.value) {
    ElMessage.warning('请输入经纬度')
    return
  }

  // 显示临时结果
  result.value = `正在转换: ${longitude.value}, ${latitude.value} (${sourceCrs.value} → ${targetCrs.value})`

  // 准备API请求参数
  const fromSys = sourceCrs.value.toLowerCase()
  const toSys = targetCrs.value.toLowerCase()
  const lng = longitude.value
  const lat = latitude.value

  // 调用API进行坐标转换（使用代理）
  axios
    .get(
      `/api/v1/converters/coords/convert?lng=${lng}&lat=${lat}&from_sys=${fromSys}&to_sys=${toSys}`
    )
    .then((response) => {
      const data = response.data
      if (data && data.data) {
        result.value = `转换结果: 经度=${data.data.lng}, 纬度=${data.data.lat}`
        ElMessage.success('坐标转换成功')
      } else {
        result.value = '转换失败: 返回数据格式不正确'
        ElMessage.error('坐标转换失败')
      }
    })
    .catch((error) => {
      console.error('坐标转换请求失败:', error)
      result.value = '转换失败: ' + (error.response?.data?.message || error.message || '未知错误')
      ElMessage.error('坐标转换失败')
    })
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

.coordinate-input-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
  align-items: flex-start;
}

.coordinate-input-item {
  flex: 1;
  min-width: 250px;
}

/* 共享卡片样式 */
.excel-container,
.manual-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
}

.manual-container {
  gap: 0;
}

.excel-section,
.manual-section {
  background-color: white;
  border-radius: 6px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.excel-section h4,
.manual-section h4 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #409eff;
  font-weight: 500;
  font-size: 16px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 8px;
}

.unified-section {
  padding: 20px 10px;
}

.unified-section .el-form-item {
  margin-bottom: 15px;
}

.unified-section .el-form-item:last-child {
  margin-bottom: 0;
}

/* 批量转换样式 */

.excel-button,
.transform-button {
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
  .coordinate-system-item,
  .coordinate-input-item {
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
