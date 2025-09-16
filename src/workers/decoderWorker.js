/**
 * 模型解码Worker
 * 独立的Worker文件，用于后台解码模型数据
 */

// Worker内部状态
let wasmDecoder = null;
let isInitialized = false;

// 动态导入WASM解码器
async function initDecoder() {
  if (isInitialized) return true;
  
  try {
    // 使用相对于项目根目录的路径
    const wasmModule = await import('../handles/model/decoders/wasmDecoder.js');
    const FastDogDecoder = wasmModule.default;
    
    wasmDecoder = new FastDogDecoder();
    await wasmDecoder.init();
    isInitialized = true;
    
    console.log('✅ Worker中WASM解码器初始化成功');
    return true;
  } catch (error) {
    console.error('❌ Worker中WASM解码器初始化失败:', error);
    return false;
  }
}

// 解码数据
async function decodeData(data, uuid, useWasm = false) {
  if (!useWasm) {
    // 不使用WASM，直接返回原始数据
    return { data, decodeTime: 0 };
  }
  
  if (!isInitialized || !wasmDecoder) {
    throw new Error('WASM解码器未初始化');
  }
  
  const decodeStartTime = Date.now();
  const decodeResult = await wasmDecoder.decode(data, false, { modelId: uuid, uuid });
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

// 消息处理
self.onmessage = async function(e) {
  const { type, taskId, data, uuid, useWasm } = e.data;
  
  try {
    switch (type) {
      case 'init':
        const success = await initDecoder();
        self.postMessage({ type: 'init', taskId, success });
        break;
        
      case 'decode':
        const result = await decodeData(data, uuid, useWasm);
        self.postMessage({ type: 'decode', taskId, result });
        break;
        
      case 'cleanup':
        if (wasmDecoder && wasmDecoder.cleanup) {
          wasmDecoder.cleanup();
        }
        wasmDecoder = null;
        isInitialized = false;
        self.postMessage({ type: 'cleanup', taskId, success: true });
        break;
        
      default:
        throw new Error(`未知的消息类型: ${type}`);
    }
  } catch (error) {
    self.postMessage({ 
      type: 'error', 
      taskId, 
      error: error.message,
      stack: error.stack 
    });
  }
};

// Worker启动日志
console.log('🚀 模型解码Worker已启动');