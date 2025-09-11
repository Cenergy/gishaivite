# 模型效果集成指南

本指南说明如何使用集成了动画效果的模型加载器。

## 概述

现在 `ModelLoader` 已经集成了 `ModelEffects`，可以在模型加载完成后自动应用视觉效果，包括：
- Bloom 发光效果
- 垂直流动着色器动画
- 自定义着色器配置

## 快速开始

### 1. 基本使用

```javascript
import { ModelHandle } from './handles/model/modelLoader.js';

// 创建模型加载器实例
const modelLoader = new ModelHandle();

// 初始化加载器
await modelLoader.initialize();

// 加载模型（自动应用效果）
const result = await modelLoader.loadOriginModel({
  model_file_url: 'path/to/your/model.glb'
});

// 结果包含：
// - result.model: Three.js 模型对象
// - result.geometry: 模型几何体
// - result.animations: 模型动画
// - result.effects: 效果管理器实例
```

### 2. 控制效果

```javascript
if (result.effects) {
  // 控制 Bloom 效果
  result.effects.setBloom(true);  // 启用
  result.effects.setBloom(false); // 禁用
  
  // 启动着色器动画
  result.effects.shaderAnimation('verticalFlow');
  
  // 停止动画
  result.effects.stopShaderAnimation();
  
  // 销毁效果管理器（清理资源）
  result.effects.destroy();
}
```

## 自定义配置

### 修改默认效果配置

如果需要自定义效果参数，可以修改 `modelLoader.js` 中的配置：

```javascript
// 在 modelLoader.js 的 loadOriginModel 方法中
const modelEffects = new ModelEffects(modelObj, {
  customerShaderConfig: {
    bottomColor: 'rgb(0,19,39)',      // 模型底部颜色
    topColor: 'rgb(0,50,100)',        // 模型顶部颜色
    flowColor: 'rgb(255,103,19)',     // 流动效果颜色
    topGradientDistance: 5,           // 顶部渐变距离
    bottomGradientDistance: 50,       // 底部渐变距离
    speed: 100,                       // 动画速度（越小越快）
    wireframe: false                  // 是否显示线框
  }
});
```

### 创建独立的效果管理器

```javascript
import ModelEffects from './handles/model/ModelEffects.js';

// 为已有的模型对象创建效果管理器
const effects = new ModelEffects(existingModelObject, {
  customerShaderConfig: {
    // 自定义配置
  }
});

// 应用效果
effects.setBloom(true);
effects.shaderAnimation('verticalFlow');
```

## 文件结构

```
src/handles/model/
├── modelLoader.js          # 主加载器（已集成效果）
├── ModelEffects.js         # 效果管理器
├── test-effects.js         # 测试文件
├── animations/
│   ├── GlobeAnimation.js   # 动画管理器
│   └── Animation.js
├── shaders/
│   ├── index.js            # 着色器导出
│   ├── VerticalFlowShader.js
│   └── VerticalTripFlowShader.js.js
└── effects/
    └── index.js            # 原始效果实现（参考）
```

## 效果说明

### Bloom 效果
- 为模型添加发光效果
- 通过设置 Three.js 的 layers 实现
- 可以动态开启/关闭

### 垂直流动着色器
- 创建从底部到顶部的流动光效
- 支持自定义颜色和速度
- 基于模型的本地坐标系

## 注意事项

1. **性能考虑**：着色器动画会持续运行，确保在不需要时调用 `stopShaderAnimation()`
2. **资源清理**：使用完毕后调用 `effects.destroy()` 清理资源
3. **模型格式**：支持 GLB/GLTF 格式的模型文件
4. **依赖关系**：确保 Three.js 和 gsap 库已正确安装

## 故障排除

### 常见问题

1. **效果不显示**
   - 检查模型是否正确加载
   - 确认 Bloom 渲染管线已设置
   - 验证着色器编译是否成功

2. **动画不流畅**
   - 调整 `speed` 参数
   - 检查 `GlobeAnimation` 是否正常运行

3. **导入错误**
   - 确认所有依赖文件路径正确
   - 检查 Three.js 工具类导入

## 测试

运行测试文件验证集成：

```javascript
import { testModelEffects } from './handles/model/test-effects.js';

// 执行测试
testModelEffects();
```

## 扩展

要添加新的效果类型：

1. 在 `ModelEffects.js` 中添加新方法
2. 在 `shaders/` 目录添加新的着色器
3. 更新 `shaderAnimation()` 方法支持新类型

---

现在您可以在模型加载完成后自动享受丰富的视觉效果！