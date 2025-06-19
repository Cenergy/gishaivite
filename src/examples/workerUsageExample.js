/**
 * Worker 管理器使用示例
 * 展示如何使用新的 Worker 管理架构来处理不同类型的任务
 */

import { getGeoWorkerManager } from '@/utils/GeoWorkerManager'
import { getModelWorkerManager } from '@/utils/ModelWorkerManager'
import { getWorkerFactory } from '@/utils/WorkerManager'

/**
 * 地理数据处理示例
 */
export async function geoDataExample() {
  console.log('=== 地理数据处理示例 ===')
  
  try {
    // 获取地理数据 Worker 管理器
    const geoWorker = getGeoWorkerManager()
    
    // 示例 GeoJSON 数据
    const geoData = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: { name: 'Point 1' },
          geometry: {
            type: 'Point',
            coordinates: [120.0, 30.0]
          }
        },
        {
          type: 'Feature',
          properties: { name: 'Point 2' },
          geometry: {
            type: 'Point',
            coordinates: [121.0, 31.0]
          }
        }
      ]
    }
    
    // 处理地理数据
    const result = await geoWorker.processGeoJSON(geoData, {
      simplify: true,
      tolerance: 0.001
    }, (progress) => {
      console.log(`地理数据处理进度: ${progress.progress}% - ${progress.message}`)
    })
    
    console.log('地理数据处理结果:', result)
    
    // 聚类点数据
    const points = geoData.features.map(f => f.geometry.coordinates)
    const clusters = await geoWorker.clusterPoints(points, 0.01, (progress) => {
      console.log(`点聚类进度: ${progress.progress}% - ${progress.message}`)
    })
    
    console.log('点聚类结果:', clusters)
    
  } catch (error) {
    console.error('地理数据处理错误:', error)
  }
}

/**
 * 模型处理示例
 */
export async function modelProcessingExample() {
  console.log('=== 模型处理示例 ===')
  
  try {
    // 获取模型 Worker 管理器
    const modelWorker = getModelWorkerManager()
    
    // 模拟模型 URL（实际使用时替换为真实的模型文件）
    const modelUrl = 'https://example.com/model.json'
    
    // 加载模型
    console.log('开始加载模型...')
    const loadedModel = await modelWorker.loadModel(modelUrl, {
      format: 'json',
      timeout: 30000
    }, (progress) => {
      console.log(`模型加载进度: ${progress.progress}% - ${progress.message}`)
    })
    
    console.log('模型加载完成:', loadedModel.metadata)
    
    // 预处理模型
    const preprocessedModel = await modelWorker.preprocessModel(loadedModel.modelData, {
      normalize: true,
      quantize: false,
      optimize: true
    }, (progress) => {
      console.log(`模型预处理进度: ${progress.progress}% - ${progress.message}`)
    })
    
    console.log('模型预处理完成:', preprocessedModel.preprocessing)
    
    // 运行推理
    const inputData = {
      features: Array.from({ length: 10 }, () => Math.random())
    }
    
    const inferenceResult = await modelWorker.runInference(inputData, {
      batchSize: 1,
      precision: 'float32'
    }, (progress) => {
      console.log(`模型推理进度: ${progress.progress}% - ${progress.message}`)
    })
    
    console.log('推理结果:', inferenceResult.predictions)
    
    // 批量处理
    const batchData = Array.from({ length: 50 }, (_, i) => ({ id: i, value: Math.random() }))
    
    const batchResult = await modelWorker.batchProcess(batchData, {
      chunkSize: 10
    }, (progress) => {
      console.log(`批量处理进度: ${progress.progress}% - ${progress.message}`)
    })
    
    console.log('批量处理完成:', batchResult.metadata)
    
    // 获取模型信息
    const modelInfo = await modelWorker.getModelInfo(preprocessedModel)
    console.log('模型信息:', modelInfo)
    
  } catch (error) {
    console.error('模型处理错误:', error)
  }
}

/**
 * 多 Worker 并行处理示例
 */
export async function parallelProcessingExample() {
  console.log('=== 多 Worker 并行处理示例 ===')
  
  try {
    // 获取 Worker 工厂
    const factory = getWorkerFactory()
    
    // 同时使用多个 Worker
    const geoWorker = getGeoWorkerManager()
    const modelWorker = getModelWorkerManager()
    
    // 准备数据
    const geoData = {
      type: 'FeatureCollection',
      features: Array.from({ length: 100 }, (_, i) => ({
        type: 'Feature',
        properties: { id: i },
        geometry: {
          type: 'Point',
          coordinates: [120 + Math.random(), 30 + Math.random()]
        }
      }))
    }
    
    const modelData = {
      type: 'neural_network',
      layers: 5,
      parameters: 1000000
    }
    
    // 并行执行任务
    console.log('开始并行处理...')
    const startTime = performance.now()
    
    const [geoResult, modelResult] = await Promise.all([
      geoWorker.processGeoJSON(geoData, { simplify: true }),
      modelWorker.getModelInfo(modelData)
    ])
    
    const endTime = performance.now()
    
    console.log('并行处理完成，耗时:', endTime - startTime, 'ms')
    console.log('地理数据处理结果特征数:', geoResult.features.length)
    console.log('模型信息:', modelResult.type, modelResult.parameters, '参数')
    
    // 获取所有 Worker 状态
    const allStatus = factory.getAllStatus()
    console.log('所有 Worker 状态:', allStatus)
    
  } catch (error) {
    console.error('并行处理错误:', error)
  }
}

/**
 * Worker 生命周期管理示例
 */
export async function workerLifecycleExample() {
  console.log('=== Worker 生命周期管理示例 ===')
  
  try {
    const factory = getWorkerFactory()
    
    // 检查初始状态
    console.log('初始状态:', factory.getAllStatus())
    
    // 创建 Worker
    const geoWorker = getGeoWorkerManager()
    const modelWorker = getModelWorkerManager()
    
    // 等待 Worker 就绪
    await Promise.all([
      geoWorker.waitForReady(),
      modelWorker.waitForReady()
    ])
    
    console.log('所有 Worker 已就绪:', factory.getAllStatus())
    
    // 执行一些任务
    await geoWorker.calculateBounds({
      type: 'Point',
      coordinates: [120, 30]
    })
    
    await modelWorker.getModelInfo({ type: 'test' })
    
    console.log('任务执行后状态:', factory.getAllStatus())
    
    // 销毁特定 Worker
    factory.destroyManager('geo')
    console.log('销毁地理 Worker 后:', factory.getAllStatus())
    
    // 销毁所有 Worker
    factory.destroyAll()
    console.log('销毁所有 Worker 后:', factory.getAllStatus())
    
  } catch (error) {
    console.error('生命周期管理错误:', error)
  }
}

/**
 * 运行所有示例
 */
export async function runAllExamples() {
  console.log('开始运行 Worker 管理器示例...')
  
  try {
    await geoDataExample()
    console.log('\n')
    
    await modelProcessingExample()
    console.log('\n')
    
    await parallelProcessingExample()
    console.log('\n')
    
    await workerLifecycleExample()
    
    console.log('所有示例运行完成！')
  } catch (error) {
    console.error('示例运行错误:', error)
  }
}

// 如果直接运行此文件，执行所有示例
if (typeof window !== 'undefined' && window.location.hash === '#run-worker-examples') {
  runAllExamples()
}