import { Animation } from './Animation.js';
import GlobeAnimation from './GlobeAnimation.js';
import { gsap } from 'gsap';

/**
 * 动画系统使用示例
 * 展示优化后的Animation类和GlobeAnimation的使用方法
 */
class AnimationExample {
    constructor() {
        this.testObject = {
            x: 0,
            y: 0,
            opacity: 1,
            scale: 1
        };
    }

    /**
     * 基础动画示例
     */
    basicAnimationExample() {
        console.log('🎬 开始基础动画示例');
        
        // 使用优化后的Animation.animate方法
        Animation.animate(this.testObject, 'x', 100, 2, () => {
            console.log('✅ X轴动画完成，当前值:', this.testObject.x);
        });

        // 链式动画
        setTimeout(() => {
            Animation.animate(this.testObject, 'y', 50, 1.5, () => {
                console.log('✅ Y轴动画完成，当前值:', this.testObject.y);
            });
        }, 1000);
    }

    /**
     * 回调动画示例
     */
    callbackAnimationExample() {
        console.log('🎬 开始回调动画示例');
        
        let counter = 0;
        const updateCallback = () => {
            counter++;
            console.log('📊 动画帧:', counter);
        };

        Animation.animateCallback(
            updateCallback,
            3, // 3秒
            () => {
                console.log('✅ 回调动画完成，总帧数:', counter);
            }
        );
    }

    /**
     * 时间轴动画示例
     */
    timelineAnimationExample() {
        console.log('🎬 开始时间轴动画示例');
        
        const animations = [
            {
                target: this.testObject,
                props: { x: 200, opacity: 0.5 },
                duration: 1,
                delay: 0
            },
            {
                target: this.testObject,
                props: { y: 100, scale: 1.5 },
                duration: 1.5,
                delay: 0.5
            },
            {
                target: this.testObject,
                props: { x: 0, y: 0, opacity: 1, scale: 1 },
                duration: 2,
                delay: 1
            }
        ];

        const timeline = Animation.createTimeline(animations);
        timeline.eventCallback('onComplete', () => {
            console.log('✅ 时间轴动画完成');
        });
    }

    /**
     * GlobeAnimation使用示例
     */
    globeAnimationExample() {
        console.log('🎬 开始GlobeAnimation示例');
        
        let rotationAngle = 0;
        const rotationCallback = () => {
            rotationAngle += 0.01;
            // 模拟旋转动画
            console.log('🔄 旋转角度:', (rotationAngle * 180 / Math.PI).toFixed(2), '度');
        };

        // 添加动画回调
        GlobeAnimation.addAnimation(rotationCallback);
        console.log('📈 当前活跃动画数量:', GlobeAnimation.getActiveAnimationCount());

        // 3秒后移除动画
        setTimeout(() => {
            GlobeAnimation.removeAnimation(rotationCallback);
            console.log('✅ 旋转动画已移除');
            console.log('📈 当前活跃动画数量:', GlobeAnimation.getActiveAnimationCount());
        }, 3000);
    }

    /**
     * 动画控制示例
     */
    animationControlExample() {
        console.log('🎬 开始动画控制示例');
        
        // 创建一个长时间动画
        Animation.animate(this.testObject, 'x', 300, 5, () => {
            console.log('✅ 长时间动画完成');
        });

        // 2秒后暂停动画
        setTimeout(() => {
            Animation.pauseAnimations(this.testObject);
            console.log('⏸️ 动画已暂停');
        }, 2000);

        // 4秒后恢复动画
        setTimeout(() => {
            Animation.resumeAnimations(this.testObject);
            console.log('▶️ 动画已恢复');
        }, 4000);

        // 6秒后停止所有动画
        setTimeout(() => {
            Animation.killAnimations(this.testObject);
            console.log('⏹️ 所有动画已停止');
        }, 6000);
    }

    /**
     * 运行所有示例
     */
    runAllExamples() {
        console.log('🚀 开始运行所有动画示例');
        
        this.basicAnimationExample();
        
        setTimeout(() => this.callbackAnimationExample(), 1000);
        setTimeout(() => this.timelineAnimationExample(), 3000);
        setTimeout(() => this.globeAnimationExample(), 6000);
        setTimeout(() => this.animationControlExample(), 10000);
    }
}

// 导出示例类
export default AnimationExample;

// 如果直接运行此文件，执行示例
if (typeof window !== 'undefined') {
    window.AnimationExample = AnimationExample;
    console.log('💡 在控制台中运行: new AnimationExample().runAllExamples()');
}