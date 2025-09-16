import BaseLayer from './baseLayer';
import { GroupGLLayer, Marker, ui } from 'maptalks-gl';
import eventBus from '@/utils/EventBus';
import { ThreeLayer } from 'maptalks.three';
import { LAYER_NAMES } from '../constants';
import { THREE, GLTFLoader, FBXLoader, DRACOLoader } from '@/utils/three.js';

// 导入模型加载器和下载器
import { modelLoader, modelDownloader, ModelEffects } from '@/handles/model';

class TerrainLayer extends BaseLayer {
  constructor(options = {}) {
    super(options);
    this.terrain = [];
  }

  init(map) {
    super.init(map);
    // 注册事件监听器
    this.show();
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
    let threeLayer = new ThreeLayer('three-model-layer', {
      // forceRenderOnMoving: true,
      // forceRenderOnRotating: true,
      animation: true
    });
    threeLayer.prepareToDraw = (gl, scene, camera) => {
      let light = new THREE.DirectionalLight(0xffffff);
      light.position.set(0, -10, 10).normalize();
      scene.add(light);
      camera.add(new THREE.PointLight('#fff', 4));
      scene.add(light);
      //...
      this.addGltf(threeLayer);
    };

    threeLayer.addTo(this.map);

    let material = new THREE.MeshLambertMaterial({ color: 'red', transparent: true });
    let highlightmaterial = new THREE.MeshBasicMaterial({ color: 'yellow', transparent: true });

    const bar = threeLayer.toBox(
      [113.97790555555555, 22.660430555555557],
      {
        height: 200,
        radius: 150,
        topColor: '#fff',
        // radialSegments: 4
      },
      material,
    );
    console.log(bar, '----------------');

    setTimeout(() => {
      threeLayer.addMesh(bar);
    }, 3000);

    this._visible = true;
  }

  async addGltf(threeLayer) {
    console.log('🚀 ~ addGltf ~ threeLayer:', threeLayer);
    let baseObjectModel;
    const modelInfo = {
      name: 'chunsun',
      description: null,
      model_file_url: '/static/uploads/model/7be6db04fc2c4fd19e565337743c33f2/model.glb',
      binary_file_url: '/static/uploads/model/7be6db04fc2c4fd19e565337743c33f2/chunsun.bin',
      thumbnail_url: null,
      is_active: true,
      is_public: true,
      id: 18,
      uuid: '7be6db04fc2c4fd19e565337743c33f2',
      category_id: null,
      created_at: '2025-09-11T05:12:07.330174Z',
      updated_at: '2025-09-11T05:12:07.474479Z',
    };
    await modelLoader.initialize();
    const modelData = await modelLoader.loadModel(modelInfo, 'smart_stream_wasm');
    modelData.model.rotation.x = Math.PI / 2;
    baseObjectModel = threeLayer.toModel(modelData.model, {
      coordinate: [113.97790555555555, 22.660430555555557],
    });
    // model.position.copy(threeLayer.coordinateToVector3(map.getCenter()));
    threeLayer.addMesh(baseObjectModel);

    // 创建模型效果管理器
    const modelEffects = new ModelEffects(modelData.model, {
      customerShaderConfig: {
        bottomColor: 'rgb(123, 181, 243)',
        topColor: 'rgb(31, 110, 188)',
        flowColor: 'rgb(255,103,19)',
        topGradientDistance: 5,
        bottomGradientDistance: 50,
        speed: 100,
        wireframe: false,
      },
    });

    // 应用效果
    modelEffects.setBloom(true);
    modelEffects.shaderAnimation('verticalFlow');
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
  }
  destroy() {
    const groupLayer = this.map.getLayer(LAYER_NAMES.BASIC_SCENE_GROUP);
    groupLayer.setTerrain(null);
    // 基类会自动清理事件监听器，无需手动调用
  }
}

const terrainLayer = new TerrainLayer();
export default terrainLayer;
