import BaseLayer from "./baseLayer";

class TestLayer extends BaseLayer {
  constructor(options) {
    super(options);
    this.isRendering = false;
    this.renderAbortController = null;
  }

  async show() {
    console.log("🚀 ~ TestLayer ~ show ~ show:");
    
    // 如果正在渲染，先取消当前渲染
    if (this.isRendering) {
      console.log('Cancelling current rendering...');
      this.cancelRendering();
    }
    
    this.isRendering = true;
    this.renderAbortController = new AbortController();
    
    try {
      // 使用BaseLayer的safeRequest方法处理耗时渲染
      const result = await this.safeRequest(async (signal) => {
        return await this.performHeavyRendering(signal);
      }, `${this.id}_render`);
      
      // 如果渲染被取消，result会是null
      if (result !== null) {
        console.log('Rendering completed successfully:', result);
        this.onRenderComplete(result);
      } else {
        console.log('Rendering was cancelled');
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Rendering was aborted');
      } else {
        console.error('Rendering failed:', error);
        this.onRenderError(error);
      }
    } finally {
      this.isRendering = false;
      this.renderAbortController = null;
    }
  }

  hide() {
    console.log("🚀 ~ TestLayer ~ hide ~ hide:");
    
    // 取消正在进行的渲染
    this.cancelRendering();
    
    // 清理已渲染的内容
    this.clearRenderedContent();
  }

  /**
   * 取消当前渲染操作
   */
  cancelRendering() {
    if (this.isRendering && this.renderAbortController) {
      // 使用BaseLayer的cancelRequest方法
      this.cancelRequest(`${this.id}_render`);
      
      // 也可以直接abort
      this.renderAbortController.abort();
      
      console.log('Rendering cancelled');
    }
  }

  /**
   * 执行耗时的渲染操作
   * @param {AbortSignal} signal - 用于取消操作的信号
   * @returns {Promise} 渲染结果
   */
  async performHeavyRendering(signal) {
    console.log('Starting heavy rendering...');
    
    // 模拟分阶段的耗时渲染
    const stages = ['Loading data', 'Processing geometry', 'Applying styles', 'Finalizing render'];
    
    for (let i = 0; i < stages.length; i++) {
      // 检查是否被取消
      if (signal.aborted) {
        throw new DOMException('Rendering aborted', 'AbortError');
      }
      
      console.log(`Stage ${i + 1}: ${stages[i]}`);
      
      // 模拟每个阶段的耗时操作
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, 1000); // 每个阶段1秒
        
        // 监听取消信号
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new DOMException('Rendering aborted', 'AbortError'));
        });
      });
    }
    
    return {
      success: true,
      stages: stages.length,
      timestamp: Date.now()
    };
  }

  /**
   * 渲染完成回调
   * @param {Object} result 渲染结果
   */
  onRenderComplete(result) {
    console.log('Render complete callback:', result);
    // 在这里处理渲染完成后的逻辑
  }

  /**
   * 渲染错误回调
   * @param {Error} error 错误信息
   */
  onRenderError(error) {
    console.error('Render error callback:', error);
    // 在这里处理渲染错误的逻辑
  }

  /**
   * 清理已渲染的内容
   */
  clearRenderedContent() {
    console.log('Clearing rendered content');
    // 在这里实现清理渲染内容的逻辑
  }

  /**
   * 销毁图层时的清理工作
   */
  destroy() {
    console.log('Destroying TestLayer');
    
    // 取消正在进行的渲染
    this.cancelRendering();
    
    // 清理渲染内容
    this.clearRenderedContent();
    
    // 调用父类的destroy方法
    super.destroy();
  }
}

const layer = new TestLayer();
export default layer;
