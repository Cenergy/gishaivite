// 导入解码器实例供SmartDecoder使用
import modelDecoder from "./modelDecoder.js";
import workerDecoder from "./workerDecoder.js";

/**
 * 智能解码器选择器
 * 自动选择最佳的解码器：Worker > ModelDecoder
 */
export class SmartDecoder {
  constructor() {
    this.decoder = null;
    this.fallbackDecoder = null;
    this.isInitialized = false;
  }

  /**
   * 初始化智能解码器
   */
  async init() {
    console.log('🧠 SmartDecoder: 开始初始化...');
    
    try {
      // 优先尝试使用 Worker 解码器
      console.log('🧠 SmartDecoder: 尝试初始化 Worker 解码器...');
      await workerDecoder.init();
      this.decoder = workerDecoder;
      this.fallbackDecoder = modelDecoder;
      // 确保fallbackDecoder也初始化了WASM
      if (!this.fallbackDecoder.wasmDecoder) {
        await this.fallbackDecoder.initWASMDecoder();
      }
      this.isInitialized = true;
      console.log('✅ SmartDecoder: Worker 解码器初始化成功');
    } catch (error) {
      console.warn('⚠️ SmartDecoder: Worker 解码器初始化失败，回退到主线程解码器:', error);
      // 回退到主线程解码器
      try {
        await modelDecoder.initWASMDecoder();
        this.decoder = modelDecoder;
        this.fallbackDecoder = null;
        this.isInitialized = true;
        console.log('✅ SmartDecoder: 主线程解码器初始化成功');
      } catch (fallbackError) {
        console.error('❌ SmartDecoder: 所有解码器初始化失败:', fallbackError);
        this.isInitialized = false;
        throw new Error('SmartDecoder初始化失败: 所有解码器都不可用');
      }
    }

    console.log('🧠 SmartDecoder: 初始化完成');
  }

  /**
   * 初始化WASM解码器 - 兼容ModelDecoder接口
   */
  async initWASMDecoder() {
    // 兼容 ModelDecoder 接口
    if (!this.isInitialized) {
      await this.init();
    }
    
    // 确保 ModelDecoder 的 WASM 解码器已初始化
    if (this.decoder && this.decoder.initWASMDecoder) {
      await this.decoder.initWASMDecoder();
    }
  }

  /**
   * 获取WASM解码器 - 兼容ModelDecoder接口
   */
  get wasmDecoder() {
    if (!this.isInitialized) {
      console.warn('⚠️ SmartDecoder未初始化，无法获取wasmDecoder');
      return null;
    }
    
    if (this.decoder && this.decoder.wasmDecoder) {
      return this.decoder.wasmDecoder;
    }
    
    // 如果当前解码器没有wasmDecoder，尝试使用fallbackDecoder
    if (this.fallbackDecoder && this.fallbackDecoder.wasmDecoder) {
      console.log('🔄 使用fallbackDecoder的wasmDecoder');
      return this.fallbackDecoder.wasmDecoder;
    }
    
    console.warn('⚠️ 无法获取wasmDecoder，所有解码器都不可用');
    return null;
  }

  /**
   * 解码数据
   */
  async decodeData(data, uuid, useWasm = false) {
    if (!this.isInitialized) {
      await this.init();
    }
    return this.decoder.decodeData(data, uuid, useWasm);
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.decoder && this.decoder.cleanup) {
      this.decoder.cleanup();
    }
  }

  /**
   * 获取当前使用的解码器类型
   */
  getDecoderType() {
    if (!this.decoder) return 'none';
    return this.decoder.constructor.name === 'WorkerDecoder' ? 'worker' : 'main';
  }
}

// 导出智能解码器单例
export const smartDecoder = new SmartDecoder();
export default smartDecoder;