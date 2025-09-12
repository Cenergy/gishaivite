import { gsap } from 'gsap';

/**
 * 基于GSAP的动画工具类
 * 提供简化的动画接口，保持原有API兼容性的同时提升性能
 * @author Optimized with GSAP
 * @date 2024
 */
class Animation {
    constructor(object) {
        // 保持构造函数兼容性
    }

    /**
     * 动画化对象属性值
     * @param {Object} object - 要动画的对象
     * @param {string} attr - 要动画的属性名
     * @param {number} endvalue - 目标值
     * @param {number} time - 动画时长（秒）
     * @param {Function} callback - 完成回调
     */
    static animate(object, attr, endvalue, time, callback = () => {}) {
        // 修正参数名拼写错误
        if (time === 0) {
            object[attr] = endvalue;
            callback();
            return;
        }

        // 使用GSAP进行动画，性能更好且支持更多缓动函数
        gsap.to(object, {
            [attr]: endvalue,
            duration: time,
            ease: "power2.out", // 添加缓动效果，比线性动画更自然
            onComplete: callback
        });
    }

    /**
     * 执行回调函数动画
     * @param {Function} callback1 - 每帧执行的回调
     * @param {number} time - 动画时长（秒）
     * @param {Function} callback2 - 完成回调
     */
    static animateCallback(callback1, time, callback2 = () => {}) {
        if (time === 0) {
            callback1();
            callback2();
            return;
        }

        // 使用GSAP的ticker进行更精确的帧回调
        const startTime = Date.now();
        const endTime = startTime + time * 1000;
        
        const ticker = () => {
            const currentTime = Date.now();
            const progress = (currentTime - startTime) / (endTime - startTime);
            
            if (progress <= 1) {
                callback1();
            } else {
                gsap.ticker.remove(ticker);
                callback2();
            }
        };
        
        gsap.ticker.add(ticker);
    }

    /**
     * 创建更高级的动画序列
     * @param {Array} animations - 动画配置数组
     * @returns {gsap.core.Timeline} GSAP时间轴对象
     */
    static createTimeline(animations = []) {
        const tl = gsap.timeline();
        
        animations.forEach(config => {
            const { target, props, duration = 1, delay = 0, ease = "power2.out" } = config;
            tl.to(target, {
                ...props,
                duration,
                ease
            }, delay);
        });
        
        return tl;
    }

    /**
     * 停止对象的所有动画
     * @param {Object} object - 要停止动画的对象
     */
    static killAnimations(object) {
        gsap.killTweensOf(object);
    }

    /**
     * 暂停对象的所有动画
     * @param {Object} object - 要暂停动画的对象
     */
    static pauseAnimations(object) {
        gsap.getTweensOf(object).forEach(tween => tween.pause());
    }

    /**
     * 恢复对象的所有动画
     * @param {Object} object - 要恢复动画的对象
     */
    static resumeAnimations(object) {
        gsap.getTweensOf(object).forEach(tween => tween.resume());
    }
}

export { Animation }