import BaseLayer from "./baseLayer";

class TestLayer extends BaseLayer {
  constructor(options) {
    super(options);
  }
  
  async show() {
    console.log("🚀 ~ TestLayer ~ show ~ show:");
    
    try {
      // 使用BaseLayer的safeRequest方法处理耗时请求
      const data = await this.safeRequest(async (signal) => {
        // 模拟耗时的API请求
        const response = await fetch('/api/heavy-data', {
          signal // 传递AbortController的signal
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      }, 'showData'); // 使用'showData'作为请求标识符
      
      // 如果请求被取消，data会是null
      if (data !== null) {
        console.log('Data loaded successfully:', data);
        this.renderData(data);
      }
      
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  }
  
  hide() {
    console.log("🚀 ~ TestLayer ~ hide ~ hide:");
    
    // 取消show()方法中的请求
    this.cancelRequest('showData');
    
    // 清理UI状态
    this.clearData();
  }
  
  /**
   * 渲染数据到地图
   * @param {Object} data 要渲染的数据
   */
  renderData(data) {
    console.log('Rendering data to map:', data);
    // 在这里实现具体的地图渲染逻辑
  }
  
  /**
   * 清理地图数据
   */
  clearData() {
    console.log('Clearing map data');
    // 在这里实现具体的数据清理逻辑
  }
  
  /**
   * 销毁图层时的清理工作
   */
  destroy() {
    console.log('Destroying TestLayer');
    // 调用父类的destroy方法，会自动取消所有请求
    super.destroy();
  }
}

const layer = new TestLayer();
export default layer;
