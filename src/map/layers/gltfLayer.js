import BaseLayer from './baseLayer';
import { GroupGLLayer, Marker, ui,GLTFLayer,GLTFMarker } from 'maptalks-gl';
import eventBus from '@/utils/EventBus';
import { LAYER_NAMES } from '../constants';

class TerrainLayer extends BaseLayer {
  constructor(options = {}) {
    super(options);
    this.terrain = [];
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
          console.log('test', data);
        },
      },
    ]);
  }

  /**
   * 显示地形图层
   */
  show() {
    if (!this.map) {
      console.warn('TerrainLayer: Map not initialized');
      return;
    }

    // 如果已经显示，避免重复设置
    if (this._visible) {
      return;
    }

    let flyingAircraftLayer = new GLTFLayer('flyingAircraft', {
      enableAltitude: true,
      zIndex: 500,
    })
  
    flyingAircraftLayer.addTo(this.map)
    let coordinate = {
      x:   113.97790555555555,
      y:   22.660430555555557,
      z: 333.8968505859375
    }

    new GLTFMarker(
      coordinate,
      {
        symbol: {
          url: ".//models/drone-normal.glb",
          modelHeight: 30,
          rotationZ: 150,
        }
      }
    ).addTo(flyingAircraftLayer)
    this._visible=true;
  }

  /**
   * 隐藏地形图层
   */
  hide() {
    if (!this.map) {
      console.warn('TerrainLayer: Map not initialized');
      return;
    }


    // 如果已经隐藏，避免重复设置
    if (!this._visible) {
      return;
    }

    try {
      this._visible = false;
      console.log('TerrainLayer: Terrain disabled');
    } catch (error) {
      console.error('TerrainLayer: Failed to remove terrain', error);
    }
  }
  destroy() {
   
    // 基类会自动清理事件监听器，无需手动调用
  }
}

const terrainLayer = new TerrainLayer();
export default terrainLayer;
