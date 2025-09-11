/**
 * 测试模型效果集成
 * 这个文件用于测试ModelLoader和ModelEffects的集成
 */

import { ModelHandle } from './modelLoader.js';

/**
 * 测试模型加载和效果应用
 */
export async function testModelEffects() {
  try {
    console.log('🧪 开始测试模型效果集成...');
    
    // 创建模型加载器实例
    const modelLoader = new ModelHandle();
    
    // 初始化加载器
    await modelLoader.initialize();
    
    // 模拟模型数据
    const mockModel = {
      model_file_url: './models/test-model.glb' // 替换为实际的模型URL
    };
    
    // 加载模型
    const result = await modelLoader.loadOriginModel(mockModel);
    
    if (result && result.effects) {
      console.log('✅ 模型加载成功，效果已应用');
      console.log('📊 模型信息:', {
        hasModel: !!result.model,
        hasGeometry: !!result.geometry,
        hasAnimations: result.animations?.length > 0,
        hasEffects: !!result.effects
      });
      
      // 测试效果控制
      setTimeout(() => {
        console.log('🔄 测试效果控制...');
        
        // 关闭Bloom效果
        result.effects.setBloom(false);
        console.log('❌ Bloom效果已关闭');
        
        // 重新开启Bloom效果
        setTimeout(() => {
          result.effects.setBloom(true);
          console.log('✅ Bloom效果已重新开启');
        }, 2000);
        
      }, 3000);
      
      return result;
    } else {
      console.error('❌ 模型加载失败或效果未应用');
      return null;
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
    return null;
  }
}

/**
 * 使用示例
 */
export function exampleUsage() {
  console.log(`
📖 使用示例:

// 1. 导入模型加载器
import { ModelHandle } from './handles/model/modelLoader.js';

// 2. 创建加载器实例
const modelLoader = new ModelHandle();

// 3. 初始化
await modelLoader.initialize();

// 4. 加载模型（现在会自动应用效果）
const result = await modelLoader.loadOriginModel({
  model_file_url: 'path/to/your/model.glb'
});

// 5. 控制效果
if (result.effects) {
  // 设置Bloom效果
  result.effects.setBloom(true);
  
  // 启动垂直流动动画
  result.effects.shaderAnimation('verticalFlow');
  
  // 停止动画
  result.effects.stopShaderAnimation();
  
  // 销毁效果管理器
  result.effects.destroy();
}
`);
}

// 如果直接运行此文件，执行测试
if (import.meta.url === new URL(import.meta.resolve('./test-effects.js'))) {
  testModelEffects();
  exampleUsage();
}