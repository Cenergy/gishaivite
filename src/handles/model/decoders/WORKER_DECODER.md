# Worker解码器 - 最小最简洁实现

## 概述

Worker解码器是一个基于Web Worker的模型解码器，提供了最小最简洁的实现，支持自动检测Worker支持并提供回退机制。

## 核心特性

### 🚀 智能选择
- **自动检测**: 自动检测浏览器Worker支持
- **智能回退**: Worker不支持时自动回退到主线程解码
- **零配置**: 开箱即用，无需复杂配置

### ⚡ 性能优化
- **非阻塞**: 解码在Worker中进行，不阻塞主线程
- **并发处理**: 支持多任务并发解码
- **内存高效**: 最小化内存占用

### 🛡️ 稳定可靠
- **错误处理**: 完善的错误处理和超时机制
- **资源管理**: 自动清理Worker和内存资源
- **兼容性**: 向下兼容，支持所有浏览器

## 快速开始

### 1. 使用智能解码器（推荐）

```javascript
import { smartDecoder } from './decoders/index.js';

// 自动初始化并选择最佳解码器
const result = await smartDecoder.decodeData(data, uuid, useWasm);
console.log('解码结果:', result);
```

### 2. 直接使用Worker解码器

```javascript
import { workerDecoder } from './decoders/index.js';

// 初始化
await workerDecoder.init();

// 检查状态
const status = workerDecoder.getStatus();
console.log('Worker状态:', status);

// 解码数据
const result = await workerDecoder.decodeData(data, uuid, useWasm);
```

### 3. 批量解码

```javascript
// 并发解码多个数据
const promises = dataArray.map(data => 
  smartDecoder.decodeData(data.content, data.uuid, true)
);
const results = await Promise.all(promises);
```

## API 参考

### SmartDecoder

智能解码器，自动选择最佳解码方案。

#### 方法

- `init()`: 初始化解码器
- `decodeData(data, uuid, useWasm)`: 解码数据
- `cleanup()`: 清理资源
- `getDecoderType()`: 获取当前解码器类型

### WorkerDecoder

Worker解码器，提供基于Web Worker的解码能力。

#### 方法

- `init()`: 初始化Worker解码器
- `decodeData(data, uuid, useWasm)`: 解码数据
- `getStatus()`: 获取解码器状态
- `cleanup()`: 清理资源
- `dispose()`: 销毁解码器

#### 状态对象

```javascript
{
  isWorkerSupported: boolean,  // Worker是否支持
  isInitialized: boolean,      // 是否已初始化
  usingWorker: boolean,        // 是否正在使用Worker
  pendingTasks: number         // 待处理任务数
}
```

## 解码参数

### decodeData(data, uuid, useWasm)

- `data`: 要解码的数据（任意类型）
- `uuid`: 模型唯一标识符（字符串）
- `useWasm`: 是否使用WASM解码（布尔值，默认false）

### 返回值

```javascript
{
  data: any,        // 解码后的数据
  decodeTime: number // 解码耗时（毫秒）
}
```

## 使用场景

### 🎯 适用场景

1. **大型模型解码**: 处理大型3D模型、纹理数据
2. **实时应用**: 需要保持主线程响应的实时应用
3. **批量处理**: 需要并发处理多个解码任务
4. **性能敏感**: 对解码性能有较高要求的应用

### ⚠️ 注意事项

1. **数据传输**: Worker间数据传输会有序列化开销
2. **内存限制**: Worker有独立的内存空间限制
3. **调试困难**: Worker中的错误调试相对困难

## 性能对比

| 解码器类型 | 主线程阻塞 | 并发能力 | 内存占用 | 兼容性 |
|-----------|-----------|----------|----------|--------|
| Worker解码器 | ❌ 无阻塞 | ✅ 高 | ✅ 低 | ✅ 好 |
| 普通解码器 | ⚠️ 阻塞 | ❌ 低 | ⚠️ 中等 | ✅ 完美 |

## 最佳实践

### 1. 使用智能解码器

```javascript
// 推荐：让系统自动选择最佳解码器
import { smartDecoder } from './decoders/index.js';

// 一次初始化，多次使用
await smartDecoder.init();

// 根据数据大小决定是否使用WASM
const useWasm = data.byteLength > 1024 * 1024; // 大于1MB使用WASM
const result = await smartDecoder.decodeData(data, uuid, useWasm);
```

### 2. 错误处理

```javascript
try {
  const result = await smartDecoder.decodeData(data, uuid, true);
  console.log('解码成功:', result);
} catch (error) {
  console.error('解码失败:', error);
  // 可以尝试不使用WASM的回退方案
  const fallbackResult = await smartDecoder.decodeData(data, uuid, false);
}
```

### 3. 资源清理

```javascript
// 应用关闭时清理资源
window.addEventListener('beforeunload', () => {
  smartDecoder.cleanup();
});
```

### 4. 性能监控

```javascript
const startTime = performance.now();
const result = await smartDecoder.decodeData(data, uuid, true);
const totalTime = performance.now() - startTime;

console.log('总耗时:', totalTime, 'ms');
console.log('解码耗时:', result.decodeTime, 'ms');
console.log('传输耗时:', totalTime - result.decodeTime, 'ms');
```

## 故障排除

### 常见问题

1. **Worker初始化失败**
   - 检查浏览器是否支持Worker
   - 确认WASM文件路径正确
   - 查看控制台错误信息

2. **解码超时**
   - 检查数据大小是否过大
   - 考虑分块处理大数据
   - 调整超时时间设置

3. **内存不足**
   - 减少并发解码任务数量
   - 及时清理不需要的数据
   - 考虑使用流式处理

### 调试技巧

```javascript
// 启用详细日志
const status = workerDecoder.getStatus();
console.log('解码器状态:', status);

// 监控性能
console.time('decode');
const result = await smartDecoder.decodeData(data, uuid, true);
console.timeEnd('decode');
```

## 总结

Worker解码器提供了一个最小最简洁的解决方案，在保持代码简洁的同时，提供了强大的解码能力和良好的用户体验。通过智能选择机制，确保在各种环境下都能获得最佳的解码性能。