# 智能流式WASM加载器

## 概述

智能流式WASM是一个自动化的模型加载策略，它能够根据文件大小智能判断是否需要分块下载，从而在保证加载效率的同时优化内存使用和网络传输。

## 核心特性

### 🧠 智能决策
- **自动文件大小检测**: 在下载前获取文件大小信息
- **智能分块判断**: 根据可配置的阈值自动决定是否分块
- **动态策略调整**: 大文件分块下载，小文件整体下载

### ⚡ 性能优化
- **内存友好**: 大文件分块处理，避免内存溢出
- **网络优化**: 小文件避免分块开销，大文件支持断点续传
- **实时解码**: 边下载边解码，减少总体加载时间

### 🔧 灵活配置
- **可调阈值**: 自定义文件大小阈值（默认5MB）
- **可调分块**: 自定义分块大小（默认5MB）
- **断点续传**: 支持网络中断后的断点续传

## 使用方法

### 1. 在Vue组件中使用

```vue
<template>
  <div>
    <!-- 加载方式选择 -->
    <el-select v-model="loadMethod">
      <el-option value="smart_stream_wasm" label="🧠 智能流式WASM" />
    </el-select>
    
    <!-- 智能配置面板 -->
    <div v-if="loadMethod === 'smart_stream_wasm'">
      <el-form-item label="自动分块阈值:">
        <el-select v-model="smartChunkThreshold">
          <el-option label="1MB" :value="1048576" />
          <el-option label="5MB" :value="5242880" />
          <el-option label="10MB" :value="10485760" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="分块大小:">
        <el-select v-model="smartChunkSize">
          <el-option label="1MB" :value="1048576" />
          <el-option label="5MB" :value="5242880" />
          <el-option label="10MB" :value="10485760" />
        </el-select>
      </el-form-item>
    </div>
    
    <el-button @click="loadModel">加载模型</el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { modelLoader } from '@/handles/model';

const loadMethod = ref('smart_stream_wasm');
const smartChunkThreshold = ref(5242880); // 5MB
const smartChunkSize = ref(5242880); // 5MB

const loadModel = async () => {
  const model = {
    uuid: 'your-model-uuid',
    name: 'your-model.fastdog'
  };
  
  try {
    const result = await modelLoader.loadModel(model, loadMethod.value, {
      smartChunkThreshold: smartChunkThreshold.value,
      smartChunkSize: smartChunkSize.value,
      enableResume: true,
    });
    
    console.log('模型加载成功:', result);
  } catch (error) {
    console.error('模型加载失败:', error);
  }
};
</script>
```

### 2. 直接使用API

```javascript
import { modelLoader } from '@/handles/model';

// 基础使用（使用默认配置）
const result = await modelLoader.loadModel(model, 'smart_stream_wasm', {
  enableResume: true
});

// 自定义配置
const result = await modelLoader.loadModel(model, 'smart_stream_wasm', {
  smartChunkThreshold: 10485760, // 10MB阈值
  smartChunkSize: 2097152,       // 2MB分块
  enableResume: true
});
```

## 配置参数

### smartChunkThreshold (智能分块阈值)
- **类型**: `number`
- **默认值**: `5242880` (5MB)
- **说明**: 文件大小超过此阈值时启用分块下载
- **推荐值**:
  - 小型应用: 1-3MB
  - 中型应用: 5-10MB
  - 大型应用: 10-20MB

### smartChunkSize (分块大小)
- **类型**: `number`
- **默认值**: `5242880` (5MB)
- **说明**: 启用分块时每个分块的大小
- **推荐值**:
  - 慢速网络: 1-2MB
  - 普通网络: 3-5MB
  - 高速网络: 5-10MB

### enableResume (启用断点续传)
- **类型**: `boolean`
- **默认值**: `true`
- **说明**: 是否支持网络中断后的断点续传

## 智能决策逻辑

```
文件大小检测
     ↓
是否 > 阈值？
     ↓
   是 ← → 否
     ↓     ↓
  分块下载  整体下载
     ↓     ↓
  实时解码  实时解码
     ↓     ↓
   构建模型
```

### 决策示例

假设阈值设置为5MB：

- **2MB文件**: 整体下载，无分块开销
- **8MB文件**: 分块下载，支持断点续传
- **50MB文件**: 分块下载，内存友好

## 性能对比

| 加载方式 | 小文件(2MB) | 中文件(8MB) | 大文件(50MB) |
|---------|------------|------------|-------------|
| 直接加载 | ✅ 快速 | ⚠️ 内存占用 | ❌ 可能失败 |
| 流式WASM | ✅ 快速 | ✅ 稳定 | ✅ 稳定 |
| 实时流式 | ⚠️ 分块开销 | ✅ 稳定 | ✅ 稳定 |
| **智能流式** | ✅ **最优** | ✅ **最优** | ✅ **最优** |

## 监听进度和状态

```javascript
// 监听加载进度
modelLoader.loadingStateMachine.on('progress', (context) => {
  console.log(`进度: ${context.progress}% - ${context.message}`);
});

// 监听状态变化
modelLoader.loadingStateMachine.on('stateChange', ({ from, to, context }) => {
  console.log(`状态: ${from} -> ${to}`);
  
  if (to === 'success') {
    console.log('加载完成!', context.result);
  } else if (to === 'error') {
    console.error('加载失败:', context.error);
  }
});
```

## 错误处理

```javascript
try {
  const result = await modelLoader.loadModel(model, 'smart_stream_wasm', options);
  // 处理成功结果
} catch (error) {
  if (error.message.includes('WASM 解码器未初始化')) {
    // 初始化WASM解码器
    await modelLoader.initialize();
    // 重试加载
  } else if (error.message.includes('网络错误')) {
    // 处理网络错误
    console.log('网络错误，请检查连接');
  } else {
    // 其他错误
    console.error('未知错误:', error);
  }
}
```

## 最佳实践

### 1. 阈值设置建议
- **移动端**: 较小阈值(1-3MB)，减少内存压力
- **桌面端**: 中等阈值(5-10MB)，平衡性能和内存
- **服务器端**: 较大阈值(10-20MB)，减少分块开销

### 2. 分块大小建议
- **慢速网络**: 小分块(1-2MB)，减少重传成本
- **快速网络**: 大分块(5-10MB)，减少请求开销
- **不稳定网络**: 中等分块(2-5MB)，平衡稳定性

### 3. 监控和调优
```javascript
// 记录性能指标
const result = await modelLoader.loadModel(model, 'smart_stream_wasm', options);
console.log('性能统计:', result.performanceStats);

// 根据统计数据调整配置
if (result.performanceStats.chunksCount > 20) {
  // 分块过多，考虑增大分块大小
}
if (result.performanceStats.totalTime > 30000) {
  // 加载时间过长，考虑优化网络或减小阈值
}
```

## 故障排除

### 常见问题

1. **WASM解码器未初始化**
   ```javascript
   await modelLoader.initialize();
   ```

2. **文件大小获取失败**
   - 检查服务器是否支持HEAD请求
   - 确认Content-Length头部存在

3. **分块下载失败**
   - 检查服务器是否支持Range请求
   - 确认Accept-Ranges头部为bytes

4. **内存不足**
   - 减小分块大小
   - 降低阈值设置

### 调试模式

```javascript
// 启用详细日志
modelLoader.setDebugMode(true);

// 查看下载状态
console.log(modelLoader.downloader.getDownloadState());
```

## 更新日志

### v1.0.0
- ✨ 新增智能流式WASM加载器
- 🧠 自动文件大小检测和分块决策
- ⚡ 性能优化和内存管理
- 🔧 灵活的配置选项
- 📊 详细的性能统计

## 相关文档

- [模型加载器文档](./README.md)
- [WASM解码器文档](./decoders/README.md)
- [性能优化指南](./PERFORMANCE.md)
- [API参考](./API.md)