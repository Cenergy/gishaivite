/**
 * 模型效果集成使用示例
 * 展示如何在实际项目中使用集成了效果的模型加载器
 */

import { ModelHandle } from '../modelLoader.js';

/**
 * 示例1: 基本使用 - 加载模型并自动应用效果
 */
export async function basicUsageExample() {
  console.log('📖 示例1: 基本使用');
  
  try {
    // 1. 创建模型加载器
    const modelLoader = new ModelHandle();
    
    // 2. 初始化加载器
    await modelLoader.initialize();
    console.log('✅ 模型加载器初始化完成');
    
    // 3. 加载模型（自动应用Bloom和垂直流动效果）
    const result = await modelLoader.loadOriginModel({
      model_file_url: './models/your-model.glb' // 替换为实际模型路径
    });
    
    if (result && result.effects) {
      console.log('✅ 模型加载成功，效果已自动应用');
      console.log('📊 返回数据:', {
        hasModel: !!result.model,
        hasGeometry: !!result.geometry,
        animationCount: result.animations?.length || 0,
        hasEffects: !!result.effects
      });
      
      return result;
    }
    
  } catch (error) {
    console.error('❌ 基本使用示例失败:', error);
  }
}

/**
 * 示例2: 动态控制效果
 */
export async function dynamicControlExample() {
  console.log('📖 示例2: 动态控制效果');
  
  const result = await basicUsageExample();
  
  if (result && result.effects) {
    const { effects } = result;
    
    // 延迟3秒后关闭Bloom效果
    setTimeout(() => {
      console.log('🔄 关闭Bloom效果');
      effects.setBloom(false);
    }, 3000);
    
    // 延迟6秒后重新开启Bloom效果
    setTimeout(() => {
      console.log('🔄 重新开启Bloom效果');
      effects.setBloom(true);
    }, 6000);
    
    // 延迟9秒后停止着色器动画
    setTimeout(() => {
      console.log('🔄 停止着色器动画');
      effects.stopShaderAnimation();
    }, 9000);
    
    // 延迟12秒后重新启动着色器动画
    setTimeout(() => {
      console.log('🔄 重新启动着色器动画');
      effects.shaderAnimation('verticalFlow');
    }, 12000);
  }
}

/**
 * 示例3: 在Vue组件中使用
 */
export const vueComponentExample = `
<template>
  <div class="model-container">
    <div ref="threeContainer" class="three-container"></div>
    <div class="controls">
      <button @click="toggleBloom">切换Bloom效果</button>
      <button @click="toggleAnimation">切换动画</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ModelHandle } from '@/handles/model/modelLoader.js';
import * as THREE from 'three';

const threeContainer = ref(null);
const modelEffects = ref(null);
const scene = ref(null);
const renderer = ref(null);
const camera = ref(null);
let animationId = null;

// 初始化Three.js场景
const initThreeScene = () => {
  // 创建场景
  scene.value = new THREE.Scene();
  
  // 创建相机
  camera.value = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.value.position.z = 5;
  
  // 创建渲染器
  renderer.value = new THREE.WebGLRenderer({ antialias: true });
  renderer.value.setSize(window.innerWidth, window.innerHeight);
  threeContainer.value.appendChild(renderer.value.domElement);
  
  // 添加光源
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
  directionalLight.position.set(1, 1, 1);
  scene.value.add(ambientLight, directionalLight);
};

// 加载模型
const loadModel = async () => {
  try {
    const modelLoader = new ModelHandle();
    await modelLoader.initialize();
    
    const result = await modelLoader.loadOriginModel({
      model_file_url: './models/your-model.glb'
    });
    
    if (result) {
      // 添加模型到场景
      scene.value.add(result.model);
      
      // 保存效果管理器引用
      modelEffects.value = result.effects;
      
      console.log('✅ 模型加载完成，效果已应用');
    }
  } catch (error) {
    console.error('❌ 模型加载失败:', error);
  }
};

// 渲染循环
const animate = () => {
  animationId = requestAnimationFrame(animate);
  renderer.value.render(scene.value, camera.value);
};

// 切换Bloom效果
const toggleBloom = () => {
  if (modelEffects.value) {
    // 这里需要根据当前状态来切换
    modelEffects.value.setBloom(true); // 或 false
  }
};

// 切换动画
const toggleAnimation = () => {
  if (modelEffects.value) {
    // 这里可以添加动画状态管理
    modelEffects.value.shaderAnimation('verticalFlow');
  }
};

onMounted(async () => {
  initThreeScene();
  await loadModel();
  animate();
});

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (modelEffects.value) {
    modelEffects.value.destroy();
  }
  if (renderer.value) {
    renderer.value.dispose();
  }
});
</script>

<style scoped>
.model-container {
  position: relative;
  width: 100%;
  height: 100vh;
}

.three-container {
  width: 100%;
  height: 100%;
}

.controls {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #0056b3;
}
</style>
`;

/**
 * 示例4: 自定义效果配置
 */
export async function customConfigExample() {
  console.log('📖 示例4: 自定义效果配置');
  
  // 注意：要自定义配置，需要修改 modelLoader.js 中的配置
  // 或者创建独立的 ModelEffects 实例
  
  console.log(`
要自定义效果配置，可以修改 modelLoader.js 中的配置：

const modelEffects = new ModelEffects(modelObj, {
  customerShaderConfig: {
    bottomColor: 'rgb(255,0,0)',      // 红色底部
    topColor: 'rgb(0,255,0)',         // 绿色顶部
    flowColor: 'rgb(0,0,255)',        // 蓝色流动效果
    topGradientDistance: 10,          // 更大的顶部渐变距离
    bottomGradientDistance: 30,       // 更小的底部渐变距离
    speed: 50,                        // 更快的动画速度
    wireframe: true                   // 显示线框
  }
});
`);
}

/**
 * 运行所有示例
 */
export async function runAllExamples() {
  console.log('🚀 开始运行所有示例...');
  
  // 注意：实际使用时需要有真实的模型文件
  console.log('⚠️  请确保有可用的模型文件路径');
  
  // await basicUsageExample();
  // await dynamicControlExample();
  // await customConfigExample();
  
  console.log('📖 Vue组件示例代码:');
  console.log(vueComponentExample);
}

// 如果直接运行此文件
if (import.meta.url === new URL(import.meta.resolve('./example-usage.js'))) {
  runAllExamples();
}