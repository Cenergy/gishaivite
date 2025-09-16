/**
 * WorkerDecoder 使用示例
 * 展示如何使用最小最简洁的worker解码器
 */

// 导入解码器
import { smartDecoder, workerDecoder, modelDecoder } from './index.js';

/**
 * 示例1: 使用智能解码器（推荐）
 * 自动选择最佳解码器
 */
export async function exampleSmartDecoder() {
  try {
    console.log('=== 智能解码器示例 ===');
    
    // 自动初始化并选择最佳解码器
    await smartDecoder.init();
    
    console.log('当前使用的解码器类型:', smartDecoder.getDecoderType());
    
    // 模拟解码数据
    const testData = new Uint8Array([1, 2, 3, 4, 5]);
    const uuid = 'test-model-001';
    
    // 不使用WASM解码
    const result1 = await smartDecoder.decodeData(testData, uuid, false);
    console.log('普通解码结果:', result1);
    
    // 使用WASM解码
    const result2 = await smartDecoder.decodeData(testData, uuid, true);
    console.log('WASM解码结果:', result2);
    
  } catch (error) {
    console.error('智能解码器示例失败:', error);
  }
}

/**
 * 示例2: 直接使用Worker解码器
 * 手动控制Worker解码器
 */
export async function exampleWorkerDecoder() {
  try {
    console.log('=== Worker解码器示例 ===');
    
    // 初始化Worker解码器
    await workerDecoder.init();
    
    // 检查状态
    const status = workerDecoder.getStatus();
    console.log('Worker状态:', status);
    
    if (status.usingWorker) {
      console.log('✅ Worker解码器可用');
      
      // 模拟解码数据
      const testData = new Uint8Array([10, 20, 30, 40, 50]);
      const uuid = 'worker-test-001';
      
      const startTime = performance.now();
      const result = await workerDecoder.decodeData(testData, uuid, true);
      const endTime = performance.now();
      
      console.log('Worker解码结果:', result);
      console.log('解码耗时:', endTime - startTime, 'ms');
    } else {
      console.log('⚠️ Worker不可用，使用回退解码器');
    }
    
  } catch (error) {
    console.error('Worker解码器示例失败:', error);
  }
}

/**
 * 示例3: 性能对比测试
 * 比较Worker解码器和普通解码器的性能
 */
export async function examplePerformanceComparison() {
  try {
    console.log('=== 性能对比测试 ===');
    
    // 准备测试数据
    const testData = new Uint8Array(1024 * 1024); // 1MB数据
    for (let i = 0; i < testData.length; i++) {
      testData[i] = i % 256;
    }
    const uuid = 'perf-test-001';
    
    // 初始化解码器
    await workerDecoder.init();
    await modelDecoder.initWASMDecoder();
    
    // 测试Worker解码器
    console.log('测试Worker解码器...');
    const workerStartTime = performance.now();
    const workerResult = await workerDecoder.decodeData(testData, uuid, true);
    const workerEndTime = performance.now();
    const workerTime = workerEndTime - workerStartTime;
    
    // 测试普通解码器
    console.log('测试普通解码器...');
    const normalStartTime = performance.now();
    const normalResult = await modelDecoder.decodeData(testData, uuid, true);
    const normalEndTime = performance.now();
    const normalTime = normalEndTime - normalStartTime;
    
    // 输出对比结果
    console.log('\n=== 性能对比结果 ===');
    console.log('Worker解码器耗时:', workerTime.toFixed(2), 'ms');
    console.log('普通解码器耗时:', normalTime.toFixed(2), 'ms');
    console.log('性能提升:', ((normalTime - workerTime) / normalTime * 100).toFixed(2), '%');
    
    // 验证结果一致性
    const isResultSame = JSON.stringify(workerResult) === JSON.stringify(normalResult);
    console.log('结果一致性:', isResultSame ? '✅ 一致' : '❌ 不一致');
    
  } catch (error) {
    console.error('性能对比测试失败:', error);
  }
}

/**
 * 示例4: 批量解码测试
 * 测试并发解码能力
 */
export async function exampleBatchDecoding() {
  try {
    console.log('=== 批量解码测试 ===');
    
    await smartDecoder.init();
    
    // 准备多个测试数据
    const testCases = [];
    for (let i = 0; i < 5; i++) {
      const data = new Uint8Array(1024 * (i + 1)); // 不同大小的数据
      data.fill(i + 1);
      testCases.push({
        data,
        uuid: `batch-test-${i + 1}`,
        useWasm: i % 2 === 0 // 交替使用WASM
      });
    }
    
    console.log('开始批量解码...');
    const startTime = performance.now();
    
    // 并发解码
    const promises = testCases.map(async (testCase, index) => {
      try {
        const result = await smartDecoder.decodeData(
          testCase.data, 
          testCase.uuid, 
          testCase.useWasm
        );
        console.log(`任务${index + 1}完成:`, {
          uuid: testCase.uuid,
          useWasm: testCase.useWasm,
          decodeTime: result.decodeTime
        });
        return result;
      } catch (error) {
        console.error(`任务${index + 1}失败:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(promises);
    const endTime = performance.now();
    
    console.log('\n=== 批量解码结果 ===');
    console.log('总耗时:', (endTime - startTime).toFixed(2), 'ms');
    console.log('成功任务数:', results.filter(r => r !== null).length);
    console.log('失败任务数:', results.filter(r => r === null).length);
    
  } catch (error) {
    console.error('批量解码测试失败:', error);
  }
}

/**
 * 运行所有示例
 */
export async function runAllExamples() {
  console.log('🚀 开始运行WorkerDecoder示例...');
  
  await exampleSmartDecoder();
  console.log('\n');
  
  await exampleWorkerDecoder();
  console.log('\n');
  
  await examplePerformanceComparison();
  console.log('\n');
  
  await exampleBatchDecoding();
  
  console.log('\n✅ 所有示例运行完成');
}

// 如果直接运行此文件
if (typeof window !== 'undefined') {
  window.WorkerDecoderExamples = {
    runAllExamples,
    exampleSmartDecoder,
    exampleWorkerDecoder,
    examplePerformanceComparison,
    exampleBatchDecoding
  };
}