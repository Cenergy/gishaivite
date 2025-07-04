import BaseLayer from './baseLayer';
import { GroupGLLayer, Marker, ui } from 'maptalks-gl';
import eventBus from '@/utils/EventBus';

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

  show() {
    const groupLayer = this.map.getLayer('basic_scene_group');
    
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
      urlTemplate: 'http://127.0.0.1:5503/gis/terrain_webp/{z}/{x}/{y}.webp',
      colors: colors4,
      exaggeration: 1,
    };
    groupLayer.setTerrain(terrain);
  }

  _showCore(options) {
    this._visible = true;
  }

  _hideCore(options) {
    this._visible = false;
  }

  destroy() {
    // 基类会自动清理事件监听器，无需手动调用
  }
}

const terrainLayer = new TerrainLayer();
export default terrainLayer;
