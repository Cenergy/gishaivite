import BaseLayer from './baseLayer';
import { GLTFLayer, GLTFMarker, VectorLayer } from 'maptalks-gl';
import eventBus from '@/utils/EventBus';
import { LAYER_NAMES } from '../constants';

/**
 * GLTF 3D模型图层类
 * 用于加载和管理 GLTF/GLB 格式的3D模型
 */
class GltfModelLayer extends BaseLayer {
  constructor(options = {}) {
    super(options);
    this.gltfLayer = null;
    this.markerLayer = null;
    this.models = [];
    this.loadedModels = new Map(); // 缓存已加载的模型
  }

  /**
   * 初始化图层
   * @param {Map} map - MapTalks地图实例
   */
  init(map) {
    super.init(map, false);
    
    // 创建GLTF图层
    this.gltfLayer = new GLTFLayer('gltf-models', {
      animation: true, // 启用动画
      enableAltitude: true, // 启用高度
    });
    
    // 创建标记图层用于模型位置标记
    this.markerLayer = new VectorLayer('gltf-markers');
    
    // 获取或创建GroupGLLayer
    let groupLayer = this.map.getLayer(LAYER_NAMES.BASIC_SCENE_GROUP);
    if (!groupLayer) {
      console.warn('GltfModelLayer: GroupGLLayer not found, creating new one');
      // 如果没有找到GroupGLLayer，可以创建一个新的或者添加到地图
      this.map.addLayer(this.gltfLayer);
      this.map.addLayer(this.markerLayer);
    } else {
      groupLayer.addLayer(this.gltfLayer);
      groupLayer.addLayer(this.markerLayer);
    }

    // 注册事件监听器
    this.registerEvents();
  }

  /**
   * 注册事件监听器
   */
  registerEvents() {
    super.addEventListeners([
      {
        event: 'loadGltfModel',
        handler: (data) => this.loadModel(data),
      },
      {
        event: 'removeGltfModel',
        handler: (data) => this.removeModel(data.id),
      },
      {
        event: 'updateGltfModels',
        handler: (data) => this.updateModels(data.models || []),
      },
      {
        event: 'clearGltfModels',
        handler: () => this.clearModels(),
      },
      {
        event: 'animateGltfModel',
        handler: (data) => this.animateModel(data),
      },
    ]);
  }

  /**
   * 加载单个GLTF模型
   * @param {Object} modelData - 模型数据
   * @param {string} modelData.id - 模型唯一标识
   * @param {string} modelData.url - 模型文件URL
   * @param {Array} modelData.coordinates - 模型位置坐标 [lng, lat, altitude]
   * @param {Object} modelData.options - 模型选项
   */
  async loadModel(modelData) {
    if (!this.gltfLayer || !modelData) {
      console.warn('GltfModelLayer: Layer not initialized or invalid model data');
      return;
    }

    const { id, url, coordinates, options = {} } = modelData;
    
    if (!id || !url || !coordinates) {
      console.warn('GltfModelLayer: Missing required model data (id, url, coordinates)');
      return;
    }

    try {
      // 检查是否已经加载过该模型
      if (this.loadedModels.has(id)) {
        console.warn(`GltfModelLayer: Model ${id} already loaded`);
        return;
      }

      // 创建GLTF标记
      const gltfMarker = new GLTFMarker(coordinates, {
        symbol: {
          url: url,
          scaleX: options.scaleX || 1,
          scaleY: options.scaleY || 1,
          scaleZ: options.scaleZ || 1,
          rotationX: options.rotationX || 0,
          rotationY: options.rotationY || 0,
          rotationZ: options.rotationZ || 0,
          translation: options.translation || [0, 0, 0],
          animation: options.animation || false,
        },
        properties: {
          id: id,
          name: options.name || `Model ${id}`,
          description: options.description || '',
        },
      });

      // 添加点击事件
      gltfMarker.on('click', () => {
        this.onModelClick(modelData);
      });

      // 添加到图层
      this.gltfLayer.addGeometry(gltfMarker);
      
      // 缓存模型
      this.loadedModels.set(id, {
        marker: gltfMarker,
        data: modelData,
      });

      // 添加位置标记（可选）
      if (options.showMarker !== false) {
        this.addPositionMarker(modelData);
      }

      console.log(`GltfModelLayer: Model ${id} loaded successfully`);
      
      // 触发模型加载完成事件
      eventBus.emit('gltf-model-loaded', { id, modelData });
      
    } catch (error) {
      console.error(`GltfModelLayer: Failed to load model ${id}:`, error);
      eventBus.emit('gltf-model-error', { id, error: error.message });
    }
  }

  /**
   * 隐藏GLTF模型图层
   */
  hide() {
    if (!this.map) {
      console.warn('GLTFModelLayer: Map not initialized');
      return;
    }

    // 如果已经隐藏，避免重复设置
    if (!this._visible) {
      return;
    }

    try {
      // 隐藏GLTF图层（不移除，只是隐藏）
      if (this.gltfLayer && this.gltfLayer.hide) {
        this.gltfLayer.hide();
      }
      
      this._visible = false;
      console.log('GLTFModelLayer: GLTF model layer hidden');
    } catch (error) {
      console.error('GLTFModelLayer: Failed to hide GLTF layer', error);
    }
  }

  /**
   * 移除图层，清理所有资源
   */
  remove() {
    if (!this.map) {
      console.warn('GLTFModelLayer: Map not initialized');
      return;
    }

    try {
      // 移除所有GLTF标记
      this.gltfMarkers.forEach(marker => {
        if (marker && marker.remove) {
          marker.remove();
        }
      });
      this.gltfMarkers = [];
      
      // 移除GLTF图层
      if (this.gltfLayer && this.gltfLayer.remove) {
        this.gltfLayer.remove();
      }
      this.gltfLayer = null;
      
      this._visible = false;
      console.log('GLTFModelLayer: GLTF model layer removed');
    } catch (error) {
      console.error('GLTFModelLayer: Failed to remove GLTF layer', error);
    }
  }

  /**
   * 销毁图层，清理所有资源
   */
  destroy() {
    // 先移除图层
    this.remove();
    
    // 清理引用
    this.gltfLayer = null;
    this.gltfMarkers = [];
    
    // 基类会自动清理事件监听器
    super.destroy();
  }
}

const gltfModelLayer = new GLTFModelLayer();
export default gltfModelLayer;
