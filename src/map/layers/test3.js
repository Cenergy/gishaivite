import BaseLayer from "./baseLayer";

class TestLayer extends BaseLayer {
  constructor(options) {
    super(options);
  }

  /**
   * 获取数据 - 实现基类的抽象方法
   * @param {AbortSignal} signal 取消信号
   * @param {Object} options 选项参数
   * @returns {Promise<Object>} 数据
   */
  async fetchData(signal, options) {
    console.log('TestLayer: Fetching data...');
    
    // 模拟多个API请求
    const requests = [
      this.fetchUserData(signal),
      this.fetchMapData(signal),
      this.fetchLayerConfig(signal)
    ];
    
    const results = await Promise.all(requests);
    
    return {
      userData: results[0],
      mapData: results[1],
      config: results[2],
      timestamp: Date.now()
    };
  }

  /**
   * 执行渲染 - 实现基类的抽象方法
   * @param {Object} data 要渲染的数据
   * @param {AbortSignal} signal 取消信号
   * @param {Object} options 选项参数
   * @returns {Promise<Object>} 渲染结果
   */
  async executeRendering(data, signal, options) {
    console.log('TestLayer: Executing rendering...');
    return await this.executeRenderingStages(data, signal);
  }

  /**
   * 执行渲染的各个阶段
   * @param {Object} data 数据
   * @param {AbortSignal} signal 取消信号
   * @returns {Promise<Object>} 渲染结果
   */
  async executeRenderingStages(data, signal) {
    const stages = [
      { name: 'Preprocessing data', duration: 800 },
      { name: 'Creating geometries', duration: 1200 },
      { name: 'Applying materials', duration: 1000 },
      { name: 'Building scene graph', duration: 600 },
      { name: 'Final optimization', duration: 400 }
    ];
    
    const results = [];
    
    for (let i = 0; i < stages.length; i++) {
      const stage = stages[i];
      
      // 检查取消状态
      if (signal.aborted || this.currentOperation !== 'show') {
        throw new DOMException('Rendering aborted', 'AbortError');
      }
      
      console.log(`Rendering stage ${i + 1}/${stages.length}: ${stage.name}`);
      
      // 模拟阶段处理
      await this.simulateStageWork(stage.duration, signal);
      
      results.push({
        stage: stage.name,
        completed: true,
        timestamp: Date.now()
      });
    }
    
    return {
      success: true,
      stages: results,
      totalDuration: stages.reduce((sum, stage) => sum + stage.duration, 0),
      data: data
    };
  }

  /**
   * 模拟阶段工作
   * @param {number} duration 持续时间
   * @param {AbortSignal} signal 取消信号
   */
  async simulateStageWork(duration, signal) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, duration);
      
      // 监听取消信号
      const abortHandler = () => {
        clearTimeout(timeout);
        reject(new DOMException('Stage work aborted', 'AbortError'));
      };
      
      signal.addEventListener('abort', abortHandler);
      
      // 清理监听器
      setTimeout(() => {
        signal.removeEventListener('abort', abortHandler);
      }, duration + 100);
    });
  }



  /**
   * 模拟获取用户数据
   */
  async fetchUserData(signal) {
    await this.simulateStageWork(500, signal);
    return { userId: 123, preferences: { theme: 'dark' } };
  }

  /**
   * 模拟获取地图数据
   */
  async fetchMapData(signal) {
    await this.simulateStageWork(800, signal);
    return { bounds: [0, 0, 100, 100], features: [] };
  }

  /**
   * 模拟获取图层配置
   */
  async fetchLayerConfig(signal) {
    await this.simulateStageWork(300, signal);
    return { style: 'default', opacity: 0.8 };
  }

  /**
   * 清理已渲染的内容 - 重写基类方法
   */
  clearRenderedContent() {
    console.log('TestLayer: Clearing rendered content');
    // 实现具体的内容清理逻辑
  }
}

const layer = new TestLayer();
export default layer;
