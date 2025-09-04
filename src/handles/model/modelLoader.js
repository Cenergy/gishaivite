import downloader from './modelDownloader.js';
import {modelDecoder} from './decoders/index.js';
import modelBuilder from './modelBuilder.js';
import LoadingStateMachine from '@/utils/LoadingStateMachine.js';

/**
 * 高级模型加载器类
 * 支持多种加载方式：直接加载、流式加载、WASM解码、实时流式WASM等
 */
export class ModelHandle {
  constructor() {
    this.wasmDecoder = null;
    this.loadingStateMachine = new LoadingStateMachine();
    this.downloader = downloader;
    this.modelDecoder = modelDecoder;
    this.modelBuilder = modelBuilder;
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
  _handleError(error, context = '加载') {
    console.error(`${context}失败:`, error);
    this.loadingStateMachine.error(error.message, `${context}失败`);
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
      'stream-wasm': (model) => this.loadModelStreamWASM(model),
      stream_wasm_realtime: (model, options) =>
        this.loadModelStreamWASMRealtime({
          model,
          chunkSize: options.chunkSize,
          enableResume: options.enableResume,
        }),
      'realtime-wasm': (model, options) =>
        this.loadModelStreamWASMRealtime({
          model,
          chunkSize: options.chunkSize,
          enableResume: options.enableResume,
        }),
    };
  }

  /**
   * 统一的模型加载方法
   */
  async loadModel(model, loadMethod, options = {}) {
    console.log('🚀 ~ ModelHandle ~ loadModel ~ model:', model);
    const { chunkSize, enableResume, authToken } = options;

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

    // 执行对应的加载策略
    const needsOptions = ['stream_wasm_realtime', 'realtime-wasm'].includes(loadMethod);
    return needsOptions ? strategy(model, { chunkSize, enableResume }) : strategy(model);
  }


  /**
   * 直接加载模型（不使用WASM）
   */

  async loadOriginModel(model) {
    if (!model || !model.model_file_url) {
      throw new Error('未找到模型或模型文件URL');
    }

    this.loadingStateMachine.reset();
    this.loadingStateMachine.startLoading('开始直接加载...');

    try {
      const url = model.model_file_url;
      const extension = url.split('.').pop()?.toLowerCase();
      const loader = this.modelBuilder._getFileLoader(extension);

      this.loadingStateMachine.startBuilding('正在解析模型...');

      return new Promise((resolve, reject) => {
        loader.load(
          url,
          (object) => {
            const modelObj = extension === 'gltf' || extension === 'glb' ? object.scene : object;
            const geometry = this.modelBuilder._extractGeometry(modelObj);

            this.loadingStateMachine.success(modelObj, '加载完成');

            resolve({
              model: modelObj,
              geometry,
              animations: object.animations || [],
            });
          },
          (progress) => {
            const percent = (progress.loaded / progress.total) * 100;
            this.loadingStateMachine.emit('progress', {
              progress: percent,
              message: `加载中... ${percent.toFixed(1)}%`,
            });
          },
          (error) => {
            this._handleError(error, '原始模型加载');
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

    this.loadingStateMachine.startLoading('🌊 流式加载: 开始下载...');

    try {
      // 使用下载器下载模型数据
      const downloadResult = await this.downloader.downloadModelStream(model, {
        onProgress: (progress) => {
          this.loadingStateMachine.emit('progress', {
            progress: progress.progress * 0.3, // 下载占30%
            message: '🌊 流式: 下载中...',
          });
        },
      });

      this.loadingStateMachine.emit('progress', {
        progress: 30,
        message: '🌊 流式: 下载完成，开始解码...',
      });

      const arrayBuffer = downloadResult.data;
      const downloadTime = downloadResult.downloadTime;

      // 检查数据格式，如果是FastDog格式则需要解码
      const magic = new TextDecoder().decode(new Uint8Array(arrayBuffer, 0, 8));
      const needsDecoding = magic.startsWith('FASTDOG');

      if (needsDecoding) {
        this.loadingStateMachine.emit('progress', {
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

      this.loadingStateMachine.emit('progress', {
        progress: 80,
        message: '🌊 流式: 解码完成，构建模型...',
      });

      // 构建模型
      const modelResult = await this.modelBuilder.buildModelWithGLTFLoader(decodedData);
      const result = this._buildResult(
        modelResult.model,
        modelResult.geometry,
        startTime,
        downloadTime,
        decodeTime,
      );

      this.loadingStateMachine.success(result, '流式加载完成');
      return result;
    } catch (error) {
      this._handleError(error, '流式加载');
    }
  }

  /**
   * WASM解码加载模型
   */
  async loadModelWASM(model) {
    console.log('🔧 开始WASM解码加载...');
    const { uuid } = model;
    const startTime = Date.now();

    this.loadingStateMachine.startLoading('🔧 WASM: 开始下载二进制数据...');

    try {
      // 使用下载器下载模型数据
      const downloadResult = await this.downloader.downloadModelStream(model, {
        onProgress: (progress) => {
          this.loadingStateMachine.emit('progress', {
            progress: progress.progress * 0.3, // 下载占30%
            message: '🔧 WASM: 下载中...',
          });
        },
      });

      this.loadingStateMachine.emit('progress', {
        progress: 30,
        message: 'WASM: 下载完成，开始解码...',
      });

      const binaryData = downloadResult.data;
      const downloadTime = downloadResult.downloadTime;

      this.loadingStateMachine.emit('progress', {
        progress: 50,
        message: 'WASM: 使用 WASM 解码中...',
      });

      // 使用通用解码方法
      const { data: parsedData, decodeTime } = await this.modelDecoder.decodeData(binaryData, uuid, true);

      this.loadingStateMachine.emit('progress', {
        progress: 80,
        message: 'WASM: 解码完成，构建模型...',
      });

      // 构建模型
      const modelResult = await this.modelBuilder.buildModelWithGLTFLoader(parsedData);
      const result = this._buildResult(
        modelResult.model,
        modelResult.geometry,
        startTime,
        downloadTime,
        decodeTime,
      );

      this.loadingStateMachine.success(result, 'WASM加载完成');
      return result;
    } catch (error) {
      this._handleError(error, 'WASM加载');
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
      this.loadingStateMachine.error('WASM 解码器未初始化');
      throw new Error('WASM 解码器未初始化');
    }
    const { model = {} } = options;

    const { uuid, name } = model;
    if (!uuid) {
      this.loadingStateMachine.error('无法获取模型UUID');
      throw new Error('无法获取模型UUID');
    }

    const {
      chunkSize = 0,
      enableResume = true,
      onProgress = () => {},
      onStreamInfo = () => {},
    } = options;

    // 使用状态机开始加载
    this.loadingStateMachine.startLoading('⚡ 开始实时流式WASM加载...');

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
      this.loadingStateMachine.error(errorMsg);
      throw new Error(errorMsg);
    }
    const streamDecoder = new StreamDecoderClass();

    try {
      this.loadingStateMachine.emit('progress', {
        progress: 5,
        message: '⚡ 实时流式WASM: 获取文件信息...',
      });

      // 转换到下载状态，使暂停按钮可用
      this.loadingStateMachine.startDownloading('⚡ 实时流式WASM: 开始下载...');

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

          this.loadingStateMachine.emit('progress', {
            progress: totalProgress,
            message: `⚡ 实时流式WASM: 下载 ${((downloadedBytes / totalBytes) * 100).toFixed(1)}%, 解码 ${(decodeProgress * 100).toFixed(1)}%`,
          });

          // 解码完成时切换状态
          if (decodeProgress >= 1.0) {
            this.loadingStateMachine.startBuilding('⚡ 实时流式WASM: 解码完成，构建模型...');
            this.loadingStateMachine.emit('progress', {
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
        parsedData || downloadResult.decodeResult.data,
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

      this.loadingStateMachine.success(result, '实时流式WASM加载完成');
      return result;
    } catch (error) {
      console.error('实时流式WASM 模型加载失败:', error);
      this.loadingStateMachine.error(error.message, '实时流式WASM 模型加载失败');
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
