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
     * 加载WASM模块
     */
    async _loadWASM() {
        try {
            if (this.config.enableLogging) {
                console.log('🔄 正在加载WASM模块...');
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
                console.log('✅ WASM模块加载成功');
            }
            
            return true;
        } catch (error) {
            if (this.config.enableLogging) {
                console.error('❌ WASM模块加载失败:', error);
            }
            throw error;
        }
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
     * 使用WASM解码
     */
    async _decodeWithWasm(data, zeroCopy) {
        try {
            const uint8Data = data instanceof Uint8Array ? data : new Uint8Array(data);
            
            if (zeroCopy) {
                return this.wasmModule.decode_fastdog_binary_zero_copy(uint8Data);
            } else {
                return this.wasmModule.decode_fastdog_binary(uint8Data);
            }
        } catch (error) {
            throw new Error(`WASM解码失败: ${error.message}`);
        }
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
     * 获取流式解码器
     */
    getStreamDecoder() {
        if (this.getDecoderType() === 'WASM' && this.wasmModule && this.wasmModule.StreamDecoder) {
            return this.wasmModule.StreamDecoder;
        }
        return null;
    }

    /**
     * 销毁解码器
     */
    destroy() {
        this.clearCache();
        this.wasmModule = null;
        this.jsDecoder = null;
        this.isInitialized = false;
        this.initPromise = null;
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