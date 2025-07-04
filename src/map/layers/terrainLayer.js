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
    console.log('🚀 ~ TerrainLayer ~ show ~ options:', this.map);
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
