/**
 * GLTF模型图层使用示例
 * 展示如何使用 GltfModelLayer 加载和管理3D模型
 */

import { gltfModelLayer } from './index';
import eventBus from '@/utils/EventBus';

/**
 * 示例：初始化GLTF模型图层
 */
export function initGltfLayerExample(map) {
  // 初始化图层
  gltfModelLayer.init(map);
  
  // 监听模型相关事件
  setupEventListeners();
  
  // 加载示例模型
  loadExampleModels();
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
  // 监听模型加载完成事件
  eventBus.on('gltf-model-loaded', (data) => {
    console.log('模型加载完成:', data);
  });
  
  // 监听模型点击事件
  eventBus.on('gltf-model-clicked', (modelData) => {
    console.log('模型被点击:', modelData);
    // 可以在这里显示模型信息弹窗
    showModelInfo(modelData);
  });
  
  // 监听模型加载错误事件
  eventBus.on('gltf-model-error', (data) => {
    console.error('模型加载失败:', data);
  });
}

/**
 * 加载示例模型
 */
function loadExampleModels() {
  // 示例模型数据
  const exampleModels = [
    {
      id: 'building_1',
      url: '/models/building.glb', // 模型文件路径
      coordinates: [116.4074, 39.9042, 0], // 经度、纬度、高度
      options: {
        name: '示例建筑',
        description: '这是一个示例3D建筑模型',
        scaleX: 1,
        scaleY: 1,
        scaleZ: 1,
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        animation: true,
        showMarker: true,
        markerColor: '#FF6B6B'
      }
    },
    {
      id: 'tree_1',
      url: '/models/tree.gltf',
      coordinates: [116.4084, 39.9052, 0],
      options: {
        name: '示例树木',
        description: '这是一个示例树木模型',
        scaleX: 2,
        scaleY: 2,
        scaleZ: 2,
        showMarker: false
      }
    },
    {
      id: 'car_1',
      url: '/models/car.glb',
      coordinates: [116.4064, 39.9032, 0],
      options: {
        name: '示例汽车',
        description: '这是一个示例汽车模型',
        rotationY: 45, // 旋转45度
        animation: true,
        markerColor: '#4CAF50'
      }
    }
  ];
  
  // 批量加载模型
  eventBus.emit('updateGltfModels', { models: exampleModels });
}

/**
 * 显示模型信息
 */
function showModelInfo(modelData) {
  const { id, options = {} } = modelData;
  
  // 这里可以显示一个信息弹窗或侧边栏
  console.log(`模型信息:
名称: ${options.name || id}
描述: ${options.description || '无描述'}
坐标: ${modelData.coordinates.join(', ')}`);
  
  // 示例：触发模型动画
  if (options.animation) {
    eventBus.emit('animateGltfModel', {
      id: id,
      action: 'play',
      name: 'default' // 动画名称，根据模型实际动画名称调整
    });
  }
}

/**
 * 示例：动态添加模型
 */
export function addDynamicModel(coordinates, modelUrl, options = {}) {
  const modelId = `dynamic_${Date.now()}`;
  
  eventBus.emit('loadGltfModel', {
    id: modelId,
    url: modelUrl,
    coordinates: coordinates,
    options: {
      name: options.name || '动态模型',
      description: options.description || '动态添加的模型',
      ...options
    }
  });
  
  return modelId;
}

/**
 * 示例：移除模型
 */
export function removeDynamicModel(modelId) {
  eventBus.emit('removeGltfModel', { id: modelId });
}

/**
 * 示例：清除所有模型
 */
export function clearAllModels() {
  eventBus.emit('clearGltfModels');
}

/**
 * 示例：控制模型动画
 */
export function controlModelAnimation(modelId, action, animationName = 'default') {
  eventBus.emit('animateGltfModel', {
    id: modelId,
    action: action, // 'play', 'pause', 'stop'
    name: animationName
  });
}

/**
 * 示例：更新模型位置
 */
export function updateModelPosition(modelId, newCoordinates) {
  const model = gltfModelLayer.getModel(modelId);
  if (model) {
    gltfModelLayer.updateModelPosition(modelId, newCoordinates);
  } else {
    console.warn(`模型 ${modelId} 不存在`);
  }
}

/**
 * 示例：获取所有已加载的模型
 */
export function getAllLoadedModels() {
  return gltfModelLayer.getLoadedModels();
}

/**
 * 示例：显示/隐藏图层
 */
export function toggleGltfLayer(visible) {
  gltfModelLayer.setVisible(visible);
}

/**
 * 使用示例说明：
 * 
 * 1. 在地图初始化后调用 initGltfLayerExample(map) 来初始化图层
 * 
 * 2. 使用 addDynamicModel() 动态添加模型：
 *    const modelId = addDynamicModel(
 *      [116.4074, 39.9042, 0], 
 *      '/models/my-model.glb',
 *      { name: '我的模型', scaleX: 2 }
 *    );
 * 
 * 3. 使用 controlModelAnimation() 控制动画：
 *    controlModelAnimation(modelId, 'play');
 * 
 * 4. 使用 updateModelPosition() 更新位置：
 *    updateModelPosition(modelId, [116.4084, 39.9052, 0]);
 * 
 * 5. 使用 removeDynamicModel() 移除模型：
 *    removeDynamicModel(modelId);
 * 
 * 6. 使用 toggleGltfLayer() 显示/隐藏整个图层：
 *    toggleGltfLayer(false); // 隐藏
 *    toggleGltfLayer(true);  // 显示
 */