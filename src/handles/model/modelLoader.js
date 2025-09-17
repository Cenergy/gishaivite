import downloader from './modelDownloader.js';
import {modelDecoder,workerDecoder,smartDecoder} from './decoders/index.js';
import modelBuilder from './modelBuilder.js';
import LoadingStateMachine from '@/utils/LoadingStateMachine.js';
import ModelEffects from './ModelEffects.js';

/**
 * 高级模型加载器类
 * 支持多种加载方式：直接加载、流式加载、WASM解码、实时流式WASM等
 */
export class ModelHandle {
  constructor() {
    this.wasmDecoder = null;
    // 使用Map存储每个模型的独立状态机，支持多模型并发加载
    this.modelStates = new Map();
    this.downloader = downloader;
    this.modelDecoder = smartDecoder;
    this.modelBuilder = modelBuilder;
  }

  /**
   * 获取或创建指定模型的状态机
   * 支持多模型并发加载，每个模型都有独立的加载状态
   * 
   * @param {string} modelId - 模型的唯一标识符（通常是uuid或id）
   * @returns {LoadingStateMachine} 模型对应的状态机实例
   */
  getOrCreateStateMachine(modelId) {
    if (!modelId) {
      throw new Error('模型ID不能为空');
    }
    
    if (!this.modelStates.has(modelId)) {
      this.modelStates.set(modelId, new LoadingStateMachine());
    }
    
    return this.modelStates.get(modelId);
  }

  /**
   * 清理指定模型的状态机
   * 在模型加载完成或失败后调用，释放内存
   * 
   * @param {string} modelId - 模型的唯一标识符
   */
  clearModelState(modelId) {
    if (this.modelStates.has(modelId)) {
      const stateMachine = this.modelStates.get(modelId);
      // 清理状态机的事件监听器
      stateMachine.listeners.clear();
      this.modelStates.delete(modelId);
    }
  }

  /**
   * 获取所有模型的加载状态
   * 用于调试和监控多模型加载情况
   * 
   * @returns {Object} 包含所有模型状态的对象
   */
  getAllModelStates() {
    const states = {};
    for (const [modelId, stateMachine] of this.modelStates) {
      states[modelId] = {
        currentState: stateMachine.currentState,
        progress: stateMachine.context.progress,
        message: stateMachine.context.message,
        isLoading: stateMachine.isLoading()
      };
    }
    return states;
  }

  /**
   * 初始化WASM解码器
   */
  async initWASMDecoder() {
    try {
      await this.modelDecoder.initWASMDecoder();
      // 保持向后兼容性
      this.wasmDecoder = this.modelDecoder.wasmDecoder;
      return true;
    } catch (error) {
      console.error('❌ WASM解码器初始化失败:', error);
      return false;
    }
  }

  /**
   * 初始化模型加载器
   */
  async initialize(authToken = null) {
    try {
      console.log('🚀 初始化模型加载器...');

      // 设置认证令牌
      if (authToken) {
        this.setAuthToken(authToken);
      }

      // 初始化WASM解码器
      await this.initWASMDecoder();

      console.log('✅ 模型加载器初始化完成');
      return true;
    } catch (error) {
      console.error('❌ 模型加载器初始化失败:', error);
      return false;
    }
  }

  /**
   * 设置认证令牌
   */
  setAuthToken(token) {
    this.downloader.setAuthToken(token);
  }

  /**
   * 通用的错误处理方法
   */
  _handleError(error, context = '加载', stateMachine = null) {
    console.error(`${context}失败:`, error);
    if (stateMachine) {
      stateMachine.error(error.message, `${context}失败`);
    } else {
      // 兼容旧代码，如果没有传入状态机，使用默认行为
      console.warn('_handleError: 未提供状态机实例，错误处理可能不完整');
    }
    throw error;
  }

  /**
   * 通用的性能统计和结果构建
   */
  _buildResult(model, geometry, startTime, downloadTime = 0, decodeTime = 0, animations = []) {
    const endTime = Date.now();
    return {
      model,
      geometry,
      animations,
      performanceStats: {
        totalTime: endTime - startTime,
        downloadTime,
        decodeTime,
      },
    };
  }

  /**
   * 加载策略映射
   */
  _getLoadingStrategies() {
    return {
      origin: (model) => this.loadOriginModel(model),
      stream: (model) => this.loadModelStream(model),
      wasm: (model) => this.loadModelWASM(model),
      stream_wasm: (model) => this.loadModelStreamWASM(model),
      stream_wasm_realtime: (model, options) =>
        this.loadModelStreamWASMRealtime({
          model,
          chunkSize: options.chunkSize,
          enableResume: options.enableResume,
        }),
      'realtime_wasm': (model, options) =>
        this.loadModelStreamWASMRealtime({
          model,
          chunkSize: options.chunkSize,
          enableResume: options.enableResume,
        }),
      'smart_stream_wasm': (model, options) =>
        this.loadModelSmartStreamWASM({
          model,
          smartChunkThreshold: options.smartChunkThreshold || 5242880, // 默认5MB
          smartChunkSize: options.smartChunkSize || 5242880, // 默认5MB
          enableResume: options.enableResume,
        }),
    };
  }

  /**
   * 统一的模型加载方法
   * 支持多模型并发加载，每个模型使用独立的状态机
   */
  async loadModel(model, loadMethod, options = {}) {
    console.log('🚀 ~ ModelHandle ~ loadModel ~ model:', model);
    const { chunkSize, enableResume, authToken } = options;
    
    // 获取模型ID，优先使用uuid，其次使用id，最后使用name
    const modelId = model.uuid || model.id || model.name;
    if (!modelId) {
      throw new Error('模型必须包含uuid、id或name字段作为唯一标识符');
    }

    // 设置认证令牌
    if (authToken) {
      this.setAuthToken(authToken);
    }

    // 获取加载策略
    const strategies = this._getLoadingStrategies();
    const strategy = strategies[loadMethod];

    if (!strategy) {
      throw new Error(`不支持的加载方式: ${loadMethod}`);
    }

    try {
      // 执行对应的加载策略
      const needsOptions = ['stream_wasm_realtime', 'realtime_wasm', 'smart_stream_wasm'].includes(loadMethod);
      let result;
      
      if (needsOptions) {
        // 为智能流式WASM传递完整的options
        if (loadMethod === 'smart_stream_wasm') {
          result = await strategy(model, options);
        } else {
          // 为其他需要options的方法传递特定参数
          result = await strategy(model, { chunkSize, enableResume });
        }
      } else {
        result = await strategy(model);
      }
      
      // 加载成功后清理状态机（可选，也可以保留用于后续操作）
      // this.clearModelState(modelId);
      
      return result;
    } catch (error) {
      // 加载失败时也清理状态机
      this.clearModelState(modelId);
      throw error;
    }
  }


  /**
   * 直接加载模型（不使用WASM）
   */

  async loadOriginModel(model) {
    if (!model || !model.model_file_url) {
      throw new Error('未找到模型或模型文件URL');
    }

    // 获取模型ID和对应的状态机
    const modelId = model.uuid || model.id || model.name;
    const loadingStateMachine = this.getOrCreateStateMachine(modelId);
    
    loadingStateMachine.reset();
    loadingStateMachine.startLoading('开始直接加载...');

    try {
      const url = model.model_file_url;
      const extension = url.split('.').pop()?.toLowerCase();
      const loader = this.modelBuilder._getFileLoader(extension);

      loadingStateMachine.startBuilding('正在解析模型...');

      return new Promise((resolve, reject) => {
        loader.load(
          url,
          (object) => {
            const modelObj = extension === 'gltf' || extension === 'glb' ? object.scene : object;
            const geometry = this.modelBuilder._extractGeometry(modelObj);

            loadingStateMachine.success(modelObj, '加载完成');

            // 创建模型效果管理器
            const modelEffects = new ModelEffects(modelObj, {
              customerShaderConfig: {
                bottomColor: 'rgb(123, 181, 243)',
                topColor: 'rgb(31, 110, 188)',
                flowColor: 'rgb(255,103,19)',
                topGradientDistance: 5,
                bottomGradientDistance: 50,
                speed: 100,
                wireframe: false
              }
            });
            
            // 应用效果
            modelEffects.setBloom(true);
            modelEffects.shaderAnimation('verticalFlow');

            resolve({
              model: modelObj,
              geometry,
              animations: object.animations || [],
              effects: modelEffects // 返回效果管理器实例
            });
          },
          (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            loadingStateMachine.emit('progress', {
              progress: percent,
              message: `加载中... ${percent.toFixed(1)}%`,
            });
          },
          (error) => {
            this._handleError(error, '原始模型加载', loadingStateMachine);
            reject(error);
          },
        );
      });
    } catch (error) {
      this._handleError(error, '原始模型加载');
    }
  }

  /**
   * 流式加载模型
   */
  async loadModelStream(model) {
    console.log('🌊 开始流式加载...');
    const { uuid } = model;
    const startTime = Date.now();

    // 获取模型ID和对应的状态机
    const modelId = model.uuid || model.id || model.name;
    const loadingStateMachine = this.getOrCreateStateMachine(modelId);
    
    loadingStateMachine.reset();
    loadingStateMachine.startLoading('🌊 流式加载: 开始下载...');

    try {
      // 使用下载器下载模型数据
      const downloadResult = await this.downloader.downloadModelStream(model, {
        onProgress: (progress) => {
          loadingStateMachine.emit('progress', {
            progress: progress.progress * 0.3, // 下载占30%
            message: '🌊 流式: 下载中...',
          });
        },
      });

      loadingStateMachine.emit('progress', {
        progress: 30,
        message: '🌊 流式: 下载完成，开始解码...',
      });

      const arrayBuffer = downloadResult.data;
      const downloadTime = downloadResult.downloadTime;

      // 检查数据格式，如果是FastDog格式则需要解码
      const magic = new TextDecoder().decode(new Uint8Array(arrayBuffer, 0, 8));
      const needsDecoding = magic.startsWith('FASTDOG');

      if (needsDecoding) {
        loadingStateMachine.emit('progress', {
          progress: 50,
          message: '🌊 流式: 检测到FastDog格式，使用解码器...',
        });
      }

      // 使用通用解码方法
      const { data: decodedData, decodeTime } = await this.modelDecoder.decodeData(
        arrayBuffer,
        uuid,
        needsDecoding,
      );

      loadingStateMachine.emit('progress', {
        progress: 80,
        message: '🌊 流式: 解码完成，构建模型...',
      });

      // 构建模型
      const modelResult = await this.modelBuilder.buildModelWithGLTFLoader(decodedData,model);
      const result = this._buildResult(
        modelResult.model,
        modelResult.geometry,
        startTime,
        downloadTime,
        decodeTime,
      );

      loadingStateMachine.success(result, '流式加载完成');
      return result;
    } catch (error) {
      this._handleError(error, '流式加载', loadingStateMachine);
    }
  }

  /**
   * WASM解码加载模型
   */
  async loadModelWASM(model) {
    console.log('🔧 开始WASM解码加载...');
    const { uuid } = model;
    const startTime = Date.now();

    // 获取模型ID和对应的状态机
    const modelId = model.uuid || model.id || model.name;
    const loadingStateMachine = this.getOrCreateStateMachine(modelId);
    
    loadingStateMachine.reset();
    loadingStateMachine.startLoading('🔧 WASM: 开始下载二进制数据...');

    try {
      // 使用下载器下载模型数据
      const downloadResult = await this.downloader.downloadModelStream(model, {
        onProgress: (progress) => {
          loadingStateMachine.emit('progress', {
            progress: progress.progress * 0.3, // 下载占30%
            message: '🔧 WASM: 下载中...',
          });
        },
      });

      loadingStateMachine.emit('progress', {
        progress: 30,
        message: 'WASM: 下载完成，开始解码...',
      });

      const binaryData = downloadResult.data;
      const downloadTime = downloadResult.downloadTime;

      loadingStateMachine.emit('progress', {
        progress: 50,
        message: 'WASM: 使用 WASM 解码中...',
      });

      // 使用通用解码方法
      const { data: parsedData, decodeTime } = await this.modelDecoder.decodeData(binaryData, uuid, true);

      loadingStateMachine.emit('progress', {
        progress: 80,
        message: 'WASM: 解码完成，构建模型...',
      });

      // 构建模型
      const modelResult = await this.modelBuilder.buildModelWithGLTFLoader(parsedData,model);
      const result = this._buildResult(
        modelResult.model,
        modelResult.geometry,
        startTime,
        downloadTime,
        decodeTime,
      );

      loadingStateMachine.success(result, 'WASM加载完成');
      return result;
    } catch (error) {
      this._handleError(error, 'WASM加载', loadingStateMachine);
    }
  }

  /**
   * 流式WASM加载模型
   */
  async loadModelStreamWASM(model) {
    console.log('🌊🔧 开始流式WASM加载...');
    return this.loadModelWASM(model);
  }

  /**
   * 实时流式WASM加载模型
   */
  async loadModelStreamWASMRealtime(options = {}) {
    console.log('⚡ 开始实时流式WASM加载...');

    if (!this.wasmDecoder) {
      throw new Error('WASM 解码器未初始化');
    }
    const { model = {} } = options;

    const { uuid, name } = model;
    if (!uuid) {
      throw new Error('无法获取模型UUID');
    }

    // 获取模型ID和对应的状态机
    const modelId = model.uuid || model.id || model.name;
    const loadingStateMachine = this.getOrCreateStateMachine(modelId);
    
    const {
      chunkSize = 0,
      enableResume = true,
      onProgress = () => {},
      onStreamInfo = () => {},
    } = options;

    // 使用状态机开始加载
    loadingStateMachine.reset();
    loadingStateMachine.startLoading('⚡ 开始实时流式WASM加载...');

    const startTime = Date.now();
    this.downloader.downloadState.downloadStartTime = startTime;
    this.downloader.downloadState.lastProgressTime = startTime;
    this.downloader.downloadState.lastDownloadedBytes = 0;
    this.downloader.downloadState.isPaused = false;
    this.downloader.downloadState.isCancelled = false;
    this.downloader.downloadState.controller = new AbortController();

    // 创建流式解码器实例
    const StreamDecoderClass = this.wasmDecoder.getStreamDecoder();
    if (!StreamDecoderClass) {
      const errorMsg = 'StreamDecoder 不可用，可能是因为使用了 JavaScript 备选模式';
      loadingStateMachine.error(errorMsg);
      throw new Error(errorMsg);
    }
    const streamDecoder = new StreamDecoderClass();

    try {
      loadingStateMachine.emit('progress', {
        progress: 5,
        message: '⚡ 实时流式WASM: 获取文件信息...',
      });

      // 转换到下载状态，使暂停按钮可用
      loadingStateMachine.startDownloading('⚡ 实时流式WASM: 开始下载...');

      // 使用 ModelDownloader 进行实时流式下载和解码
      const downloadResult = await this.downloader.downloadModelStreamRealtime(model, {
        chunkSize,
        enableResume,
        streamDecoder,
        onProgress: (
          progress,
          downloadedBytes,
          totalBytes,
          speed,
          remainingTime,
          decodeProgress,
        ) => {
          // 更新进度 - 下载进度占50%，解码进度占40%
          const downloadProgressPercent = (downloadedBytes / totalBytes) * 50;
          const decodeProgressPercent = decodeProgress * 40;
          const totalProgress = 10 + downloadProgressPercent + decodeProgressPercent;

          onProgress({
            progress: totalProgress,
            message: `⚡ 实时流式WASM: 下载 ${((downloadedBytes / totalBytes) * 100).toFixed(1)}%, 解码 ${(decodeProgress * 100).toFixed(1)}%`,
          });

          onStreamInfo(
            downloadedBytes,
            totalBytes,
            speed,
            remainingTime,
            decodeProgress,
            totalProgress,
          );

          loadingStateMachine.emit('progress', {
            progress: totalProgress,
            message: `⚡ 实时流式WASM: 下载 ${((downloadedBytes / totalBytes) * 100).toFixed(1)}%, 解码 ${(decodeProgress * 100).toFixed(1)}%`,
          });

          // 解码完成时切换状态
          if (decodeProgress >= 1.0) {
            loadingStateMachine.startBuilding('⚡ 实时流式WASM: 解码完成，构建模型...');
            loadingStateMachine.emit('progress', {
              progress: 90,
              message: '⚡ 实时流式WASM: 解码完成，构建模型...',
            });
          }
        },
      });

      // 解析数据
      let parsedData = downloadResult.decodeResult.data;
      if (typeof downloadResult.decodeResult.data === 'string') {
        try {
          parsedData = JSON.parse(downloadResult.decodeResult.data);
        } catch (e) {
          console.warn('⚠️ 无法解析为JSON:', e);
        }
      }

      // 构建模型
      const modelResult = await this.modelBuilder.buildModelWithGLTFLoader(
        parsedData || downloadResult.decodeResult.data,model
      );
      const totalTime = Date.now() - startTime;

      const stats = downloadResult.decodeResult.stats || {
        originalSize: downloadResult.totalBytes,
        compressedSize: downloadResult.totalBytes,
        compressionRatio: 1.0,
        wasmDecodeTime: totalTime * 0.4,
      };

      const result = {
        model: modelResult.model,
        geometry: modelResult.geometry,
        performanceStats: {
          totalTime: totalTime,
          downloadTime: downloadResult.downloadTime,
          decodeTime: downloadResult.decodeTime,
          chunksCount: downloadResult.chunksCount,
          chunkSize: chunkSize,
          compressionRatio: (stats.compressionRatio * 100).toFixed(1),
          originalSize: stats.originalSize,
          compressedSize: stats.compressedSize,
          averageSpeed: downloadResult.averageSpeed,
          wasmDecodeTime: (stats.wasmDecodeTime || downloadResult.decodeTime).toFixed(2),
          streamingEnabled: true,
        },
      };

      loadingStateMachine.success(result, '实时流式WASM加载完成');
      return result;
    } catch (error) {
      console.error('实时流式WASM 模型加载失败:', error);
      loadingStateMachine.error(error.message, '实时流式WASM 模型加载失败');
      throw error;
    } finally {
      // 清理流式解码器
      if (streamDecoder) {
        streamDecoder.free();
      }
    }
  }

  /**
   * 暂停流式下载
   */
  pauseStream() {
    console.log('⏸️ 暂停流式下载');
    this.downloader.pauseStream();
    this.loadingStateMachine.pause('⏸️ 流式下载已暂停');
  }

  /**
   * 恢复流式下载
   */
  resumeStream() {
    console.log('▶️ 恢复流式下载');
    this.downloader.resumeStream();
    this.loadingStateMachine.startDownloading('▶️ 流式下载已恢复');
  }

  /**
   * 取消流式下载
   */
  cancelStream() {
    console.log('❌ 取消流式下载');
    this.downloader.cancelStream();
    this.loadingStateMachine.cancel('❌ 流式下载已取消');
  }

  /**
   * 智能流式WASM加载模型
   * 自动根据文件大小判断是否需要分块
   */
  async loadModelSmartStreamWASM(options = {}) {
    console.log('🧠 开始智能流式WASM加载...');

    // 确保SmartDecoder已初始化
    if (!this.modelDecoder || !this.modelDecoder.isInitialized) {
      console.log('🔄 SmartDecoder未初始化，正在初始化...');
      await this.modelDecoder.init();
    }

    // 检查WASM解码器是否可用
    if (!this.wasmDecoder) {
      throw new Error('WASM 解码器未初始化');
    }

    const { model = {} } = options;
    const { uuid, name } = model;
    if (!uuid) {
      throw new Error('无法获取模型UUID');
    }

    // 获取模型ID和对应的状态机
    const modelId = model.uuid || model.id || model.name;
    const loadingStateMachine = this.getOrCreateStateMachine(modelId);
    
    const {
      smartChunkThreshold = 5242880, // 5MB阈值
      smartChunkSize = 5242880, // 5MB分块大小
      enableResume = true,
    } = options;

    loadingStateMachine.reset();
    loadingStateMachine.startLoading('🧠 智能流式WASM: 检测文件大小...');

    try {
      // 获取文件信息
      const fileInfo = await this.downloader.getFileInfo(model);
      const fileSize = fileInfo.size;
      
      console.log(`📊 文件大小: ${this.downloader.formatBytes(fileSize)}, 阈值: ${this.downloader.formatBytes(smartChunkThreshold)}`);
      
      // 智能判断是否需要分块
      const shouldChunk = fileSize > smartChunkThreshold;
      const actualChunkSize = shouldChunk ? smartChunkSize : 0;
      
      const strategy = shouldChunk ? '分块下载' : '整体下载';
      console.log(`🧠 智能决策: ${strategy} (文件${this.downloader.formatBytes(fileSize)}, ${shouldChunk ? `每块${this.downloader.formatBytes(actualChunkSize)}` : '不分块'})`);
      
      loadingStateMachine.emit('progress', {
        progress: 10,
        message: `🧠 智能流式WASM: ${strategy} - ${this.downloader.formatBytes(fileSize)}`,
      });

      // 使用实时流式WASM加载，但使用智能决策的分块大小
      return await this.loadModelStreamWASMRealtime({
        model,
        chunkSize: actualChunkSize,
        enableResume,
        onProgress: (progressData) => {
          // 更新进度消息，显示智能决策信息
          const message = progressData.message.replace('⚡ 实时流式WASM:', `🧠 智能流式WASM(${strategy}):`);
          loadingStateMachine.emit('progress', {
            ...progressData,
            message,
          });
        },
        onStreamInfo: options.onStreamInfo,
      });

    } catch (error) {
      console.error('智能流式WASM 模型加载失败:', error);
      loadingStateMachine.error(error.message, '智能流式WASM 模型加载失败');
      throw error;
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.dispose();
  }

  /**
   * 清理资源（内部方法）
   */
  dispose() {
    // 取消正在进行的下载
    this.cancelStream();

    // 清理WASM解码器
    if (this.wasmDecoder) {
      this.wasmDecoder = null;
    }

    // 清理模型解码器
    if (this.modelDecoder) {
      this.modelDecoder.dispose();
    }
    if (this.modelBuilder) {
      this.modelBuilder.dispose();
    }

    // 清理下载器
    if (this.downloader) {
      this.downloader.dispose();
    }
  }
}

// 导出默认实例
export default new ModelHandle();
