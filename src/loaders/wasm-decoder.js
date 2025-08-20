/**
 * FastDog WASM 解码器 - ES6模块版本
 * 支持 WASM 和 JavaScript 备选解码器
 * 优化版本：增强错误处理、性能监控、缓存机制
 */
import init, { 
    decode_fastdog_binary, 
    decode_fastdog_binary_zero_copy, 
    decode_fastdog_to_binary,
    get_decode_stats,
    validate_fastdog_format,
    get_format_info,
    benchmark_decode,
    StreamDecoder
} from '../wasm/fastdog_decoder.js';

class FastDogDecoder {
    constructor(options = {}) {
        this.wasmModule = null;
        this.jsDecoder = null;
        this.usingJSFallback = false;
        this.isInitialized = false;
        this.initPromise = null;

        // 配置选项
        this.config = {
            enableLogging: options.enableLogging !== false,
            enableCache: options.enableCache !== false,
            maxCacheSize: options.maxCacheSize || 50,
            retryAttempts: options.retryAttempts || 2,
            wasmPath: options.wasmPath || '/src/wasm/fastdog_decoder.js',
            wasmBgPath: options.wasmBgPath || '/src/wasm/fastdog_decoder_bg.wasm',
            fallbackPath: options.fallbackPath || './fallback-decoder.js',
            ...options
        };

        // 缓存系统
        this.cache = new Map();
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };

        // 性能监控
        this.performanceStats = {
            totalDecodes: 0,
            totalTime: 0,
            wasmDecodes: 0,
            jsDecodes: 0,
            averageTime: 0
        };

        // 错误统计
        this.errorStats = {
            wasmErrors: 0,
            jsErrors: 0,
            totalErrors: 0
        };
    }

    /**
     * 加载WASM模块（支持重试机制）
     */
    async _loadWASM() {
        let lastError = null;

        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                if (this.config.enableLogging) {
                    console.log(`🚀 正在加载 FastDog WASM 解码器... (尝试 ${attempt}/${this.config.retryAttempts})`);
                }

                // 预检查 WASM 支持
                if (!this._isWasmSupported()) {
                    throw new Error('当前环境不支持 WebAssembly');
                }
                
                // 初始化WASM模块
                await init();
                
                this.wasmModule = {
                    decode_fastdog_binary,
                    decode_fastdog_binary_zero_copy,
                    decode_fastdog_to_binary,
                    get_decode_stats,
                    validate_fastdog_format,
                    get_format_info,
                    benchmark_decode,
                    StreamDecoder
                };
                
                if (this.config.enableLogging) {
                    console.log('✅ FastDog WASM 解码器加载成功');
                }

                // 预热 WASM 模块
                await this._warmupWasm();

                return; // 成功加载，退出重试循环
                
            } catch (error) {
                lastError = error;
                this.errorStats.wasmErrors++;

                if (this.config.enableLogging) {
                    console.warn(`❌ WASM 模块加载失败 (尝试 ${attempt}/${this.config.retryAttempts}):`, error.message);
                }

                // 如果不是最后一次尝试，等待一段时间后重试
                if (attempt < this.config.retryAttempts) {
                    await this._delay(1000 * attempt); // 递增延迟
                }
            }
        }

        // 所有 WASM 加载尝试都失败，抛出错误
        if (this.config.enableLogging) {
            console.error('❌ WASM 模块加载失败，将尝试 JavaScript 备选方案:', lastError);
        }

        throw lastError;
    }

    /**
     * 延迟函数
     * @private
     */
    async _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 加载JavaScript备选解码器
     */
    async _loadJSDecoder() {
        try {
            if (this.config.enableLogging) {
                console.log('🔄 正在加载JavaScript备选解码器...');
            }
            
            // 动态导入fallback解码器
            const fallbackModule = await import('./fallback-decoder.js');
            this.jsDecoder = fallbackModule.default || fallbackModule.FastDogJSDecoder;
            
            if (this.config.enableLogging) {
                console.log('✅ JavaScript备选解码器加载成功');
            }
            
            return true;
        } catch (error) {
            if (this.config.enableLogging) {
                console.error('❌ JavaScript备选解码器加载失败:', error);
            }
            throw error;
        }
    }

    /**
     * 加载JavaScript备选方案
     */
    async _loadJSFallback(wasmError) {
        try {
            if (this.config.enableLogging) {
                console.warn('⚠️ WASM加载失败，切换到JavaScript备选方案:', wasmError.message);
            }
            
            await this._loadJSDecoder();
            this.usingJSFallback = true;
            this.errorStats.wasmErrors++;
            
            if (this.config.enableLogging) {
                console.log('✅ 已切换到JavaScript备选解码器');
            }
            
            return true;
        } catch (jsError) {
            this.errorStats.jsErrors++;
            this.errorStats.totalErrors++;
            
            if (this.config.enableLogging) {
                console.error('❌ JavaScript备选解码器也加载失败:', jsError);
            }
            
            throw new Error(`所有解码器加载失败: WASM错误: ${wasmError.message}, JS错误: ${jsError.message}`);
        }
    }

    /**
     * 初始化解码器
     */
    async init() {
        if (this.isInitialized) {
            return this;
        }
        
        if (this.initPromise) {
            return this.initPromise;
        }
        
        this.initPromise = this._performInit();
        return this.initPromise;
    }

    /**
     * 执行初始化
     */
    async _performInit() {
        try {
            if (this._isWasmSupported()) {
                try {
                    await this._loadWASM();
                    await this._warmupWasm();
                } catch (wasmError) {
                    await this._loadJSFallback(wasmError);
                }
            } else {
                if (this.config.enableLogging) {
                    console.warn('⚠️ 当前环境不支持WASM，使用JavaScript备选方案');
                }
                await this._loadJSDecoder();
                this.usingJSFallback = true;
            }
            
            this.isInitialized = true;
            return this;
        } catch (error) {
            this.errorStats.totalErrors++;
            throw error;
        }
    }

    /**
     * 解码数据
     */
    async decode(data, zeroCopy = false, options = {}) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        if (!data) {
            throw new Error('解码数据不能为空');
        }
        
        const startTime = performance.now();
        const cacheKey = this.config.enableCache ? this._generateCacheKey(data, zeroCopy, options) : null;
        
        // 检查缓存
        if (cacheKey && this.cache.has(cacheKey)) {
            this.cacheStats.hits++;
            if (this.config.enableLogging) {
                console.log('📦 从缓存返回解码结果');
            }
            return this.cache.get(cacheKey);
        }
        
        this.cacheStats.misses++;
        
        try {
            let result;
            
            if (this.usingJSFallback) {
                result = await this._decodeWithJS(data, zeroCopy, options);
                this.performanceStats.jsDecodes++;
            } else {
                result = await this._decodeWithWasm(data, zeroCopy, options);
                this.performanceStats.wasmDecodes++;
            }
            
            // 缓存结果
            if (cacheKey && this.config.enableCache) {
                this._setCached(cacheKey, result);
            }
            
            // 更新性能统计
            const endTime = performance.now();
            const decodeTime = endTime - startTime;
            this.performanceStats.totalDecodes++;
            this.performanceStats.totalTime += decodeTime;
            this.performanceStats.averageTime = this.performanceStats.totalTime / this.performanceStats.totalDecodes;
            
            if (this.config.enableLogging) {
                console.log(`⚡ 解码完成，耗时: ${decodeTime.toFixed(2)}ms`);
            }
            
            return result;
        } catch (error) {
            this.errorStats.totalErrors++;
            if (this.usingJSFallback) {
                this.errorStats.jsErrors++;
            } else {
                this.errorStats.wasmErrors++;
            }
            
            if (this.config.enableLogging) {
                console.error('❌ 解码失败:', error);
            }
            
            throw error;
        }
    }

    /**
     * 零拷贝解码数据（直接返回二进制数据）
     * @param {ArrayBuffer} data - 要解码的数据
     * @returns {Promise<{data: Uint8Array, stats: Object}>} 解码后的二进制数据和统计信息
     */
    async decodeBinary(data) {
        if (this.usingJSFallback) {
            // JavaScript备选方案
            const result = await this.decode(data);
            if (result.data && result.data.type === 'glb') {
                // 将base64数据转换回二进制
                const binaryData = this._base64ToUint8Array(result.data.data);
                return {
                    data: binaryData,
                    stats: result.stats
                };
            }
            throw new Error('JavaScript解码器不支持二进制输出');
        } else {
            if (!this.wasmModule || !this.wasmModule.decode_fastdog_to_binary) {
                throw new Error('WASM解码器未初始化或decode_fastdog_to_binary方法不可用');
            }

            // 确保数据是Uint8Array格式
            const uint8Data = data instanceof ArrayBuffer ? new Uint8Array(data) : data;

            // 调用WASM二进制解码函数
            const startTime = performance.now();
            const binaryResult = this.wasmModule.decode_fastdog_to_binary(uint8Data);
            const endTime = performance.now();

            // 获取统计信息
            const statsResult = this.wasmModule.get_decode_stats(uint8Data);

            console.log('🚀 WASM二进制解码完成，数据长度:', binaryResult.length);

            return {
                data: binaryResult,
                stats: {
                    originalSize: statsResult.original_size,
                    compressedSize: statsResult.compressed_size,
                    compressionRatio: statsResult.compression_ratio,
                    decodeTimeMs: statsResult.decode_time_ms,
                    formatVersion: statsResult.format_version,
                    wasmDecodeTime: statsResult.decode_time_ms,
                    jsWrapperTime: endTime - startTime
                }
            };
        }
    }

    /**
     * 零拷贝解码（返回内存指针）
     * @param {ArrayBuffer} data - 要解码的数据
     * @returns {Promise<{dataView: Uint8Array, stats: Object}>} 内存视图和统计信息
     */
    async decodeZeroCopy(data) {
        if (this.usingJSFallback) {
            // JavaScript备选方案，实际上还是会拷贝
            return await this.decodeBinary(data);
        } else {
            if (!this.wasmModule || !this.wasmModule.decode_fastdog_binary_zero_copy) {
                throw new Error('WASM解码器未初始化或decode_fastdog_binary_zero_copy方法不可用');
            }

            // 确保数据是Uint8Array格式
            const uint8Data = data instanceof ArrayBuffer ? new Uint8Array(data) : data;

            // 调用WASM零拷贝解码函数
            const startTime = performance.now();
            const result = this.wasmModule.decode_fastdog_binary_zero_copy(uint8Data);
            const endTime = performance.now();

            if (!result.success) {
                throw new Error(`WASM零拷贝解码失败: ${result.error || '未知错误'}`);
            }

            // 创建内存视图，直接访问WASM内存
            const dataView = new Uint8Array(
                this.wasmModule.memory.buffer,
                result.data_ptr,
                result.data_len
            );

            console.log('⚡ WASM零拷贝解码完成，数据长度:', result.data_len);

            return {
                dataView: dataView,
                stats: {
                    originalSize: result.stats.original_size,
                    compressedSize: result.stats.compressed_size,
                    compressionRatio: result.stats.compression_ratio,
                    decodeTimeMs: result.stats.decode_time_ms,
                    formatVersion: result.stats.format_version,
                    wasmDecodeTime: result.stats.decode_time_ms,
                    jsWrapperTime: endTime - startTime
                }
            };
        }
    }

    /**
     * Base64转Uint8Array的辅助函数
     * @private
     */
    _base64ToUint8Array(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    /**
     * 使用WASM解码
     */
    async _decodeWithWasm(data, zeroCopy, options) {
        if (!this.wasmModule || !this.wasmModule.decode_fastdog_binary) {
            throw new Error('WASM解码器未初始化或decode_fastdog_binary方法不可用');
        }

        // 确保数据是Uint8Array格式
        const uint8Data = data instanceof ArrayBuffer ? new Uint8Array(data) : data;

        // 调用WASM解码函数
        const startTime = performance.now();
        const wasmResult = this.wasmModule.decode_fastdog_binary(uint8Data);
        const endTime = performance.now();
        const decodeTime = endTime - startTime;

        if (this.config.enableLogging) {
            console.log('🔍 WASM解码原始结果:', wasmResult);
        }

        // WASM返回的是DecodeResult结构
        if (!wasmResult.success) {
            throw new Error(`WASM解码失败: ${wasmResult.error || '未知错误'}`);
        }

        // 解析WASM返回的数据
        let parsedData;
        try {
            if (wasmResult.data) {
                // WASM返回的data字段是JSON字符串，需要解析
                parsedData = JSON.parse(wasmResult.data);
                if (this.config.enableLogging) {
                    console.log('✅ WASM数据JSON解析成功');
                }
            } else {
                throw new Error('WASM返回的数据为空');
            }
        } catch (error) {
            throw new Error(`WASM数据解析失败: ${error.message}`);
        }

        // 使用WASM返回的统计信息，并添加JavaScript层的时间
        const stats = {
            originalSize: wasmResult.stats.original_size,
            compressedSize: wasmResult.stats.compressed_size,
            compressionRatio: wasmResult.stats.compression_ratio,
            decodeTimeMs: wasmResult.stats.decode_time_ms,
            formatVersion: wasmResult.stats.format_version,
            wasmDecodeTime: wasmResult.stats.decode_time_ms,
            jsWrapperTime: decodeTime
        };

        // 返回与JavaScript解码器相同格式的结果
        return {
            success: true,
            data: parsedData,
            stats: stats
        };
    }

    /**
     * 使用JavaScript解码
     */
    async _decodeWithJS(data, zeroCopy, options) {
        try {
            if (!this.jsDecoder) {
                throw new Error('JavaScript解码器未初始化');
            }
            
            return await this.jsDecoder.decode(data, zeroCopy, options);
        } catch (error) {
            throw new Error(`JavaScript解码失败: ${error.message}`);
        }
    }

    /**
     * 检查WASM支持
     */
    _isWasmSupported() {
        try {
            if (typeof WebAssembly === 'object' &&
                typeof WebAssembly.instantiate === 'function') {
                const module = new WebAssembly.Module(new Uint8Array([
                    0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00
                ]));
                if (module instanceof WebAssembly.Module) {
                    return new WebAssembly.Instance(module) instanceof WebAssembly.Instance;
                }
            }
        } catch {
            // WASM不支持
        }
        return false;
    }

    /**
     * WASM预热
     */
    async _warmupWasm() {
        try {
            // 使用小数据进行预热
            const testData = new Uint8Array([1, 2, 3, 4]);
            await this.wasmModule.validate_fastdog_format(testData);
            
            if (this.config.enableLogging) {
                console.log('🔥 WASM预热完成');
            }
        } catch (error) {
            if (this.config.enableLogging) {
                console.warn('⚠️ WASM预热失败:', error.message);
            }
        }
    }

    /**
     * 生成缓存键
     */
    _generateCacheKey(data, zeroCopy, options) {
        const dataHash = this._simpleHash(data);
        const optionsStr = JSON.stringify(options);
        return `${dataHash}_${zeroCopy}_${optionsStr}`;
    }

    /**
     * 简单哈希函数
     */
    _simpleHash(data) {
        let hash = 0;
        const str = data instanceof Uint8Array ? 
            Array.from(data.slice(0, 100)).join('') : 
            String(data).slice(0, 100);
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 转换为32位整数
        }
        return hash.toString();
    }

    /**
     * 设置缓存
     */
    _setCached(key, value) {
        if (this.cache.size >= this.config.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            this.cacheStats.evictions++;
        }
        this.cache.set(key, value);
    }

    /**
     * 更新配置
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };

        // 如果缓存大小改变，调整缓存
        if (newConfig.maxCacheSize && newConfig.maxCacheSize < this.cache.size) {
            const excess = this.cache.size - newConfig.maxCacheSize;
            const keys = Array.from(this.cache.keys()).slice(0, excess);
            keys.forEach(key => this.cache.delete(key));
            this.cacheStats.evictions += excess;
        }

        if (this.config.enableLogging) {
            console.log('⚙️ 解码器配置已更新:', newConfig);
        }
    }

    /**
     * 动态导入 WASM 模块（备选方案）
     * @private
     */
    async _importWasmModule() {
        try {
            // 尝试 ES6 模块导入
            return await import(this.config.wasmPath);
        } catch (error) {
            // 备选方案：动态脚本加载
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = this.config.wasmPath;
                script.onload = () => {
                    if (window.wasm_bindgen) {
                        resolve(window.wasm_bindgen);
                    } else {
                        reject(new Error('WASM 模块加载后未找到 wasm_bindgen'));
                    }
                };
                script.onerror = () => reject(new Error('WASM 脚本加载失败'));
                document.head.appendChild(script);
            });
        }
    }

    /**
     * 获取解码器类型
     */
    getDecoderType() {
        return this.usingJSFallback ? 'JavaScript' : 'WASM';
    }

    /**
     * 获取状态信息
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            decoderType: this.getDecoderType(),
            performanceStats: { ...this.performanceStats },
            cacheStats: { ...this.cacheStats },
            errorStats: { ...this.errorStats },
            config: { ...this.config }
        };
    }

    /**
     * 清除缓存
     */
    clearCache() {
        this.cache.clear();
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };
    }

    /**
     * 重置统计
     */
    resetStats() {
        this.performanceStats = {
            totalDecodes: 0,
            totalTime: 0,
            wasmDecodes: 0,
            jsDecodes: 0,
            averageTime: 0
        };
        
        this.errorStats = {
            wasmErrors: 0,
            jsErrors: 0,
            totalErrors: 0
        };
        
        this.clearCache();
    }

    /**
     * 批量解码多个数据
     * @param {Array} dataArray - 数据数组
     * @param {Object} options - 解码选项
     * @returns {Promise<Array>} 解码结果数组
     */
    async batchDecode(dataArray, options = {}) {
        if (!Array.isArray(dataArray)) {
            throw new Error('输入必须是数组');
        }

        const {
            concurrency = 3,
            continueOnError = true,
            zeroCopy = false
        } = options;

        const results = [];
        const errors = [];

        // 分批处理
        for (let i = 0; i < dataArray.length; i += concurrency) {
            const batch = dataArray.slice(i, i + concurrency);
            const batchPromises = batch.map(async (data, index) => {
                try {
                    const result = await this.decode(data, zeroCopy, options);
                    return { index: i + index, result, error: null };
                } catch (error) {
                    if (!continueOnError) {
                        throw error;
                    }
                    return { index: i + index, result: null, error };
                }
            });

            const batchResults = await Promise.all(batchPromises);

            for (const item of batchResults) {
                if (item.error) {
                    errors.push({ index: item.index, error: item.error });
                }
                results[item.index] = item.result;
            }
        }

        return {
            results,
            errors,
            successCount: results.filter(r => r !== null).length,
            errorCount: errors.length
        };
    }

    /**
     * 预加载解码器（后台初始化）
     * @param {Object} options - 预加载选项
     * @returns {Promise<FastDogDecoder>}
     */
    static async preload(options = {}) {
        const {
            priority = 'low',
            timeout = 30000
        } = options;

        const delay = priority === 'high' ? 0 : priority === 'normal' ? 100 : 500;

        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error('预加载超时'));
            }, timeout);

            setTimeout(async () => {
                try {
                    const decoder = new FastDogDecoder(options);
                    await decoder.init();
                    clearTimeout(timeoutId);
                    resolve(decoder);
                } catch (error) {
                    clearTimeout(timeoutId);
                    reject(error);
                }
            }, delay);
        });
    }

    /**
     * 获取详细的性能报告
     * @returns {Object} 性能报告
     */
    getPerformanceReport() {
        const status = this.getStatus();
        const cacheHitRate = this.cacheStats.hits + this.cacheStats.misses > 0
            ? (this.cacheStats.hits / (this.cacheStats.hits + this.cacheStats.misses) * 100).toFixed(2)
            : 0;

        return {
            ...status,
            cacheHitRate: `${cacheHitRate}%`,
            averageDecodeTime: `${this.performanceStats.averageTime.toFixed(2)}ms`,
            totalDecodeTime: `${this.performanceStats.totalTime.toFixed(2)}ms`,
            wasmUsageRate: this.performanceStats.totalDecodes > 0
                ? `${(this.performanceStats.wasmDecodes / this.performanceStats.totalDecodes * 100).toFixed(2)}%`
                : '0%',
            errorRate: this.performanceStats.totalDecodes > 0
                ? `${(this.errorStats.totalErrors / this.performanceStats.totalDecodes * 100).toFixed(2)}%`
                : '0%'
        };
    }

    /**
     * 获取流式解码器
     */
    getStreamDecoder() {
        if (this.getDecoderType() === 'WASM' && this.wasmModule && this.wasmModule.StreamDecoder) {
            return this.wasmModule.StreamDecoder;
        }
        return null;
    }

    /**
     * 销毁解码器，释放资源
     */
    destroy() {
        try {
            // 清理缓存
            this.clearCache();

            // 清理 WASM 模块
            if (this.wasmModule && typeof this.wasmModule.free === 'function') {
                this.wasmModule.free();
            }

            // 清理 JS 解码器
            if (this.jsDecoder && typeof this.jsDecoder.destroy === 'function') {
                this.jsDecoder.destroy();
            }

            // 重置状态
            this.wasmModule = null;
            this.jsDecoder = null;
            this.isInitialized = false;
            this.initPromise = null;

            if (this.config.enableLogging) {
                console.log('🗑️ 解码器已销毁，资源已释放');
            }

        } catch (error) {
            if (this.config.enableLogging) {
                console.error('❌ 销毁解码器时出错:', error);
            }
        }
    }
}

// ES6模块导出
export default FastDogDecoder;
export { FastDogDecoder };

// 为了兼容性，也添加到window对象
if (typeof window !== 'undefined') {
    window.FastDogDecoder = FastDogDecoder;
    window.FastDogWASMDecoder = FastDogDecoder;
}