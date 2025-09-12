/**
 * GSAP迁移测试文件
 * 验证从TWEEN到GSAP的迁移是否正确
 */

import { gsap } from 'gsap';
import GlobeAnimation from '../animations/GlobeAnimation.js';

/**
 * 测试GSAP基本功能
 */
export function testGSAPBasicAnimation() {
  console.log('🧪 测试GSAP基本动画功能...');
  
  const testObject = {
    opacity: 0,
    scale: 0
  };
  
  // 测试透明度动画（对应原TWEEN的opacity动画）
  gsap.to(testObject, {
    opacity: 1,
    duration: 2,
    onStart: () => {
      console.log('✅ 透明度动画开始');
    },
    onUpdate: () => {
      console.log(`📊 透明度: ${testObject.opacity.toFixed(2)}`);
    },
    onComplete: () => {
      console.log('✅ 透明度动画完成');
    }
  });
  
  // 测试缩放动画（对应原TWEEN的scale动画）
  setTimeout(() => {
    gsap.to(testObject, {
      scale: 1,
      duration: 1.5,
      onStart: () => {
        console.log('✅ 缩放动画开始');
      },
      onUpdate: () => {
        console.log(`📊 缩放: ${testObject.scale.toFixed(2)}`);
      },
      onComplete: () => {
        console.log('✅ 缩放动画完成');
      }
    });
  }, 1000);
}

/**
 * 测试GlobeAnimation集成
 */
export function testGlobeAnimationIntegration() {
  console.log('🧪 测试GlobeAnimation与GSAP集成...');
  
  let counter = 0;
  const testCallback = () => {
    counter++;
    console.log(`📊 动画帧: ${counter}`);
    
    if (counter >= 60) { // 测试60帧后停止
      GlobeAnimation.removeAnimation(testCallback);
      console.log('✅ GlobeAnimation集成测试完成');
    }
  };
  
  GlobeAnimation.addAnimation(testCallback);
  console.log('✅ 已添加测试回调到GlobeAnimation');
}

/**
 * 模拟原TWEEN功能的GSAP实现
 */
export function testTweenToGSAPMigration() {
  console.log('🧪 测试TWEEN到GSAP迁移兼容性...');
  
  const mockMesh = {
    scale: { x: 0, y: 0, z: 0 },
    material: { opacity: 0 }
  };
  
  // 模拟原来的setShow动画（type=1, show=true）
  const simulateShowAnimation = (show, time = 3, callback = () => {}) => {
    if (show) {
      console.log('🎬 开始显示动画（模拟原TWEEN功能）');
      
      const animationObject = { opacity: 0 };
      
      gsap.to(animationObject, {
        opacity: 1,
        duration: time,
        onStart: () => {
          console.log('✅ 显示动画开始');
        },
        onUpdate: () => {
          mockMesh.material.opacity = animationObject.opacity;
          console.log(`📊 网格透明度: ${mockMesh.material.opacity.toFixed(2)}`);
        },
        onComplete: () => {
          console.log('✅ 显示动画完成');
          callback();
        }
      });
    }
  };
  
  // 模拟原来的setShow动画（type=2, show=true）
  const simulateScaleAnimation = (show, time = 3, callback = () => {}) => {
    if (show) {
      console.log('🎬 开始缩放动画（模拟原TWEEN功能）');
      
      const animationObject = { _scale: 0 };
      const targetScale = 1;
      
      gsap.to(animationObject, {
        _scale: targetScale,
        duration: time,
        onStart: () => {
          console.log('✅ 缩放动画开始');
        },
        onUpdate: () => {
          mockMesh.scale.x = animationObject._scale;
          mockMesh.scale.y = animationObject._scale;
          mockMesh.scale.z = animationObject._scale;
          console.log(`📊 网格缩放: ${animationObject._scale.toFixed(2)}`);
        },
        onComplete: () => {
          console.log('✅ 缩放动画完成');
          callback();
        }
      });
    }
  };
  
  // 执行测试
  simulateShowAnimation(true, 2, () => {
    console.log('🎉 显示动画测试完成');
    
    setTimeout(() => {
      simulateScaleAnimation(true, 1.5, () => {
        console.log('🎉 缩放动画测试完成');
        console.log('✅ TWEEN到GSAP迁移测试全部完成！');
      });
    }, 500);
  });
}

/**
 * 运行所有测试
 */
export function runAllTests() {
  console.log('🚀 开始GSAP迁移测试...');
  
  testGSAPBasicAnimation();
  
  setTimeout(() => {
    testGlobeAnimationIntegration();
  }, 1000);
  
  setTimeout(() => {
    testTweenToGSAPMigration();
  }, 2000);
}

// 如果直接运行此文件，执行所有测试
if (import.meta.url === new URL(import.meta.resolve('./gsap-migration-test.js'))) {
  runAllTests();
}

/**
 * 使用示例
 */
export const usageExample = `
📖 GSAP迁移使用示例:

// 1. 导入GSAP
import { gsap } from 'gsap';

// 2. 原TWEEN语法:
// let tween = new TWEEN.Tween(object).to({ opacity: 1 }, 1000);
// tween.onUpdate(() => { /* update logic */ }).start();

// 3. 新GSAP语法:
gsap.to(object, {
  opacity: 1,
  duration: 1, // 注意：GSAP使用秒，TWEEN使用毫秒
  onUpdate: () => { /* update logic */ }
});

// 4. 主要差异:
// - TWEEN: 时间单位是毫秒
// - GSAP: 时间单位是秒
// - TWEEN: 需要调用.start()
// - GSAP: 自动开始
// - TWEEN: 需要手动调用TWEEN.update()
// - GSAP: 自动处理更新循环
`;

console.log(usageExample);