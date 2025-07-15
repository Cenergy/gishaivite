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
        event: 'changeModelType',
        handler: (type) => {
          console.log('GLTFModelLayer: Change model type to', type);
          // 可以根据类型切换不同的模型
        },
      },
      {
        event: 'toggleModelVisibility',
        handler: (visible) => {
          console.log('GLTFModelLayer: Toggle visibility', visible);
          if (visible) {
            this.show();
          } else {
            this.hide();
          }
        },
      },
      {
        event: 'locateToModel',
        handler: (data) => {
          console.log('GLTFModelLayer: Locate to model', data);
          this.locateToModel();
        },
      },
      {
        event: 'showTestModel',
        handler: (data) => {
          console.log('GLTFModelLayer: Show test model', data);
          this.show();
        },
      },
      {
        event: 'hideTestModel',
        handler: () => {
          console.log('GLTFModelLayer: Hide test model');
          this.hide();
        },
      },
      {
        event: 'loadTestModel',
        handler: (data) => {
          console.log('GLTFModelLayer: Load test model', data);
          this.show();
        },
      },
      {
        event: 'destroyTestModel',
        handler: () => {
          console.log('GLTFModelLayer: Destroy test model');
          this.remove();
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
      // 如果图层已存在，直接显示
      if (this.gltfLayer) {
        this.gltfLayer.show();
        this._visible = true;
        console.log('GLTFModelLayer: GLTF model layer shown');
        return;
      }

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
      
      gltfMarker.addTo(this.gltfLayer);
      this.gltfMarkers.push(gltfMarker);
      
      this._visible = true;
      console.log('GLTFModelLayer: GLTF model layer created and shown');
    } catch (error) {
      console.error('GLTFModelLayer: Failed to show GLTF layer', error);
    }
  }

  /**
   * 定位到模型
   */
  locateToModel() {
    if (!this.map || !this.gltfMarkers.length) {
      console.warn('GLTFModelLayer: Map not initialized or no markers available');
      return;
    }

    try {
      // 获取第一个标记的坐标
      const marker = this.gltfMarkers[0];
      if (marker && marker.getCoordinates) {
        const coordinates = marker.getCoordinates();
        
        // 设置地图视角到模型位置
        this.map.animateTo({
          center: [coordinates.x, coordinates.y],
          zoom: 18,
          pitch: 45,
          bearing: 0
        }, {
          duration: 2000
        });
        
        console.log('GLTFModelLayer: Located to model at', coordinates);
      }
    } catch (error) {
      console.error('GLTFModelLayer: Failed to locate to model', error);
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
