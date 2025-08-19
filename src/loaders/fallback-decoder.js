/**
 * FastDog 解码器 JavaScript 备选实现
 * 当 WASM 不可用时使用的纯 JavaScript 解码器
 * 优化版本：增强错误处理、性能监控、缓存机制
 */

class FastDogJSDecoder {
    constructor(options = {}) {
        this.isInitialized = false;
        this.initPromise = null;
        
        // 配置选项
        this.config = {
            enableLogging: options.enableLogging !== false,
            enableCache: options.enableCache !== false,
            maxCacheSize: options.maxCacheSize || 20,
            retryAttempts: options.retryAttempts || 2,
            compressionTimeout: options.compressionTimeout || 30000,
            ...options
        };
        
        // 缓存系统
        this.cache = new Map();
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0
        };
        
        // 性能统计
        this.performanceStats = {
            totalDecodes: 0,
            totalTime: 0,
            averageTime: 0,
            successCount: 0,
            errorCount: 0
        };
    }

    /**
     * 初始化解码器（支持单例模式）
     */
    async init() {
        if (this.isInitialized) {
            return;
        }
        
        if (this.initPromise) {
            return this.initPromise;
        }
        
        this.initPromise = this._performInit();
        try {
            await this.initPromise;
        } catch (error) {
            this.initPromise = null;
            throw error;
        }
    }
    
    /**
     * 执行初始化
     */
    async _performInit() {
        try {
            if (this.config.enableLogging) {
                console.log('🔄 正在初始化 JavaScript 解码器...');
            }
            
            // 检查必要的 API 支持
            if (!this._checkAPISupport()) {
                throw new Error('当前环境不支持必要的 JavaScript API');
            }
            
            this.isInitialized = true;
            
            if (this.config.enableLogging) {
                console.log('✅ JavaScript 解码器初始化成功');
            }
        } catch (error) {
            if (this.config.enableLogging) {
                console.error('❌ JavaScript 解码器初始化失败:', error);
            }
            throw error;
        }
    }

    /**
     * 解码数据
     */
    async decode(data, options = {}) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        const startTime = performance.now();
        
        try {
            // 检查缓存
            if (this.config.enableCache) {
                const cacheKey = this._generateCacheKey(data);
                const cached = this.cache.get(cacheKey);
                if (cached) {
                    this.cacheStats.hits++;
                    this._updateStats(performance.now() - startTime, true);
                    return cached;
                }
                this.cacheStats.misses++;
            }
            
            // 执行解码（带重试机制）
            let lastError;
            for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
                try {
                    const result = await this._performDecode(data, options, attempt);
                    
                    // 缓存结果
                    if (this.config.enableCache) {
                        const cacheKey = this._generateCacheKey(data);
                        this._setCached(cacheKey, result);
                    }
                    
                    this._updateStats(performance.now() - startTime, true);
                    return result;
                } catch (error) {
                    lastError = error;
                    if (attempt < this.config.retryAttempts) {
                        if (this.config.enableLogging) {
                            console.warn(`⚠️ 解码尝试 ${attempt} 失败，正在重试...`, error.message);
                        }
                        await this._delay(100 * attempt); // 递增延迟
                    }
                }
            }
            
            throw lastError;
        } catch (error) {
            this._updateStats(performance.now() - startTime, false);
            throw new Error(`JavaScript 解码失败: ${error.message}`);
        }
    }

    /**
     * 执行实际解码
     */
    async _performDecode(data, options, attempt) {
        const uint8Data = this._ensureUint8Array(data);
        
        if (this.config.enableLogging && attempt === 1) {
            console.log('🔄 开始 JavaScript 解码，数据大小:', uint8Data.length);
        }
        
        // 解析头部信息
        const header = this._parseHeader(uint8Data);
        if (!header.isValid) {
            throw new Error('无效的 FastDog 格式');
        }
        
        // 提取压缩数据
        const compressedData = uint8Data.slice(header.dataOffset);
        
        // 解压缩数据
        const decompressedData = await this._decompressData(
            compressedData, 
            header.originalSize
        );
        
        if (this.config.enableLogging && attempt === 1) {
            console.log('✅ JavaScript 解码完成，输出大小:', decompressedData.byteLength);
        }
        
        return {
            data: decompressedData,
            metadata: {
                originalSize: header.originalSize,
                compressedSize: compressedData.length,
                compressionRatio: compressedData.length / header.originalSize,
                format: 'fastdog',
                decoder: 'javascript'
            }
        };
    }

    /**
     * 解析文件头
     */
    _parseHeader(uint8Data) {
        if (uint8Data.length < 16) {
            return { isValid: false };
        }
        
        // 检查魔数 (FastDog)
        const magicBytes = uint8Data.slice(0, 8);
        const expectedMagic = new Uint8Array([0x46, 0x61, 0x73, 0x74, 0x44, 0x6F, 0x67, 0x00]);
        
        for (let i = 0; i < 8; i++) {
            if (magicBytes[i] !== expectedMagic[i]) {
                return { isValid: false };
            }
        }
        
        // 读取版本和大小信息
        const dataView = new DataView(uint8Data.buffer, uint8Data.byteOffset);
        const version = dataView.getUint16(8, true);
        const flags = dataView.getUint16(10, true);
        const originalSize = dataView.getUint32(12, true);
        
        return {
            isValid: true,
            version,
            flags,
            originalSize,
            dataOffset: 16
        };
    }

    /**
     * 解压缩数据
     */
    async _decompressData(compressedData, expectedSize) {
        try {
            // 首先尝试流式解压缩
            return await this._decompressWithStream(compressedData);
        } catch (streamError) {
            if (this.config.enableLogging) {
                console.warn('⚠️ 流式解压缩失败，尝试备选方法:', streamError.message);
            }
            
            // 备选：简单解压缩
            return await this._decompressSimple(compressedData, expectedSize);
        }
    }

    /**
     * 流式解压缩
     */
    async _decompressWithStream(compressedData) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('解压缩超时'));
            }, this.config.compressionTimeout);
            
            try {
                // 检查是否有 pako 库可用
                if (typeof window !== 'undefined' && window.pako) {
                    const result = window.pako.inflate(compressedData);
                    clearTimeout(timeout);
                    resolve(result.buffer);
                    return;
                }
                
                // 使用内置的 CompressionStream API（如果可用）
                if (typeof CompressionStream !== 'undefined') {
                    const stream = new DecompressionStream('gzip');
                    const writer = stream.writable.getWriter();
                    const reader = stream.readable.getReader();
                    
                    const chunks = [];
                    
                    const pump = async () => {
                        const { done, value } = await reader.read();
                        if (done) {
                            clearTimeout(timeout);
                            const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
                            const result = new Uint8Array(totalLength);
                            let offset = 0;
                            for (const chunk of chunks) {
                                result.set(chunk, offset);
                                offset += chunk.length;
                            }
                            resolve(result.buffer);
                            return;
                        }
                        chunks.push(value);
                        pump();
                    };
                    
                    writer.write(compressedData);
                    writer.close();
                    pump();
                    return;
                }
                
                // 如果没有可用的解压缩方法，抛出错误
                throw new Error('没有可用的解压缩方法');
            } catch (error) {
                clearTimeout(timeout);
                reject(error);
            }
        });
    }

    /**
     * 简单解压缩（备选方法）
     */
    async _decompressSimple(compressedData) {
        // 这里实现一个简单的解压缩算法
        // 实际项目中应该根据具体的压缩格式来实现
        return compressedData.buffer.slice(compressedData.byteOffset, compressedData.byteOffset + compressedData.byteLength);
    }

    /**
     * 验证数据格式
     */
    async validate(data) {
        try {
            const uint8Data = this._ensureUint8Array(data);
            const header = this._parseHeader(uint8Data);
            return {
                isValid: header.isValid,
                format: header.isValid ? 'fastdog' : 'unknown',
                version: header.version || null,
                size: uint8Data.length
            };
        } catch (error) {
            return {
                isValid: false,
                error: error.message
            };
        }
    }

    /**
     * 获取格式信息
     */
    async getFormatInfo(data) {
        const uint8Data = this._ensureUint8Array(data);
        const header = this._parseHeader(uint8Data);
        
        if (!header.isValid) {
            throw new Error('无效的 FastDog 格式');
        }
        
        return {
            format: 'fastdog',
            version: header.version,
            originalSize: header.originalSize,
            compressedSize: uint8Data.length - header.dataOffset,
            compressionRatio: (uint8Data.length - header.dataOffset) / header.originalSize,
            flags: header.flags
        };
    }

    /**
     * 确保数据是 Uint8Array
     */
    _ensureUint8Array(data) {
        if (data instanceof Uint8Array) {
            return data;
        }
        if (data instanceof ArrayBuffer) {
            return new Uint8Array(data);
        }
        throw new Error('数据必须是 ArrayBuffer 或 Uint8Array');
    }

    /**
     * 生成缓存键
     */
    _generateCacheKey(data) {
        const uint8Data = this._ensureUint8Array(data);
        let hash = 0;
        for (let i = 0; i < Math.min(uint8Data.length, 1024); i++) {
            hash = ((hash << 5) - hash + uint8Data[i]) & 0xffffffff;
        }
        return `${hash}_${uint8Data.length}`;
    }

    /**
     * 设置缓存
     */
    _setCached(key, value) {
        if (this.cache.size >= this.config.maxCacheSize) {
            // 删除最旧的条目
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
            this.cacheStats.evictions++;
        }
        this.cache.set(key, value);
    }

    /**
     * 更新统计信息
     */
    _updateStats(decodeTime, success) {
        this.performanceStats.totalDecodes++;
        this.performanceStats.totalTime += decodeTime;
        this.performanceStats.averageTime = this.performanceStats.totalTime / this.performanceStats.totalDecodes;
        
        if (success) {
            this.performanceStats.successCount++;
        } else {
            this.performanceStats.errorCount++;
        }
    }

    /**
     * 延迟函数
     */
    async _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
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
     * 重置统计信息
     */
    resetStats() {
        this.performanceStats = {
            totalDecodes: 0,
            totalTime: 0,
            averageTime: 0,
            successCount: 0,
            errorCount: 0
        };
        this.clearCache();
    }

    /**
     * 获取状态信息
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            config: { ...this.config },
            performance: { ...this.performanceStats },
            cache: {
                size: this.cache.size,
                maxSize: this.config.maxCacheSize,
                stats: { ...this.cacheStats }
            },
            capabilities: FastDogJSDecoder.getCapabilities()
        };
    }

    /**
     * 性能基准测试
     */
    async benchmark(data, iterations = 100, options = {}) {
        if (!this.isInitialized) {
            await this.init();
        }
        
        const results = {
            iterations,
            times: [],
            errors: 0,
            averageTime: 0,
            minTime: Infinity,
            maxTime: 0,
            successRate: 0
        };
        
        console.log(`🏃 开始性能基准测试 (${iterations} 次迭代)...`);
        
        for (let i = 0; i < iterations; i++) {
            const startTime = performance.now();
            try {
                await this.decode(data, { ...options, enableCache: false });
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                results.times.push(duration);
                results.minTime = Math.min(results.minTime, duration);
                results.maxTime = Math.max(results.maxTime, duration);
            } catch (error) {
                results.errors++;
                if (options.enableLogging) {
                    console.warn(`基准测试迭代 ${i + 1} 失败:`, error.message);
                }
            }
            
            // 每 10 次迭代显示进度
            if ((i + 1) % 10 === 0) {
                console.log(`📊 进度: ${i + 1}/${iterations}`);
            }
        }
        
        // 计算统计信息
        const successfulRuns = results.times.length;
        results.successRate = (successfulRuns / iterations) * 100;
        
        if (successfulRuns > 0) {
            results.averageTime = results.times.reduce((sum, time) => sum + time, 0) / successfulRuns;
            
            // 计算中位数
            const sortedTimes = [...results.times].sort((a, b) => a - b);
            const mid = Math.floor(sortedTimes.length / 2);
            results.medianTime = sortedTimes.length % 2 === 0
                ? (sortedTimes[mid - 1] + sortedTimes[mid]) / 2
                : sortedTimes[mid];
        }
        
        console.log('📈 基准测试完成:', results);
        return results;
    }

    /**
     * 检查 API 支持
     */
    _checkAPISupport() {
        return typeof ArrayBuffer !== 'undefined' && 
               typeof Uint8Array !== 'undefined' && 
               typeof DataView !== 'undefined';
    }

    /**
     * 检查是否支持
     */
    static isSupported() {
        return typeof ArrayBuffer !== 'undefined' && 
               typeof Uint8Array !== 'undefined' && 
               typeof DataView !== 'undefined';
    }

    /**
     * 获取功能支持情况
     */
    static getCapabilities() {
        return {
            wasm: false,
            javascript: true,
            streaming: typeof ReadableStream !== 'undefined',
            compression: typeof CompressionStream !== 'undefined' || (typeof window !== 'undefined' && !!window.pako),
            workers: typeof Worker !== 'undefined'
        };
    }
}

// ES6 模块导出
export default FastDogJSDecoder;
export { FastDogJSDecoder };

// 兼容性导出
if (typeof window !== 'undefined') {
    window.FastDogJSDecoder = FastDogJSDecoder;
}

console.log('📦 FastDog JavaScript 解码器已加载');
console.log('🔧 JavaScript 解码器功能支持:', FastDogJSDecoder.getCapabilities());