import BaseLayer from './baseLayer';
import { GroupGLLayer, Marker, ui } from 'maptalks-gl';
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

    const groupLayer = this.map.getLayer(LAYER_NAMES.BASIC_SCENE_GROUP);
    if (!groupLayer) {
      console.warn(`TerrainLayer: ${LAYER_NAMES.BASIC_SCENE_GROUP} layer not found`);
      return;
    }


    const colors4 = [
      [0, '#F0F9E9'],
      [200, '#D7EFD1'],
      [400, '#A6DCB6'],
      [650, '#8FD4BD'],
      [880, '#67C1CB'],
      [1100, '#3C9FC8'],
      [1300, '#1171B1'],
      [1450, '#085799'],
      [1600, '#084586'],
    ];

    const terrain = {
      type: 'mapbox',
      maxAvailableZoom: 16,
      requireSkuToken: false,
      // urlTemplate: "https://microget-1300406971.cos.ap-shanghai.myqcloud.com/maptalks-study/assets/data/tile-rgb/{z}/{x}/{y}.png",
      urlTemplate: '/terrains/{z}/{x}/{y}.webp',
      colors: colors4,
      exaggeration: 1,
    };

    try {
      groupLayer.setTerrain(terrain);
      this._visible = true;
      console.log('TerrainLayer: Terrain enabled');
    } catch (error) {
      console.error('TerrainLayer: Failed to set terrain', error);
    }
  }

  /**
   * 隐藏地形图层
   */
  hide() {
    if (!this.map) {
      console.warn('TerrainLayer: Map not initialized');
      return;
    }

    const groupLayer = this.map.getLayer(LAYER_NAMES.BASIC_SCENE_GROUP);
    if (!groupLayer) {
      console.warn(`TerrainLayer: ${LAYER_NAMES.BASIC_SCENE_GROUP} layer not found`);
      return;
    }

    // 如果已经隐藏，避免重复设置
    if (!this._visible) {
      return;
    }

    try {
      groupLayer.setTerrain(null);
      this._visible = false;
      console.log('TerrainLayer: Terrain disabled');
    } catch (error) {
      console.error('TerrainLayer: Failed to remove terrain', error);
    }
  }
  destroy() {
    const groupLayer = this.map.getLayer(LAYER_NAMES.BASIC_SCENE_GROUP);
    groupLayer.setTerrain(null);
    // 基类会自动清理事件监听器，无需手动调用
  }
}

const terrainLayer = new TerrainLayer();
export default terrainLayer;
