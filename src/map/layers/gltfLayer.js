import BaseLayer from './baseLayer';
import { GLTFLayer, GLTFMarker } from 'maptalks-gl';
import eventBus from '@/utils/EventBus';

class GLTFModelLayer extends BaseLayer {
  constructor(options = {}) {
    super(options);
    this.gltfLayer = null;
    this.gltfMarkers = [];
    this._visible = false;
  }

  init(map) {
    super.init(map);
    // 注册事件监听器
    this.registerEvents();
    this.show();
  }

  registerEvents() {
    // 直接使用基类的 addEventListeners 方法注册事件
    super.addEventListeners([
      {
        event: 'test',
        handler: (data) => {
          console.log('GLTFModelLayer test event:', data);
        },
      },
    ]);
  }

  /**
   * 显示GLTF模型图层
   */
  show() {
    if (!this.map) {
      console.warn('GLTFModelLayer: Map not initialized');
      return;
    }

    // 如果已经显示，避免重复设置
    if (this._visible) {
      return;
    }

    try {
      // 创建GLTF图层
      this.gltfLayer = new GLTFLayer('flyingAircraft', {
        enableAltitude: true,
        zIndex: 500,
      });
      
      this.gltfLayer.addTo(this.map);


      
      
      // 定义无人机坐标
      const coordinate = {
        x: 113.97790555555555,
        y: 22.660430555555557,
        z: 333.8968505859375
      };

      // 创建GLTF标记
      const gltfMarker = new GLTFMarker(
        coordinate,
        {
          symbol: {
            url: './models/drone-normal.glb',
            modelHeight: 30,
            rotationZ: 150,
          }
        }
      );
   
      // this.gltfLayer.addGeometry(gltfMarker);
      gltfMarker.addTo(this.gltfLayer);
      
      this.gltfMarkers.push(gltfMarker);
      
      this._visible = true;
      console.log('GLTFModelLayer: GLTF model layer shown');
    } catch (error) {
      console.error('GLTFModelLayer: Failed to show GLTF layer', error);
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
      console.log('GLTFModelLayer: GLTF model layer hidden');
    } catch (error) {
      console.error('GLTFModelLayer: Failed to hide GLTF layer', error);
    }
  }

  /**
   * 销毁图层，清理所有资源
   */
  destroy() {
    // 先隐藏图层
    this.hide();
    
    // 清理引用
    this.gltfLayer = null;
    this.gltfMarkers = [];
    
    // 基类会自动清理事件监听器
    super.destroy();
  }
}

const gltfModelLayer = new GLTFModelLayer();
export default gltfModelLayer;
