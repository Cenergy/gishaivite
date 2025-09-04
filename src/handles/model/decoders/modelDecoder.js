import FastDogDecoder from './wasmDecoder.js';

/**
 * ModelDecoder 类 - 负责处理所有模型解码逻辑
 * 从 AdvancedModelLoader 中提取的解码相关功能
 */
export class ModelDecoder {
  constructor() {
    this.wasmDecoder = null;
  }

  /**
   * 初始化 WASM 解码器
   */
  async initWASMDecoder() {
    try {
      if (!this.wasmDecoder) {
        this.wasmDecoder = new FastDogDecoder();
        await this.wasmDecoder.init();
        console.log('✅ WASM解码器初始化成功');
      }
    } catch (error) {
      console.error('❌ WASM解码器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 通用的解码方法
   * @param {*} data - 要解码的数据
   * @param {string} uuid - 模型唯一标识
   * @param {boolean} useWasm - 是否使用WASM解码
   * @returns {Object} 解码结果 { data, decodeTime }
   */
  async decodeData(data, uuid, useWasm = false) {
    if (!useWasm) {
      return { data, decodeTime: 0 };
    }

    if (!this.wasmDecoder) {
      throw new Error('WASM解码器未初始化，请先初始化WASM解码器');
    }

    const decodeStartTime = Date.now();
    const decodeResult = await this.wasmDecoder.decode(data, false, { modelId: uuid, uuid });
    const decodeTime = Date.now() - decodeStartTime;

    let parsedData = decodeResult.data;
    if (typeof decodeResult.data === 'string') {
      try {
        parsedData = JSON.parse(decodeResult.data);
      } catch (e) {
        console.warn('⚠️ 无法解析为JSON:', e);
      }
    }

    return { data: parsedData, decodeTime };
  }







  /**
   * 清理资源
   */
  cleanup() {
    if (this.wasmDecoder) {
      // 如果WASM解码器有清理方法，在这里调用
      this.wasmDecoder = null;
    }
  }

  /**
   * 销毁解码器
   */
  dispose() {
    this.cleanup();
  }
}

// 导出单例实例
export default new ModelDecoder();