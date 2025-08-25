

/**
 * WASM模型加载器 - ES6模块版本
 * 使用WebAssembly + 自定义二进制格式加载3D模型
 * 
 * @param {object} dataProvider - 数据提供者，负责网络请求
 */

class WASMModelLoader {
    constructor(dataProvider, decoder) {
        if (!dataProvider) {
            throw new Error('dataProvider is required');
        }
        if (!decoder) {
            throw new Error('decoder is required');
        }
        this.dataProvider = dataProvider;
        this.decoder = decoder;
        
        // 性能监控配置
        this.performanceConfig = {
            enableLogging: true,
            logPrefix: '⚡'
        };
         
         // 缓存配置
        this.cache = new Map();
        this.maxCacheSize = 10;
    }

    /**
     * 解析GLTF数据为Three.js几何体
     */
    parseGLTFData(gltfData) {
        try {
            const geometry = new window.THREE.BufferGeometry();
            
            if (!gltfData.meshes || gltfData.meshes.length === 0) {
                console.warn('GLTF数据中没有网格信息，使用默认几何体');
                return new window.THREE.BoxGeometry(1, 1, 1);
            }
            
            const mesh = gltfData.meshes[0];
            const primitive = mesh.primitives[0];
            
            // 解析顶点属性
            if (primitive.attributes) {
                // 位置数据
                if (primitive.attributes.POSITION !== undefined) {
                    const positionAccessor = gltfData.accessors[primitive.attributes.POSITION];
                    const positionData = this.extractAccessorData(gltfData, positionAccessor);
                    geometry.setAttribute('position', new window.THREE.BufferAttribute(positionData, 3));
                }
                
                // 法线数据
                if (primitive.attributes.NORMAL !== undefined) {
                    const normalAccessor = gltfData.accessors[primitive.attributes.NORMAL];
                    const normalData = this.extractAccessorData(gltfData, normalAccessor);
                    geometry.setAttribute('normal', new window.THREE.BufferAttribute(normalData, 3));
                }
                
                // UV坐标
                if (primitive.attributes.TEXCOORD_0 !== undefined) {
                    const uvAccessor = gltfData.accessors[primitive.attributes.TEXCOORD_0];
                    const uvData = this.extractAccessorData(gltfData, uvAccessor);
                    geometry.setAttribute('uv', new window.THREE.BufferAttribute(uvData, 2));
                }
            }
            
            // 索引数据
            if (primitive.indices !== undefined) {
                const indexAccessor = gltfData.accessors[primitive.indices];
                const indexData = this.extractAccessorData(gltfData, indexAccessor);
                geometry.setIndex(new window.THREE.BufferAttribute(indexData, 1));
            }
            
            // 计算边界盒和法线
            geometry.computeBoundingBox();
            if (primitive.attributes.NORMAL === undefined) {
                geometry.computeVertexNormals();
            }
            
            return geometry;
            
        } catch (error) {
            console.error('解析GLTF数据失败:', error);
            // 返回默认几何体
            return new window.THREE.BoxGeometry(1, 1, 1);
        }
    }

    /**
     * 合并数据块为ArrayBuffer
     */
    mergeChunks(chunks, totalLength) {
        const arrayBuffer = new ArrayBuffer(totalLength);
        const uint8Array = new Uint8Array(arrayBuffer);
        let position = 0;
        
        for (const chunk of chunks) {
            uint8Array.set(chunk, position);
            position += chunk.length;
        }
        
        return arrayBuffer;
    }

    /**
     * 提取访问器数据
     */
    extractAccessorData(gltfData, accessor) {
        try {
            const bufferView = gltfData.bufferViews[accessor.bufferView];
            const buffer = gltfData.buffers[bufferView.buffer];
            
            // 处理base64编码的缓冲区数据
            let arrayBuffer;
            if (buffer.uri && buffer.uri.startsWith('data:')) {
                const base64Data = buffer.uri.split(',')[1];
                const binaryString = atob(base64Data);
                arrayBuffer = new ArrayBuffer(binaryString.length);
                const uint8Array = new Uint8Array(arrayBuffer);
                for (let i = 0; i < binaryString.length; i++) {
                    uint8Array[i] = binaryString.charCodeAt(i);
                }
            } else {
                throw new Error('不支持的缓冲区格式');
            }
            
            const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
            const componentType = accessor.componentType;
            const count = accessor.count * this.getComponentCount(accessor.type);
            
            // 根据组件类型创建相应的类型化数组
            switch (componentType) {
                case 5120: // BYTE
                    return new Int8Array(arrayBuffer, byteOffset, count);
                case 5121: // UNSIGNED_BYTE
                    return new Uint8Array(arrayBuffer, byteOffset, count);
                case 5122: // SHORT
                    return new Int16Array(arrayBuffer, byteOffset, count);
                case 5123: // UNSIGNED_SHORT
                    return new Uint16Array(arrayBuffer, byteOffset, count);
                case 5125: // UNSIGNED_INT
                    return new Uint32Array(arrayBuffer, byteOffset, count);
                case 5126: // FLOAT
                    return new Float32Array(arrayBuffer, byteOffset, count);
                default:
                    throw new Error(`不支持的组件类型: ${componentType}`);
            }
        } catch (error) {
            console.error('提取访问器数据失败:', error);
            return new Float32Array([]);
        }
    }

    /**
     * 获取组件数量
     */
    getComponentCount(type) {
        switch (type) {
            case 'SCALAR': return 1;
            case 'VEC2': return 2;
            case 'VEC3': return 3;
            case 'VEC4': return 4;
            case 'MAT2': return 4;
            case 'MAT3': return 9;
            case 'MAT4': return 16;
            default: return 1;
        }
    }

    /**
     * 初始化WASM解码器
     */




    /**
     * 性能监控工具
     */
    createPerformanceTracker(operationName) {
        const startTime = performance.now();
        const steps = new Map();
        
        return {
            step: (stepName) => {
                steps.set(stepName, performance.now() - startTime);
            },
            finish: () => {
                const totalTime = performance.now() - startTime;
                if (this.performanceConfig.enableLogging) {
                    console.log(`${this.performanceConfig.logPrefix} ${operationName}性能统计:`);
                    for (const [step, time] of steps) {
                        console.log(`   ${step}: ${time.toFixed(2)}ms`);
                    }
                    console.log(`   总耗时: ${totalTime.toFixed(2)}ms`);
                }
                return { steps: Object.fromEntries(steps), totalTime };
            }
        };
    }

    /**
     * 统一错误处理
     */
    handleError(operation, error) {
        const errorMessage = `${operation}失败: ${error.message}`;
        console.error(errorMessage, error);
        throw new Error(errorMessage);
    }

    /**
     * 获取缓存
     */
    getCached(key) {
        return this.cache.get(key);
    }

    setCached(key, value) {
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, value);
    }

    /**
     * 设置性能日志
     */
    setPerformanceLogging(enabled) {
        this.performanceConfig.enableLogging = enabled;
    }

    setCacheSize(size) {
        this.maxCacheSize = Math.max(1, size);
        // 如果当前缓存超过新限制，清理多余项
        while (this.cache.size > this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    clearCache() {
        this.cache.clear();
    }

    getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
            keys: Array.from(this.cache.keys())
        };
    }

    /**
     * 解析二进制数据头部信息
     */




    /**
     * 加载模型Blob数据
     */
    async loadModelBlob(filename, onProgress = null) {
        const tracker = this.createPerformanceTracker(`加载模型Blob: ${filename}`);
        
        try {
            console.log(`🚀 开始blob方式加载模型: ${filename}`);
            
            // 检查缓存
            const cacheKey = `blob_${filename}`;
            const cached = this.getCached(cacheKey);
            if (cached) {
                if (this.performanceConfig.enableLogging) {
                    console.log(`📦 从缓存加载模型: ${filename}`);
                }
                tracker.finish();
                return cached;
            }

            // 通过数据提供者获取模型数据
            const { arrayBuffer, headers } = await this.dataProvider.fetchModelBlob(filename, onProgress);
            tracker.step('数据获取');

            if (this.performanceConfig.enableLogging) {
                console.log(`📊 模型信息:`);
                console.log(`   原始大小: ${headers.originalSize} bytes`);
                console.log(`   压缩大小: ${headers.compressedSize} bytes`);
                console.log(`   压缩比: ${headers.compressionRatio}`);
                console.log(`   格式: ${headers.format}`);
            }

            console.log(`✅ 数据获取完成: ${arrayBuffer.byteLength} bytes`);
            
            // 解码二进制数据
            const decodedData = await this.decodeBinaryData(arrayBuffer);
            tracker.step('数据解码');
            
            // 转换为完整的Three.js模型
            const modelResult = await this.convertToThreeModel(decodedData);
            tracker.step('模型转换');
            
            const performanceStats = tracker.finish();
            
            const result = {
                model: modelResult,
                format: headers.format || 'blob',
                originalSize: parseInt(headers.originalSize),
                compressedSize: parseInt(headers.compressedSize),
                compressionRatio: parseFloat(headers.compressionRatio),
                performanceStats
            };
            
            // 缓存结果
            this.setCached(cacheKey, result);
            
            return result;
        } catch (error) {
            this.handleError('加载模型Blob', error);
        }
    }



    /**
     * 流式加载模型
     */
    async loadModelStream(filename, onProgress = null) {
        const tracker = this.createPerformanceTracker(`流式加载模型: ${filename}`);
        
        try {
            // 检查缓存
            const cacheKey = `stream_${filename}`;
            const cached = this.getCached(cacheKey);
            if (cached) {
                if (this.performanceConfig.enableLogging) {
                    console.log(`📦 从缓存加载流式模型: ${filename}`);
                }
                tracker.finish();
                return cached;
            }

            // 通过数据提供者获取流式数据
            const result = await this.dataProvider.fetchModelStream(filename, onProgress);
            tracker.step('流式数据获取');
            
            // 缓存结果
            this.setCached(cacheKey, result);
            
            const performanceStats = tracker.finish();
            return { ...result, performanceStats };
        } catch (error) {
            this.handleError('流式加载模型', error);
        }
    }

    /**
     * 解码二进制数据
     */
    async decodeBinaryData(arrayBuffer) {
        const tracker = this.createPerformanceTracker('解码二进制数据');
        
        try {
            // 使用注入的解码器服务
            const decodedData = await this.decoder.decodeBinaryData(arrayBuffer);
            
            tracker.finish();
            return decodedData;
        } catch (error) {
            tracker.finish();
            this.handleError('解码二进制数据', error);
        }
    }

    /**
     * 转换为Three.js几何体
     */
    async convertToThreeGeometry(gltfData) {
        const tracker = this.createPerformanceTracker('转换为Three.js几何体');
        
        try {
            // 检查是否有GLTFLoader可用
            if (typeof THREE !== 'undefined' && THREE.GLTFLoader) {
                const result = await this.loadWithGLTFLoader(gltfData);
                tracker.finish();
                return result;
            }
            
            // 降级到完整的GLTF解析
            const geometry = this.parseGLTFData(gltfData);
            
            tracker.finish();
            return geometry;
        } catch (error) {
            tracker.finish();
            this.handleError('转换为Three.js几何体', error);
        }
    }

    /**
     * 转换为Three.js模型
     */
    async convertToThreeModel(gltfData) {
        const tracker = this.createPerformanceTracker('转换为Three.js模型');
        
        try {
            // 检查数据类型
            if (gltfData instanceof ArrayBuffer) {
                // GLB二进制数据
                console.log('🔧 处理GLB二进制数据');
                if (typeof THREE !== 'undefined' && THREE.GLTFLoader) {
                    const result = await this.loadGLBFromArrayBuffer(gltfData);
                    tracker.finish();
                    return result;
                } else {
                    throw new Error('GLTFLoader不可用，无法加载GLB数据');
                }
            } else {
                // GLTF JSON数据
                console.log('🔧 处理GLTF JSON数据');
                
                // 检查是否包含原始格式数据（FBX等）
                if (gltfData.extensions && gltfData.extensions.FASTDOG_ORIGINAL_FORMAT) {
                    const originalFormat = gltfData.extensions.FASTDOG_ORIGINAL_FORMAT;
                    console.log(`🔧 检测到原始格式: ${originalFormat.format}`);
                    
                    if (originalFormat.format === '.fbx' && typeof THREE !== 'undefined' && THREE.FBXLoader) {
                        const result = await this.loadFBXFromBase64(originalFormat.data);
                        tracker.finish();
                        return result;
                    } else {
                        throw new Error(`不支持的原始格式: ${originalFormat.format} 或缺少相应的加载器`);
                    }
                }
                
                if (typeof THREE !== 'undefined' && THREE.GLTFLoader) {
                    const result = await this.loadCompleteModelWithGLTFLoader(gltfData);
                    tracker.finish();
                    return result;
                }
                
                // 降级到完整的GLTF解析
                const geometry = this.parseGLTFData(gltfData);
                
                // 检查Three.js是否可用
                if (typeof THREE === 'undefined') {
                    throw new Error('Three.js库未加载');
                }
                
                const material = new THREE.MeshStandardMaterial({
                    color: 0x667eea,
                    metalness: 0.3,
                    roughness: 0.4,
                });
                const model = new THREE.Mesh(geometry, material);
                
                tracker.finish();
                return {
                    model: model,
                    geometry: geometry
                };
            }
            
        } catch (error) {
            tracker.finish();
            this.handleError('转换为Three.js模型', error);
        }
    }

    /**
     * Base64转ArrayBuffer
     */
    base64ToArrayBuffer(base64Data) {
        const binaryString = atob(base64Data);
        const arrayBuffer = new ArrayBuffer(binaryString.length);
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }
        return arrayBuffer;
    }



    /**
     * 提取几何体数据
     */
    extractGeometry(model) {
        let geometry = null;
        model.traverse((child) => {
            if (child.isMesh && child.geometry && !geometry) {
                geometry = child.geometry;
            }
        });
        
        if (!geometry) {
            // 如果没有找到几何体，创建一个默认的
            geometry = new THREE.BoxGeometry(1, 1, 1);
        }
        
        return geometry;
    }

    /**
     * 从Base64加载FBX
     */
    async loadFBXFromBase64(base64Data) {
        const tracker = this.createPerformanceTracker('FBX加载');
        
        return new Promise((resolve, reject) => {
            try {
                if (this.performanceConfig.enableLogging) {
                    console.log('🎨 使用FBXLoader加载FBX数据');
                }
                
                // 转换数据格式
                const arrayBuffer = this.base64ToArrayBuffer(base64Data);
                tracker.step('数据转换');
                
                // 加载FBX模型
                const loader = new THREE.FBXLoader();
                const fbxModel = loader.parse(arrayBuffer, '');
                tracker.step('FBX解析');
                
                console.log('✅ FBXLoader加载成功');
                
                // 提取几何体
                const geometry = this.extractGeometry(fbxModel);
                tracker.step('几何体提取');
                
                const performanceStats = tracker.finish();
                
                // 返回完整的模型和几何体
                resolve({
                    model: fbxModel,
                    geometry: geometry,
                    performanceStats
                });
                
            } catch (error) {
                reject(new Error(`FBXLoader加载失败: ${error.message}`));
            }
        });
    }

    /**
     * 使用GLTFLoader加载
     */
    async loadWithGLTFLoader(gltfData) {
        return new Promise((resolve, reject) => {
            try {
                // 将GLTF数据转换为Blob URL
                const gltfBlob = new Blob([JSON.stringify(gltfData)], { type: 'application/json' });
                const gltfUrl = URL.createObjectURL(gltfBlob);
                
                const loader = new window.GLTFLoader();
                loader.load(
                    gltfUrl,
                    (gltf) => {
                        // 清理Blob URL
                        URL.revokeObjectURL(gltfUrl);
                        
                        // 提取几何体
                        let geometry = null;
                        gltf.scene.traverse((child) => {
                            if (child.isMesh && child.geometry) {
                                geometry = child.geometry;
                                return;
                            }
                        });
                        
                        if (!geometry) {
                            // 如果没有找到几何体，创建一个默认的
                            geometry = new window.THREE.BoxGeometry(1, 1, 1);
                        }
                        
                        resolve(geometry);
                    },
                    undefined,
                    (error) => {
                        URL.revokeObjectURL(gltfUrl);
                        reject(error);
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 使用GLTFLoader加载完整模型
     */
    async loadCompleteModelWithGLTFLoader(gltfData) {
        return new Promise((resolve, reject) => {
            try {
                console.log('🎨 使用GLTFLoader加载完整模型（包含材质）');
                
                // 将GLTF数据转换为Blob URL
                const gltfBlob = new Blob([JSON.stringify(gltfData)], { type: 'application/json' });
                const gltfUrl = URL.createObjectURL(gltfBlob);
                
                const loader = new window.GLTFLoader();
                loader.load(
                    gltfUrl,
                    (gltf) => {
                        // 清理Blob URL
                        URL.revokeObjectURL(gltfUrl);
                        
                        console.log('✅ GLTFLoader加载成功，保留完整材质');
                        
                        // 提取第一个几何体用于向后兼容
                        let geometry = null;
                        gltf.scene.traverse((child) => {
                            if (child.isMesh && child.geometry && !geometry) {
                                geometry = child.geometry;
                            }
                        });
                        
                        if (!geometry) {
                            // 如果没有找到几何体，创建一个默认的
                            geometry = new window.THREE.BoxGeometry(1, 1, 1);
                        }
                        
                        // 返回完整的模型和几何体
                        resolve({
                            model: gltf.scene,
                            geometry: geometry
                        });
                    },
                    undefined,
                    (error) => {
                        URL.revokeObjectURL(gltfUrl);
                        console.error('❌ GLTFLoader加载失败:', error);
                        reject(error);
                    }
                );
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 使用GLTFLoader加载GLB二进制数据
     */
    async loadGLBFromArrayBuffer(arrayBuffer) {
        return new Promise((resolve, reject) => {
            try {
                console.log('🔧 加载GLB ArrayBuffer数据，大小:', arrayBuffer.byteLength);
                
                // 直接从ArrayBuffer创建Blob URL，使用正确的GLB MIME类型
                const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });
                const url = URL.createObjectURL(blob);
                
                const loader = new window.GLTFLoader();
                loader.load(
                    url,
                    (gltf) => {
                        // 清理Blob URL
                        URL.revokeObjectURL(url);
                        console.log('✅ GLB模型加载成功');
                        
                        // 提取第一个几何体用于向后兼容
                        let geometry = null;
                        gltf.scene.traverse((child) => {
                            if (child.isMesh && child.geometry && !geometry) {
                                geometry = child.geometry;
                            }
                        });
                        
                        if (!geometry) {
                            // 如果没有找到几何体，创建一个默认的
                            geometry = new window.THREE.BoxGeometry(1, 1, 1);
                        }
                        
                        // 返回完整的模型和几何体
                        resolve({
                            model: gltf.scene,
                            geometry: geometry
                        });
                    },
                    undefined,
                    (error) => {
                        URL.revokeObjectURL(url);
                        console.error('❌ GLB模型加载失败:', error);
                        reject(error);
                    }
                );
            } catch (error) {
                console.error('❌ 创建GLB Blob失败:', error);
                reject(error);
            }
        });
    }



    /**
     * 加载模型主方法
     */
    async loadModel(filename, options = {}) {
        const {
            method = 'auto', // 'auto', 'blob', 'stream'
            onProgress = null,
            useCache = true
        } = options;
        
        const tracker = this.createPerformanceTracker('智能加载');
        
        try {
            console.log(`🤖 智能加载模型: ${filename}`);
            
            // 检查缓存
            if (useCache) {
                const cacheKey = `smart_${filename}`;
                const cached = this.getCached(cacheKey);
                if (cached) {
                    console.log('✅ 使用缓存数据');
                    return cached;
                }
            }
            
            let result;
            
            if (method === 'auto') {
                // 自动选择最佳方法
                try {
                    // 首先尝试获取模型信息来决定加载策略
                    const info = await this.dataProvider.getModelInfo(filename);
                    tracker.step('获取模型信息');
                    
                    // 根据文件大小选择加载方法
                    const sizeThreshold = 10 * 1024 * 1024; // 10MB
                    const useStream = info.size && info.size > sizeThreshold;
                    
                    if (useStream) {
                        console.log('📊 文件较大，使用流式加载');
                        result = await this.loadModelStream(filename, onProgress);
                    } else {
                        console.log('📊 文件较小，使用blob加载');
                        result = await this.loadModelBlob(filename, onProgress);
                    }
                } catch {
                    // 如果获取信息失败，默认使用blob方法
                    console.log('⚠️ 无法获取模型信息，使用默认blob加载');
                    result = await this.loadModelBlob(filename, onProgress);
                }
            } else if (method === 'blob') {
                result = await this.loadModelBlob(filename, onProgress);
            } else if (method === 'stream') {
                result = await this.loadModelStream(filename, onProgress);
            } else {
                throw new Error(`不支持的加载方法: ${method}`);
            }
            
            tracker.step('模型加载');
            
            // 缓存结果
            if (useCache) {
                const cacheKey = `smart_${filename}`;
                this.setCached(cacheKey, result);
            }
            
            const performanceStats = tracker.finish();
            result.smartLoadStats = performanceStats;
            
            return result;
            
        } catch (error) {
            this.handleError('智能加载模型', error);
        }
    }

    /**
     * 渐进式加载（分片加载）
     */
    async loadModelProgressive(filename, onProgress = null) {
        try {
            console.log(`📦 开始渐进式加载模型: ${filename}`);
            
            // 使用智能加载作为默认实现
            return await this.loadModel(filename, { onProgress });
            
        } catch (error) {
            this.handleError('渐进式加载模型', error);
        }
    }

    /**
     * 批量加载多个模型（支持并发和智能加载）
     */
    async loadMultipleModels(filenames, options = {}) {
        const {
            concurrent = 3, // 并发数量
            onProgress = null,
            useSmartLoad = true,
            continueOnError = true
        } = options;
        
        const tracker = this.createPerformanceTracker('批量加载');
        
        try {
            console.log(`📦 开始批量加载 ${filenames.length} 个模型（并发: ${concurrent}）`);
            
            const results = [];
            const total = filenames.length;
            let completed = 0;
            
            // 分批处理
            for (let i = 0; i < filenames.length; i += concurrent) {
                const batch = filenames.slice(i, i + concurrent);
                
                const batchPromises = batch.map(async (filename, batchIndex) => {
                    const globalIndex = i + batchIndex;
                    
                    try {
                        const loadMethod = useSmartLoad ? 
                            this.loadModel.bind(this) : 
                            this.loadModelBlob.bind(this);
                            
                        const result = await loadMethod(filename);
                        
                        completed++;
                        if (onProgress) {
                            onProgress({
                                stage: 'loading',
                                current: completed,
                                total: total,
                                filename: filename,
                                percentage: Math.round((completed / total) * 100)
                            });
                        }
                        
                        return { filename, result, success: true, index: globalIndex };
                        
                    } catch (error) {
                        completed++;
                        console.error(`加载模型失败: ${filename}`, error);
                        
                        if (onProgress) {
                            onProgress({
                                stage: 'error',
                                current: completed,
                                total: total,
                                filename: filename,
                                error: error.message,
                                percentage: Math.round((completed / total) * 100)
                            });
                        }
                        
                        if (!continueOnError) {
                            throw error;
                        }
                        
                        return { filename, error, success: false, index: globalIndex };
                    }
                });
                
                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults);
                
                tracker.step(`批次 ${Math.floor(i / concurrent) + 1}`);
            }
            
            // 按原始顺序排序
            results.sort((a, b) => a.index - b.index);
            
            const successCount = results.filter(r => r.success).length;
            const performanceStats = tracker.finish();
            
            console.log(`✅ 批量加载完成，成功: ${successCount}/${total}`);
            
            return {
                results: results.map(r => ({ filename: r.filename, result: r.result, error: r.error, success: r.success })),
                stats: {
                    total,
                    success: successCount,
                    failed: total - successCount,
                    performance: performanceStats
                }
            };
            
        } catch (error) {
            this.handleError('批量加载模型', error);
        }
    }

    /**
     * 预加载模型（后台加载，不阻塞当前操作）
     */
    async preloadModels(filenames, options = {}) {
        const {
            priority = 'low', // 'low', 'normal', 'high'
            onComplete = null
        } = options;
        
        console.log(`🔄 开始预加载 ${filenames.length} 个模型`);
        
        // 使用 setTimeout 来降低优先级
        const delay = priority === 'low' ? 100 : priority === 'normal' ? 50 : 0;
        
        setTimeout(async () => {
            try {
                const results = await this.loadMultipleModels(filenames, {
                    concurrent: priority === 'high' ? 5 : 2,
                    useSmartLoad: true,
                    continueOnError: true
                });
                
                console.log(`✅ 预加载完成: ${results.stats.success}/${results.stats.total}`);
                
                if (onComplete) {
                    onComplete(results);
                }
                
            } catch (error) {
                console.warn('预加载失败:', error);
                if (onComplete) {
                    onComplete({ error });
                }
            }
        }, delay);
        
        return Promise.resolve(); // 立即返回，不阻塞
    }
}

// ES6模块导出
export default WASMModelLoader;
export { WASMModelLoader };

// 为了兼容性，也添加到window对象
if (typeof window !== 'undefined') {
    window.WASMModelLoader = WASMModelLoader;
}