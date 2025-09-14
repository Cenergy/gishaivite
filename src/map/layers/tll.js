import BaseLayer from './baseLayer';
import { GroupGLLayer, Marker, ui } from 'maptalks-gl';
import eventBus from '@/utils/EventBus';
import { ThreeLayer } from 'maptalks.three';
import { LAYER_NAMES } from '../constants';
import { THREE, GLTFLoader, FBXLoader, DRACOLoader } from '@/utils/three.js';

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
    var threeLayer = new ThreeLayer('t', {
      // forceRenderOnMoving: true,
      // forceRenderOnRotating: true,
      // animation: true
    });
    threeLayer.prepareToDraw = (gl, scene, camera) => {
      var light = new THREE.DirectionalLight(0xffffff);
      light.position.set(0, -10, 10).normalize();
      scene.add(light);
      camera.add(new THREE.PointLight('#fff', 4));
      scene.add(light);
      //...
      this.addGLTF(threeLayer);
    };

    threeLayer.addTo(this.map);

    var material = new THREE.MeshLambertMaterial({ color: 'red', transparent: true });
    var highlightmaterial = new THREE.MeshBasicMaterial({ color: 'yellow', transparent: true });

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

  addGLTF(threeLayer) {
    var loader = new GLTFLoader();
    let model, baseObjectModel;
    loader.load(
      'https://maptalks.org/maptalks.three/demo/data/RobotExpressive.glb',
      function (gltf) {
        model = gltf.scene;
        model.rotation.x = Math.PI / 2;
        model.scale.set(100, 100, 100);

        baseObjectModel = threeLayer.toModel(model, {
          coordinate: [113.97790555555555, 22.660430555555557],
        });
        // model.position.copy(threeLayer.coordinateToVector3(map.getCenter()));
        threeLayer.addMesh(baseObjectModel);
      },
      undefined,
      function (e) {
        console.error(e);
      },
    );
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
