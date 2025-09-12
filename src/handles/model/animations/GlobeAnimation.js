

import { gsap } from 'gsap';

/**
 * 基于GSAP的全局动画管理器
 * 使用GSAP的ticker系统进行更高效的动画循环管理
 */
class GlobeAnimation {
    constructor() {
        this.callbacks = new Set(); // 使用Set避免重复回调
        this.isRunning = false;
        this.ticker = this._animationTicker.bind(this);
        this._startAnimation();
    }

    /**
     * 添加动画回调函数
     * @param {Function} callback - 每帧执行的回调函数
     */
    addAnimation(callback) {
        if (typeof callback === 'function') {
            this.callbacks.add(callback);
            // 如果之前没有回调，启动动画循环
            if (!this.isRunning && this.callbacks.size > 0) {
                this._startAnimation();
            }
        }
    }

    /**
     * 移除动画回调函数
     * @param {Function} callback - 要移除的回调函数
     */
    removeAnimation(callback) {
        this.callbacks.delete(callback);
        // 如果没有回调了，停止动画循环以节省性能
        if (this.callbacks.size === 0) {
            this._stopAnimation();
        }
    }

    /**
     * 清除所有动画回调
     */
    clearAllAnimations() {
        this.callbacks.clear();
        this._stopAnimation();
    }

    /**
     * 获取当前活跃的动画数量
     * @returns {number} 活跃动画数量
     */
    getActiveAnimationCount() {
        return this.callbacks.size;
    }

    /**
     * 启动动画循环
     * @private
     */
    _startAnimation() {
        if (!this.isRunning) {
            this.isRunning = true;
            gsap.ticker.add(this.ticker);
        }
    }

    /**
     * 停止动画循环
     * @private
     */
    _stopAnimation() {
        if (this.isRunning) {
            this.isRunning = false;
            gsap.ticker.remove(this.ticker);
        }
    }

    /**
     * GSAP ticker回调函数
     * @private
     */
    _animationTicker() {
        try {
            // 使用for...of循环，性能更好
            for (const callback of this.callbacks) {
                callback();
            }
        } catch (error) {
            console.warn('GlobeAnimation callback error:', error);
        }
    }

    /**
     * 销毁动画管理器
     */
    destroy() {
        this.clearAllAnimations();
        this._stopAnimation();
    }
}

// 导出单例实例
export default new GlobeAnimation();