import { THREE } from '@/utils/three.js';
import GlobeAnimation from './animations/GlobeAnimation.js';
import * as shadermaterial from './shaders';

/**
 * 模型效果管理器
 * 负责管理模型的各种视觉效果，包括Bloom效果和Shader动画
 */
class ModelEffects {
  // 默认配置常量
  static DEFAULT_SHADER_CONFIG = {
    bottomColor: 'rgb(0,19,39)',
    topColor: 'rgb(0,50,100)',
    flowColor: 'rgb(255,103,19)',
    topGradientDistance: 5,
    bottomGradientDistance: 50,
    speed: 100,
    wireframe: false
  };

  // 动画类型常量
  static ANIMATION_TYPES = {
    VERTICAL_FLOW: 'verticalFlow',
    VERTICAL_TRIP_FLOW: 'verticalTripFlow'
  };

  constructor(modelObj, options = {}) {
    // 参数验证
    if (!modelObj) {
      throw new Error('ModelEffects: modelObj is required');
    }

    this.modelObj = modelObj;
    this.geometryMaxHeight = 0;
    this.shadermaterial = null;
    this.shadermaterialAnimationSpeed = 0;
    this.isAnimating = false;
    
    // 合并配置
    this.shaderConfig = {
      ...ModelEffects.DEFAULT_SHADER_CONFIG,
      ...options.shaderConfig
    };
    
    // 绑定动画函数
    this._verticalFlowShaderUpdate = this._verticalFlowShaderAnimation.bind(this);
    
    this._init();
  }
  
  /**
   * 初始化效果管理器
   * @private
   */
  _init() {
    try {
      this._calculateMaxHeight();
      this._initShaderMaterial();
    } catch (error) {
      console.error('ModelEffects initialization failed:', error);
      throw error;
    }
  }
  
  /**
   * 计算模型的最大高度
   * @private
   */
  _calculateMaxHeight() {
    let maxHeight = 0;
    
    this.modelObj.traverse((child) => {
      if (child.isMesh && child.geometry) {
        // 确保包围盒已计算
        if (!child.geometry.boundingBox) {
          child.geometry.computeBoundingBox();
        }
        
        const boundingBox = child.geometry.boundingBox;
        if (boundingBox && boundingBox.max.y > maxHeight) {
          maxHeight = boundingBox.max.y;
        }
      }
    });
    
    this.geometryMaxHeight = maxHeight;
  }
  
  /**
   * 初始化着色器材质
   * @private
   */
  _initShaderMaterial() {
    if (!shadermaterial.VerticalFlowShader) {
      throw new Error('VerticalFlowShader not found in shader materials');
    }

    this.shadermaterial = new shadermaterial.VerticalFlowShader().material;
    
    // 设置uniform值
    const uniforms = this.shadermaterial.uniforms;
    const config = this.shaderConfig;
    
    uniforms.bottomColor.value = new THREE.Color(config.bottomColor);
    uniforms.topColor.value = new THREE.Color(config.topColor);
    uniforms.flowColor.value = new THREE.Color(config.flowColor);
    uniforms.bottomGradientDistance.value = config.bottomGradientDistance;
    uniforms.topGradientDistance.value = config.topGradientDistance;
    uniforms.geometryMaxHeight.value = this.geometryMaxHeight;
    
    // 设置材质属性
    this.shadermaterial.wireframe = config.wireframe;
    this.shadermaterial.speed = config.speed;
    
    // 计算动画速度
    this.shadermaterialAnimationSpeed = this.geometryMaxHeight / config.speed;
  }
  
  /**
   * 应用自定义着色器材质到模型
   */
  applyShaderMaterial() {
    if (!this.shadermaterial) {
      console.warn('Shader material not initialized');
      return;
    }

    this.modelObj.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material = this.shadermaterial;
      }
    });
  }
  
  /**
   * 设置Bloom效果
   * @param {boolean} enabled - 是否启用Bloom效果
   */
  setBloom(enabled) {
    if (!this.modelObj) {
      console.warn('Model object not available');
      return;
    }
    
    if (typeof enabled !== 'boolean') {
      console.warn('Bloom parameter must be a boolean');
      return;
    }
    
    const layerAction = enabled ? 'enable' : 'disable';
    this.modelObj.traverse((child) => {
      child.layers[layerAction](1);
    });
  }
  
  /**
   * 垂直流动着色器动画
   * @private
   */
  _verticalFlowShaderAnimation() {
    if (!this.shadermaterial || !this.isAnimating) return;
    
    const lightCenterHeight = this.shadermaterial.uniforms.lightCenterHeight;
    lightCenterHeight.value += this.shadermaterialAnimationSpeed;
    
    if (lightCenterHeight.value > this.geometryMaxHeight) {
      lightCenterHeight.value = 0;
    }
  }
  
  /**
   * 启动着色器动画
   * @param {string} type - 动画类型 ('verticalFlow' | 'verticalTripFlow')
   */
  startShaderAnimation(type = ModelEffects.ANIMATION_TYPES.VERTICAL_FLOW) {
    if (this.isAnimating) {
      console.warn('Animation is already running');
      return;
    }

    switch (type) {
      case ModelEffects.ANIMATION_TYPES.VERTICAL_FLOW:
        this.applyShaderMaterial();
        GlobeAnimation.addAnimation(this._verticalFlowShaderUpdate);
        this.isAnimating = true;
        break;
      case ModelEffects.ANIMATION_TYPES.VERTICAL_TRIP_FLOW:
        // TODO: 实现垂直三重流动动画
        console.warn('Vertical trip flow animation not implemented yet');
        break;
      default:
        console.warn(`Unknown animation type: ${type}`);
    }
  }

  /**
   * 启动着色器动画 (向后兼容)
   * @deprecated 使用 startShaderAnimation 替代
   * @param {string} type - 动画类型
   */
  shaderAnimation(type) {
    console.warn('shaderAnimation is deprecated, use startShaderAnimation instead');
    this.startShaderAnimation(type);
  }
  
  /**
   * 停止着色器动画
   */
  stopShaderAnimation() {
    if (!this.isAnimating) return;
    
    GlobeAnimation.removeAnimation(this._verticalFlowShaderUpdate);
    this.isAnimating = false;
  }
  
  /**
   * 更新着色器配置
   * @param {Object} newConfig - 新的配置对象
   */
  updateShaderConfig(newConfig) {
    if (!newConfig || typeof newConfig !== 'object') {
      console.warn('Invalid shader config provided');
      return;
    }

    this.shaderConfig = { ...this.shaderConfig, ...newConfig };
    
    if (this.shadermaterial) {
      this._updateShaderUniforms();
    }
  }

  /**
   * 更新着色器uniform值
   * @private
   */
  _updateShaderUniforms() {
    const uniforms = this.shadermaterial.uniforms;
    const config = this.shaderConfig;
    
    if (uniforms.bottomColor) uniforms.bottomColor.value.set(config.bottomColor);
    if (uniforms.topColor) uniforms.topColor.value.set(config.topColor);
    if (uniforms.flowColor) uniforms.flowColor.value.set(config.flowColor);
    if (uniforms.bottomGradientDistance) uniforms.bottomGradientDistance.value = config.bottomGradientDistance;
    if (uniforms.topGradientDistance) uniforms.topGradientDistance.value = config.topGradientDistance;
    
    this.shadermaterial.wireframe = config.wireframe;
    this.shadermaterialAnimationSpeed = this.geometryMaxHeight / config.speed;
  }

  /**
   * 获取当前动画状态
   * @returns {boolean} 是否正在播放动画
   */
  isAnimationRunning() {
    return this.isAnimating;
  }

  /**
   * 销毁效果管理器
   */
  destroy() {
    this.stopShaderAnimation();
    
    // 清理资源
    if (this.shadermaterial) {
      this.shadermaterial.dispose();
      this.shadermaterial = null;
    }
    
    this.modelObj = null;
    this.shaderConfig = null;
    this._verticalFlowShaderUpdate = null;
  }
}

export default ModelEffects;