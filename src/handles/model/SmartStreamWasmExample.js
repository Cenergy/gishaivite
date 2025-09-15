/**
 * 智能流式WASM示例
 * 演示如何使用智能流式WASM功能，自动根据文件大小判断是否分块
 */

import { modelLoader } from './modelLoader.js';

/**
 * 智能流式WASM使用示例
 */
export class SmartStreamWasmExample {
  constructor() {
    this.modelLoader = modelLoader;
  }

  /**
   * 示例1: 基础智能流式WASM加载
   */
  async basicSmartStreamExample() {
    console.log('🧠 示例1: 基础智能流式WASM加载');
    
    const model = {
      uuid: 'example-model-uuid',
      name: 'example-model.fastdog',
      model_file_url: 'https://example.com/models/example-model.fastdog'
    };

    try {
      const result = await this.modelLoader.loadModel(model, 'smart_stream_wasm', {
        // 使用默认配置：5MB阈值，5MB分块
        enableResume: true,
      });

      console.log('✅ 智能流式WASM加载成功:', result);
      return result;
    } catch (error) {
      console.error('❌ 智能流式WASM加载失败:', error);
      throw error;
    }
  }

  /**
   * 示例2: 自定义阈值和分块大小
   */
  async customConfigExample() {
    console.log('🧠 示例2: 自定义配置智能流式WASM');
    
    const model = {
      uuid: 'large-model-uuid',
      name: 'large-model.fastdog',
      model_file_url: 'https://example.com/models/large-model.fastdog'
    };

    try {
      const result = await this.modelLoader.loadModel(model, 'smart_stream_wasm', {
        smartChunkThreshold: 10485760, // 10MB阈值
        smartChunkSize: 2097152,       // 2MB分块大小
        enableResume: true,
      });

      console.log('✅ 自定义配置智能流式WASM加载成功:', result);
      return result;
    } catch (error) {
      console.error('❌ 自定义配置智能流式WASM加载失败:', error);
      throw error;
    }
  }

  /**
   * 示例3: 带进度监听的智能流式WASM
   */
  async progressMonitoringExample() {
    console.log('🧠 示例3: 带进度监听的智能流式WASM');
    
    const model = {
      uuid: 'progress-model-uuid',
      name: 'progress-model.fastdog',
      model_file_url: 'https://example.com/models/progress-model.fastdog'
    };

    // 监听状态机事件
    this.modelLoader.loadingStateMachine.on('progress', (context) => {
      console.log(`📊 进度更新: ${context.progress.toFixed(1)}% - ${context.message}`);
    });

    this.modelLoader.loadingStateMachine.on('stateChange', ({ from, to, context }) => {
      console.log(`🔄 状态变化: ${from} -> ${to}`);
      if (to === 'success') {
        console.log('🎉 加载完成!');
      } else if (to === 'error') {
        console.error('❌ 加载失败:', context.error);
      }
    });

    try {
      const result = await this.modelLoader.loadModel(model, 'smart_stream_wasm', {
        smartChunkThreshold: 3145728,  // 3MB阈值
        smartChunkSize: 1048576,       // 1MB分块大小
        enableResume: true,
      });

      console.log('✅ 带进度监听的智能流式WASM加载成功:', result);
      return result;
    } catch (error) {
      console.error('❌ 带进度监听的智能流式WASM加载失败:', error);
      throw error;
    }
  }

  /**
   * 示例4: 不同文件大小的智能决策演示
   */
  async intelligentDecisionDemo() {
    console.log('🧠 示例4: 智能决策演示');
    
    const models = [
      {
        uuid: 'small-model-uuid',
        name: 'small-model.fastdog',
        model_file_url: 'https://example.com/models/small-model.fastdog', // 假设2MB
        description: '小文件 (2MB) - 应该不分块'
      },
      {
        uuid: 'medium-model-uuid', 
        name: 'medium-model.fastdog',
        model_file_url: 'https://example.com/models/medium-model.fastdog', // 假设8MB
        description: '中等文件 (8MB) - 应该分块'
      },
      {
        uuid: 'large-model-uuid',
        name: 'large-model.fastdog', 
        model_file_url: 'https://example.com/models/large-model.fastdog', // 假设50MB
        description: '大文件 (50MB) - 应该分块'
      }
    ];

    const threshold = 5242880; // 5MB阈值
    const chunkSize = 5242880;  // 5MB分块

    for (const model of models) {
      console.log(`\n🔍 测试模型: ${model.description}`);
      
      try {
        // 先获取文件信息
        const fileInfo = await this.modelLoader.downloader.getFileInfo(model);
        const fileSize = fileInfo.size;
        const shouldChunk = fileSize > threshold;
        
        console.log(`📊 文件大小: ${this.modelLoader.downloader.formatBytes(fileSize)}`);
        console.log(`🧠 智能决策: ${shouldChunk ? '分块下载' : '整体下载'}`);
        
        const result = await this.modelLoader.loadModel(model, 'smart_stream_wasm', {
          smartChunkThreshold: threshold,
          smartChunkSize: chunkSize,
          enableResume: true,
        });

        console.log(`✅ ${model.name} 加载成功`);
        console.log(`📈 性能统计:`, result.performanceStats);
        
      } catch (error) {
        console.error(`❌ ${model.name} 加载失败:`, error);
      }
    }
  }

  /**
   * 示例5: 与其他加载方式的性能对比
   */
  async performanceComparisonExample() {
    console.log('🧠 示例5: 性能对比测试');
    
    const model = {
      uuid: 'comparison-model-uuid',
      name: 'comparison-model.fastdog',
      model_file_url: 'https://example.com/models/comparison-model.fastdog'
    };

    const loadMethods = [
      { method: 'realtime_wasm', name: '实时流式WASM' },
      { method: 'smart_stream_wasm', name: '智能流式WASM' },
    ];

    const results = {};

    for (const { method, name } of loadMethods) {
      console.log(`\n🚀 测试 ${name} (${method})`);
      
      try {
        const startTime = Date.now();
        
        const result = await this.modelLoader.loadModel(model, method, {
          chunkSize: method === 'realtime_wasm' ? 5242880 : undefined,
          smartChunkThreshold: method === 'smart_stream_wasm' ? 5242880 : undefined,
          smartChunkSize: method === 'smart_stream_wasm' ? 5242880 : undefined,
          enableResume: true,
        });
        
        const endTime = Date.now();
        const totalTime = endTime - startTime;
        
        results[method] = {
          totalTime,
          performanceStats: result.performanceStats,
          success: true
        };
        
        console.log(`✅ ${name} 完成，耗时: ${totalTime}ms`);
        
      } catch (error) {
        console.error(`❌ ${name} 失败:`, error);
        results[method] = {
          error: error.message,
          success: false
        };
      }
    }

    console.log('\n📊 性能对比结果:');
    console.table(results);
    
    return results;
  }
}

/**
 * 运行所有示例
 */
export async function runAllExamples() {
  console.log('🧠 开始运行智能流式WASM示例...');
  
  const example = new SmartStreamWasmExample();
  
  try {
    // 运行所有示例
    await example.basicSmartStreamExample();
    await example.customConfigExample();
    await example.progressMonitoringExample();
    await example.intelligentDecisionDemo();
    await example.performanceComparisonExample();
    
    console.log('🎉 所有智能流式WASM示例运行完成!');
  } catch (error) {
    console.error('❌ 示例运行失败:', error);
  }
}

// 如果直接运行此文件，则执行所有示例
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  runAllExamples();
}

export default SmartStreamWasmExample;