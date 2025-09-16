/**
 * WorkerDecoder 类 - 基于Web Worker的模型解码器
 * 最小最简洁的实现，支持worker检测和回退机制
 */
import FastDogDecoder from './wasmDecoder.js';
import { ModelDecoder } from './modelDecoder.js';

export class WorkerDecoder {
  constructor() {
    this.worker = null;
    this.fallbackDecoder = null;
    this.isWorkerSupported = false;
    this.isInitialized = false;
    this.pendingTasks = new Map();
    this.taskId = 0;
  }

  /**
   * 检测Worker支持
   */
  _checkWorkerSupport() {
    try {
      return typeof Worker !== 'undefined' && typeof window !== 'undefined';
    } catch (error) {
      return false;
    }
  }

  /**
   * 初始化解码器
   */
  async init() {
    if (this.isInitialized) return;

    this.isWorkerSupported = this._checkWorkerSupport();
    
    if (this.isWorkerSupported) {
      try {
        await this._initWorker();
        console.log('✅ Worker解码器初始化成功');
      } catch (error) {
        console.warn('⚠️ Worker初始化失败，回退到主线程解码:', error);
        this.isWorkerSupported = false;
        await this._initFallback();
      }
    } else {
      console.log('🔄 Worker不支持，使用主线程解码');
      await this._initFallback();
    }

    this.isInitialized = true;
  }

  /**
   * 初始化Worker
   */
  async _initWorker() {
    // 使用独立的Worker文件
    this.worker = new Worker('/src/workers/decoderWorker.js', { type: 'module' });
    
    // 等待Worker初始化完成
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Worker初始化超时')), 5000);
      
      this.worker.onmessage = (e) => {
        if (e.data.type === 'init') {
          clearTimeout(timeout);
          if (e.data.success) {
            resolve();
          } else {
            reject(new Error('Worker内部初始化失败'));
          }
        }
      };
      
      this.worker.onerror = (error) => {
        clearTimeout(timeout);
        reject(error);
      };
      
      this.worker.postMessage({ type: 'init' });
    });
    
    // 设置消息处理
    this.worker.onmessage = (e) => {
      const { type, taskId, result, error } = e.data;
      const task = this.pendingTasks.get(taskId);
      
      if (task) {
        this.pendingTasks.delete(taskId);
        
        if (type === 'decode' && result) {
          task.resolve(result);
        } else if (type === 'error') {
          task.reject(new Error(error));
        }
      }
    };
  }

  /**
   * 初始化回退解码器
   */
  async _initFallback() {
    this.fallbackDecoder = new ModelDecoder();
    await this.fallbackDecoder.initWASMDecoder();
  }

  /**
   * 获取WASM解码器 - 兼容接口
   */
  get wasmDecoder() {
    if (this.fallbackDecoder && this.fallbackDecoder.wasmDecoder) {
      return this.fallbackDecoder.wasmDecoder;
    }
    return null;
  }

  /**
   * 解码数据
   * @param {*} data - 要解码的数据
   * @param {string} uuid - 模型唯一标识
   * @param {boolean} useWasm - 是否使用WASM解码
   * @returns {Object} 解码结果 { data, decodeTime }
   */
  async decodeData(data, uuid, useWasm = false) {
    if (!this.isInitialized) {
      await this.init();
    }

    if (this.isWorkerSupported && this.worker) {
      return this._decodeWithWorker(data, uuid, useWasm);
    } else {
      return this.fallbackDecoder.decodeData(data, uuid, useWasm);
    }
  }

  /**
   * 使用Worker解码
   */
  async _decodeWithWorker(data, uuid, useWasm) {
    const taskId = ++this.taskId;
    
    return new Promise((resolve, reject) => {
      this.pendingTasks.set(taskId, { resolve, reject });
      
      // 设置超时
      const timeout = setTimeout(() => {
        this.pendingTasks.delete(taskId);
        reject(new Error('Worker解码超时'));
      }, 30000);
      
      const originalResolve = resolve;
      const originalReject = reject;
      
      this.pendingTasks.set(taskId, {
        resolve: (result) => {
          clearTimeout(timeout);
          originalResolve(result);
        },
        reject: (error) => {
          clearTimeout(timeout);
          originalReject(error);
        }
      });
      
      this.worker.postMessage({
        type: 'decode',
        taskId,
        data,
        uuid,
        useWasm
      });
    });
  }

  /**
   * 清理资源
   */
  cleanup() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    if (this.fallbackDecoder) {
      this.fallbackDecoder.cleanup();
    }
    
    this.pendingTasks.clear();
  }

  /**
   * 销毁解码器
   */
  dispose() {
    this.cleanup();
    this.isInitialized = false;
  }

  /**
   * 获取解码器状态
   */
  getStatus() {
    return {
      isWorkerSupported: this.isWorkerSupported,
      isInitialized: this.isInitialized,
      usingWorker: this.isWorkerSupported && this.worker !== null,
      pendingTasks: this.pendingTasks.size
    };
  }
}

// 导出单例实例
export default new WorkerDecoder();