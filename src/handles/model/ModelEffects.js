import { THREE } from '@/utils/three.js';
import GlobeAnimation from './animations/GlobeAnimation.js';
import * as shadermaterial from './shaders';

/**
 * 模型效果管理器
 * 负责管理模型的各种视觉效果，包括Bloom效果和Shader动画
 */
class ModelEffects {
  constructor(modelObj, options = {}) {
    this.modelObj = modelObj;
    this.geometryMaxHeight = 0;
    this.shadermaterial = null;
    this.shadermaterialAnimationSpeed = 0;
    
    // 默认配置
    this.customerShaderConfig = {
      bottomColor: 'rgb(0,19,39)',
      topColor: 'rgb(0,50,100)',
      flowColor: 'rgb(255,103,19)',
      topGradientDistance: 5,
      bottomGradientDistance: 50,
      speed: 100,
      wireframe: false,
      ...options.customerShaderConfig
    };
    
    this._verticalFlowShaderUpdate = this._verticalFlowShaderAnimation.bind(this);
    
    this._init();
  }
  
  /**
   * 初始化效果管理器
   */
  _init() {
    // 计算模型最大高度
    this._calculateMaxHeight();
    
    // 初始化自定义着色器材质
    this._initShaderMaterial();
  }
  
  /**
   * 计算模型的最大高度
   */
  _calculateMaxHeight() {
    this.modelObj.traverse((item) => {
      if (item.type === 'Mesh' && item.geometry) {
        // 确保包围盒已计算
        if (!item.geometry.boundingBox) {
          item.geometry.computeBoundingBox();
        }
        if (item.geometry.boundingBox && item.geometry.boundingBox.max.y > this.geometryMaxHeight) {
          this.geometryMaxHeight = item.geometry.boundingBox.max.y;
        }
      }
    });
  }
  
  /**
   * 初始化着色器材质
   */
  _initShaderMaterial() {
    this.shadermaterial = new shadermaterial.VerticalFlowShader().material;
    this.shadermaterial.uniforms.bottomColor.value = new THREE.Color(this.customerShaderConfig.bottomColor);
    this.shadermaterial.uniforms.topColor.value = new THREE.Color(this.customerShaderConfig.topColor);
    this.shadermaterial.uniforms.flowColor.value = new THREE.Color(this.customerShaderConfig.flowColor);
    this.shadermaterial.uniforms.bottomGradientDistance.value = this.customerShaderConfig.bottomGradientDistance;
    this.shadermaterial.uniforms.topGradientDistance.value = this.customerShaderConfig.topGradientDistance;
    this.shadermaterial.uniforms.geometryMaxHeight.value = this.geometryMaxHeight;
    this.shadermaterial.wireframe = this.customerShaderConfig.wireframe;
    this.shadermaterial.speed = this.customerShaderConfig.speed;
    
    this.shadermaterialAnimationSpeed = this.geometryMaxHeight / this.shadermaterial.speed;
  }
  
  /**
   * 应用自定义着色器材质到模型
   */
  applyShaderMaterial() {
    this.modelObj.traverse((item) => {
      if (item.material) {
        item.material = this.shadermaterial;
      }
    });
  }
  
  /**
   * 设置Bloom效果
   * @param {boolean} bloom - 是否启用Bloom效果
   */
  setBloom(bloom) {
    if (!this.modelObj) return;
    
    if (typeof bloom === 'boolean' && bloom) {
      this.modelObj.traverse((item) => {
        item.layers.enable(1);
      });
    } else if (typeof bloom === 'boolean' && !bloom) {
      this.modelObj.traverse((item) => {
        item.layers.disable(1);
      });
    }
  }
  
  /**
   * 垂直流动着色器动画
   */
  _verticalFlowShaderAnimation() {
    if (!this.shadermaterial) return;
    
    this.shadermaterial.uniforms.lightCenterHeight.value += this.shadermaterialAnimationSpeed;
    if (this.shadermaterial.uniforms.lightCenterHeight.value > this.geometryMaxHeight) {
      this.shadermaterial.uniforms.lightCenterHeight.value = 0;
    }
  }
  
  /**
   * 启动着色器动画
   * @param {string} type - 动画类型
   */
  shaderAnimation(type) {
    if (type === 'verticalFlow') {
      // 先应用着色器材质
      this.applyShaderMaterial();
      // 启动动画
      GlobeAnimation.addAnimation(this._verticalFlowShaderUpdate);
    } else if (type === 'verticalTripFlow') {
      // 可以在这里添加其他类型的着色器动画
    }
  }
  
  /**
   * 停止着色器动画
   */
  stopShaderAnimation() {
    GlobeAnimation.removeAnimation(this._verticalFlowShaderUpdate);
  }
  
  /**
   * 销毁效果管理器
   */
  destroy() {
    this.stopShaderAnimation();
    this.modelObj = null;
    this.shadermaterial = null;
  }
}

export default ModelEffects;