import { THREE } from '@/utils/three.js';
import { gsap } from 'gsap';

/**
 * 模型动画管理器
 * 负责管理模型的动画播放、控制和状态管理
 * 内置动画循环管理，无需外部手动调用update
 */
class ModelAnimations {
  constructor(modelObj, options = {}) {
    this.modelObj = modelObj;
    this.animationMixer = null;
    this.animationActions = [];
    this.clock = new THREE.Clock();
    this.isPlaying = false;
    this.currentAnimationIndex = -1;
    this.animationTicker = null;
    
    // 默认配置
    this.config = {
      autoPlay: false,
      loop: true,
      crossFadeDuration: 0.3,
      autoStartLoop: true, // 自动启动动画循环
      ...options
    };
    
    this._init();
  }
  
  /**
   * 初始化动画管理器
   */
  _init() {
    this._setupAnimations();
    
    // 如果配置了自动启动循环，启动动画循环
    if (this.config.autoStartLoop && this.animationMixer) {
      this.startAnimationLoop();
    }
    
    // 如果配置了自动播放，播放第一个动画
    if (this.config.autoPlay && this.animationActions.length > 0) {
      this.play(0);
    }
  }
  
  /**
   * 设置动画
   */
  _setupAnimations() {
    // 清理之前的动画
    this._cleanup();
    
    // 检查模型是否有动画
    if (this.modelObj && this.modelObj.animations && this.modelObj.animations.length > 0) {
      console.log('🎬 发现动画数据:', this.modelObj.animations.length, '个动画');
      
      // 创建动画混合器
      this.animationMixer = new THREE.AnimationMixer(this.modelObj);
      
      // 为每个动画创建动作
      this.modelObj.animations.forEach((clip, index) => {
        console.log(`🎭 动画 ${index + 1}: ${clip.name}, 时长: ${clip.duration.toFixed(2)}s`);
        const action = this.animationMixer.clipAction(clip);
        
        // 设置循环模式
        if (this.config.loop) {
          action.setLoop(THREE.LoopRepeat, Infinity);
        }
        
        this.animationActions.push(action);
      });
    } else {
      console.log('📝 该模型没有动画数据');
    }
  }
  
  /**
   * 播放指定索引的动画
   * @param {number} index - 动画索引
   * @param {number} crossFadeDuration - 交叉淡入淡出时长
   */
  play(index = 0, crossFadeDuration = null) {
    if (!this.animationActions.length || index < 0 || index >= this.animationActions.length) {
      console.warn(`⚠️ 无法播放动画：索引 ${index} 超出范围，可用动画数量: ${this.animationActions.length}`);
      return false;
    }
    
    const fadeDuration = crossFadeDuration !== null ? crossFadeDuration : this.config.crossFadeDuration;
    
    // 如果有当前播放的动画，进行交叉淡入淡出
    if (this.currentAnimationIndex >= 0 && this.currentAnimationIndex !== index) {
      const currentAction = this.animationActions[this.currentAnimationIndex];
      const newAction = this.animationActions[index];
      
      currentAction.fadeOut(fadeDuration);
      newAction.reset().fadeIn(fadeDuration).play();
    } else {
      // 停止所有动画
      this.animationActions.forEach(action => action.stop());
      
      // 播放指定动画
      const action = this.animationActions[index];
      action.reset().play();
    }
    
    this.currentAnimationIndex = index;
    this.isPlaying = true;
    
    console.log(`▶️ 播放动画: ${this.animationActions[index].getClip().name}`);
    return true;
  }
  
  /**
   * 停止所有动画
   */
  stop() {
    if (this.animationMixer) {
      this.animationActions.forEach(action => action.stop());
      this.isPlaying = false;
      this.currentAnimationIndex = -1;
      console.log('⏹️ 停止动画');
    }
  }
  
  /**
   * 暂停当前动画
   */
  pause() {
    if (this.isPlaying && this.currentAnimationIndex >= 0) {
      this.animationActions[this.currentAnimationIndex].paused = true;
      this.isPlaying = false;
      console.log('⏸️ 暂停动画');
    }
  }
  
  /**
   * 恢复当前动画
   */
  resume() {
    if (!this.isPlaying && this.currentAnimationIndex >= 0) {
      this.animationActions[this.currentAnimationIndex].paused = false;
      this.isPlaying = true;
      console.log('▶️ 恢复动画');
    }
  }
  
  /**
   * 播放下一个动画
   */
  playNext() {
    if (this.animationActions.length === 0) return false;
    
    const nextIndex = (this.currentAnimationIndex + 1) % this.animationActions.length;
    return this.play(nextIndex);
  }
  
  /**
   * 播放上一个动画
   */
  playPrevious() {
    if (this.animationActions.length === 0) return false;
    
    const prevIndex = this.currentAnimationIndex <= 0 
      ? this.animationActions.length - 1 
      : this.currentAnimationIndex - 1;
    return this.play(prevIndex);
  }
  
  /**
   * 设置动画播放速度
   * @param {number} speed - 播放速度倍率
   * @param {number} index - 动画索引，-1表示所有动画
   */
  setSpeed(speed, index = -1) {
    if (index >= 0 && index < this.animationActions.length) {
      this.animationActions[index].setEffectiveTimeScale(speed);
    } else {
      this.animationActions.forEach(action => {
        action.setEffectiveTimeScale(speed);
      });
    }
  }
  
  /**
   * 设置动画权重
   * @param {number} weight - 权重值 (0-1)
   * @param {number} index - 动画索引
   */
  setWeight(weight, index) {
    if (index >= 0 && index < this.animationActions.length) {
      this.animationActions[index].setEffectiveWeight(weight);
    }
  }
  
  /**
   * 更新动画（内部使用，由GSAP ticker自动调用）
   */
  update() {
    if (this.animationMixer && this.isPlaying) {
      this.animationMixer.update(this.clock.getDelta());
    }
  }
  
  /**
   * 启动动画循环
   * 使用GSAP ticker来管理动画更新
   */
  startAnimationLoop() {
    if (this.animationTicker) {
      this.stopAnimationLoop();
    }
    
    // 使用GSAP ticker来管理动画循环
    this.animationTicker = gsap.ticker.add(() => {
      this.update();
    });
    
    console.log('🔄 启动动画循环管理');
  }
  
  /**
   * 停止动画循环
   */
  stopAnimationLoop() {
    if (this.animationTicker) {
      gsap.ticker.remove(this.animationTicker);
      this.animationTicker = null;
      console.log('⏹️ 停止动画循环管理');
    }
  }
  
  /**
   * 手动启动动画循环（用于外部调用）
   */
  enableAutoUpdate() {
    this.startAnimationLoop();
  }
  
  /**
   * 手动停止动画循环（用于外部调用）
   */
  disableAutoUpdate() {
    this.stopAnimationLoop();
  }
  
  /**
   * 获取动画信息
   */
  getAnimationInfo() {
    if (!this.modelObj || !this.modelObj.animations || this.modelObj.animations.length === 0) {
      return {
        hasAnimations: false,
        count: 0,
        animations: [],
        info: '无动画'
      };
    }
    
    const animations = this.modelObj.animations.map((clip, index) => ({
      index,
      name: clip.name,
      duration: clip.duration,
      tracks: clip.tracks.length
    }));
    
    const info = animations
      .map(anim => `动画${anim.index + 1}: ${anim.name} (${anim.duration.toFixed(2)}s)`)
      .join(', ');
    
    return {
      hasAnimations: true,
      count: animations.length,
      animations,
      info,
      currentIndex: this.currentAnimationIndex,
      isPlaying: this.isPlaying
    };
  }
  
  /**
   * 获取当前播放状态
   */
  getPlaybackState() {
    return {
      isPlaying: this.isPlaying,
      currentAnimationIndex: this.currentAnimationIndex,
      currentAnimationName: this.currentAnimationIndex >= 0 
        ? this.animationActions[this.currentAnimationIndex].getClip().name 
        : null,
      totalAnimations: this.animationActions.length
    };
  }
  
  /**
   * 清理动画资源
   */
  _cleanup() {
    if (this.animationMixer) {
      this.animationMixer.stopAllAction();
      this.animationMixer = null;
    }
    this.animationActions = [];
    this.isPlaying = false;
    this.currentAnimationIndex = -1;
  }
  
  /**
   * 销毁动画管理器
   */
  destroy() {
    // 停止动画循环
    this.stopAnimationLoop();
    
    // 清理动画资源
    this._cleanup();
    
    // 清理引用
    this.modelObj = null;
    this.clock = null;
    this.animationTicker = null;
  }
}

export default ModelAnimations;