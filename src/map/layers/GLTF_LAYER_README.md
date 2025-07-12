# GLTF 模型图层 (GltfModelLayer)

这是一个基于 MapTalks GL 的 3D 模型图层控制器，用于在地图上加载、管理和控制 GLTF/GLB 格式的 3D 模型。

## 功能特性

### 🎯 核心功能
- ✅ 支持 GLTF 和 GLB 格式的 3D 模型加载
- ✅ 模型位置、缩放、旋转控制
- ✅ 模型动画播放控制
- ✅ 批量模型管理
- ✅ 智能地图视图定位
- ✅ 事件驱动的交互系统
- ✅ 模型缓存机制
- ✅ 位置标记显示

### 🎮 交互功能
- 模型点击事件处理
- 动画播放/暂停/停止控制
- 动态添加/移除模型
- 模型位置实时更新
- 图层显示/隐藏控制

## 快速开始

### 1. 导入和初始化

```javascript
import { gltfModelLayer } from '@/map/layers';

// 在地图初始化后
gltfModelLayer.init(map);
```

### 2. 加载单个模型

```javascript
import eventBus from '@/utils/EventBus';

// 加载一个建筑模型
eventBus.emit('loadGltfModel', {
  id: 'building_001',
  url: '/models/building.glb',
  coordinates: [116.4074, 39.9042, 0], // [经度, 纬度, 高度]
  options: {
    name: '办公大楼',
    description: '现代化办公建筑',
    scaleX: 1.5,
    scaleY: 1.5,
    scaleZ: 1.5,
    rotationY: 45,
    animation: true,
    showMarker: true,
    markerColor: '#FF6B6B'
  }
});
```

### 3. 批量加载模型

```javascript
const models = [
  {
    id: 'tree_001',
    url: '/models/tree.gltf',
    coordinates: [116.4084, 39.9052, 0],
    options: { name: '大树', scaleX: 2, scaleY: 2, scaleZ: 2 }
  },
  {
    id: 'car_001',
    url: '/models/car.glb',
    coordinates: [116.4064, 39.9032, 0],
    options: { name: '汽车', rotationY: 90, animation: true }
  }
];

eventBus.emit('updateGltfModels', { models });
```

## API 参考

### 事件系统

#### 发送事件 (emit)

| 事件名 | 参数 | 描述 |
|--------|------|------|
| `loadGltfModel` | `{id, url, coordinates, options}` | 加载单个模型 |
| `removeGltfModel` | `{id}` | 移除指定模型 |
| `updateGltfModels` | `{models: []}` | 批量更新模型 |
| `clearGltfModels` | - | 清除所有模型 |
| `animateGltfModel` | `{id, action, name}` | 控制模型动画 |

#### 监听事件 (on)

| 事件名 | 参数 | 描述 |
|--------|------|------|
| `gltf-model-loaded` | `{id, modelData}` | 模型加载完成 |
| `gltf-model-error` | `{id, error}` | 模型加载失败 |
| `gltf-model-clicked` | `modelData` | 模型被点击 |
| `gltf-model-removed` | `{id}` | 模型被移除 |
| `gltf-models-cleared` | - | 所有模型被清除 |
| `gltf-model-position-updated` | `{id, coordinates}` | 模型位置更新 |

### 模型配置选项

```javascript
const options = {
  // 基本信息
  name: '模型名称',
  description: '模型描述',
  
  // 变换属性
  scaleX: 1,        // X轴缩放
  scaleY: 1,        // Y轴缩放
  scaleZ: 1,        // Z轴缩放
  rotationX: 0,     // X轴旋转角度
  rotationY: 0,     // Y轴旋转角度
  rotationZ: 0,     // Z轴旋转角度
  translation: [0, 0, 0], // 平移偏移
  
  // 功能选项
  animation: false,    // 是否启用动画
  showMarker: true,    // 是否显示位置标记
  markerColor: '#FF6B6B' // 位置标记颜色
};
```

### 直接方法调用

```javascript
// 获取已加载的模型列表
const models = gltfModelLayer.getLoadedModels();

// 获取指定模型信息
const model = gltfModelLayer.getModel('building_001');

// 更新模型位置
gltfModelLayer.updateModelPosition('building_001', [116.4074, 39.9042, 10]);

// 显示/隐藏图层
gltfModelLayer.setVisible(true);
gltfModelLayer.setVisible(false);

// 智能定位到所有模型
gltfModelLayer.fitModelsView();

// 销毁图层
gltfModelLayer.destroy();
```

## 动画控制

### 播放动画

```javascript
eventBus.emit('animateGltfModel', {
  id: 'car_001',
  action: 'play',
  name: 'drive' // 动画名称，根据模型文件中的动画名称
});
```

### 暂停动画

```javascript
eventBus.emit('animateGltfModel', {
  id: 'car_001',
  action: 'pause',
  name: 'drive'
});
```

### 停止动画

```javascript
eventBus.emit('animateGltfModel', {
  id: 'car_001',
  action: 'stop',
  name: 'drive'
});
```

## 事件监听示例

```javascript
import eventBus from '@/utils/EventBus';

// 监听模型加载完成
eventBus.on('gltf-model-loaded', (data) => {
  console.log(`模型 ${data.id} 加载完成`);
  // 可以在这里执行加载完成后的逻辑
});

// 监听模型点击
eventBus.on('gltf-model-clicked', (modelData) => {
  console.log('模型被点击:', modelData);
  // 显示模型信息弹窗
  showModelInfoDialog(modelData);
});

// 监听模型加载错误
eventBus.on('gltf-model-error', (data) => {
  console.error(`模型 ${data.id} 加载失败:`, data.error);
  // 显示错误提示
  showErrorMessage(`模型加载失败: ${data.error}`);
});
```

## 最佳实践

### 1. 模型文件优化
- 使用 GLB 格式以获得更好的加载性能
- 压缩纹理贴图以减少文件大小
- 合理使用 LOD (Level of Detail) 技术
- 避免过于复杂的几何体和材质

### 2. 性能优化
- 合理控制同时显示的模型数量
- 使用模型缓存机制避免重复加载
- 在不需要时及时移除模型
- 合理设置模型的显示距离

### 3. 用户体验
- 提供模型加载进度提示
- 处理加载失败的情况
- 提供模型信息展示界面
- 合理的交互反馈

### 4. 错误处理

```javascript
// 监听错误并提供用户友好的提示
eventBus.on('gltf-model-error', (data) => {
  const errorMessages = {
    'network': '网络连接失败，请检查网络设置',
    'format': '模型文件格式不支持',
    'size': '模型文件过大，加载失败',
    'default': '模型加载失败，请稍后重试'
  };
  
  const message = errorMessages[data.error.type] || errorMessages.default;
  showNotification(message, 'error');
});
```

## 文件结构

```
src/map/layers/
├── gltfLayer.js              # GLTF图层主文件
├── gltfLayer.example.js      # 使用示例
├── GLTF_LAYER_README.md      # 说明文档
└── index.js                  # 导出文件
```

## 依赖要求

- MapTalks GL
- 支持 WebGL 的浏览器
- 现代浏览器对 GLTF 格式的支持

## 注意事项

1. **坐标系统**: 使用 WGS84 坐标系统 (经度, 纬度, 高度)
2. **文件路径**: 确保模型文件路径正确且可访问
3. **浏览器兼容性**: 需要支持 WebGL 的现代浏览器
4. **性能考虑**: 大量模型可能影响渲染性能
5. **内存管理**: 及时清理不需要的模型以释放内存

## 故障排除

### 常见问题

1. **模型不显示**
   - 检查模型文件路径是否正确
   - 确认坐标是否在地图可视范围内
   - 检查模型缩放是否过小

2. **动画不播放**
   - 确认模型文件包含动画数据
   - 检查动画名称是否正确
   - 确认动画选项已启用

3. **性能问题**
   - 减少同时显示的模型数量
   - 优化模型文件大小
   - 使用合适的缩放比例

4. **加载失败**
   - 检查网络连接
   - 确认文件格式支持
   - 查看浏览器控制台错误信息

## 更新日志

### v1.0.0
- ✅ 初始版本发布
- ✅ 基础模型加载功能
- ✅ 动画控制系统
- ✅ 事件驱动架构
- ✅ 批量管理功能
- ✅ 完整的 API 文档

---

如有问题或建议，请联系开发团队。