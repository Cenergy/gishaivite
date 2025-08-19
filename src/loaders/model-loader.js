/**
 * WASM模型加载器 - ES6模块版本
 * 使用WebAssembly + 自定义二进制格式加载3D模型
 */

class WASMModelLoader {
    constructor(baseUrl = '/api/v1/resources', authToken = null) {
        this.baseUrl = baseUrl;
        this.authToken = authToken;
        this.wasmModule = null;
        this.isWasmReady = false;
        
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
     * 初始化WASM解码器
     */
    async initWASM() {
        if (this.isWasmReady) return true;
        
        try {
            // 动态导入WASM模块
            const wasmModule = await import('../wasm/fastdog_decoder.js');
            await wasmModule.default(); // 初始化WASM
            
            this.wasmModule = {
                // WASM解码接口
                decodeBinary: (data) => {
                    return wasmModule.decode_fastdog_binary(data);
                }
            };
            
            this.isWasmReady = true;
            console.log('✅ 解码器初始化成功');
            return true;
        } catch {
            console.warn('⚠️ WASM模块未找到，使用JavaScript解码器');
            this.wasmModule = {
                // 模拟WASM接口
                decodeBinary: (data, version = 1) => {
                    // 简单的解压缩实现
                    return this.fallbackDecode(data, version);
                }
            };
            this.isWasmReady = true;
            return true;
        }
    }

    /**
     * 备选解码实现
     */
    fallbackDecode(arrayBuffer, version = 1) {
        try {
            // 尝试使用pako解压缩
            if (typeof pako !== 'undefined') {
                const uint8Array = new Uint8Array(arrayBuffer);
                const decompressed = pako.inflate(uint8Array);
                return decompressed.buffer;
            } else {
                // 如果没有pako，直接返回原数据
                console.warn('⚠️ pako库未找到，返回原始数据');
                return arrayBuffer;
            }
        } catch (error) {
            console.error('❌ 备选解码失败:', error);
            return arrayBuffer;
        }
    }

    /**
     * 获取请求头
     */
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        return headers;
    }

    /**
     * 创建性能跟踪器
     */
    createPerformanceTracker(operationName) {
        const startTime = performance.now();
        return {
            end: () => {
                const endTime = performance.now();
                const duration = endTime - startTime;
                if (this.performanceConfig.enableLogging) {
                    console.log(`${this.performanceConfig.logPrefix} ${operationName}: ${duration.toFixed(2)}ms`);
                }
                return duration;
            }
        };
    }

    /**
     * 错误处理
     */
    handleError(operation, error) {
        console.error(`❌ ${operation} 失败:`, error);
        throw error;
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
        this.maxCacheSize = size;
        // 如果当前缓存超过新大小，清理多余项
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
     * 解析二进制头部
     */
    parseBinaryHeader(arrayBuffer) {
        try {
            const view = new DataView(arrayBuffer);
            const magic = view.getUint32(0, true);
            return {
                magic,
                version: view.getUint16(4, true),
                flags: view.getUint16(6, true),
                dataSize: view.getUint32(8, true),
                isValid: magic === 0x46444F47 // 'FDOG'
            };
        } catch (error) {
            return { isValid: false, error: error.message };
        }
    }

    /**
     * 使用pako解压缩
     */
    decompressWithPako(compressedData, version) {
        try {
            if (typeof pako === 'undefined') {
                throw new Error('pako库未加载');
            }

            const uint8Array = compressedData instanceof Uint8Array ? 
                compressedData : new Uint8Array(compressedData);
            
            let decompressed;
            if (version >= 2) {
                // 新版本使用deflate
                try {
                    decompressed = pako.inflate(uint8Array);
                } catch (deflateError) {
                    // 如果deflate失败，尝试gzip
                    console.warn('⚠️ deflate解压失败，尝试gzip:', deflateError.message);
                    decompressed = pako.ungzip(uint8Array);
                }
            } else {
                // 旧版本使用gzip
                decompressed = pako.ungzip(uint8Array);
            }
            
            return decompressed.buffer;
        } catch (error) {
            console.error('❌ pako解压缩失败:', error);
            throw error;
        }
    }

    /**
     * 获取模型信息
     */
    async getModelInfo(filename) {
        try {
            const response = await fetch(`${this.baseUrl}/models/${filename}/info`, {
                headers: this.getHeaders()
            });
            return await response.json();
        } catch (error) {
            this.handleError('获取模型信息', error);
        }
    }

    /**
     * 获取模型清单
     */
    async getModelManifest(filename) {
        const tracker = this.createPerformanceTracker(`获取模型清单: ${filename}`);
        try {
            const response = await fetch(`${this.baseUrl}/models/${filename}/manifest`, {
                headers: this.getHeaders()
            });
            const manifest = await response.json();
            tracker.end();
            return manifest;
        } catch (error) {
            tracker.end();
            this.handleError('获取模型清单', error);
        }
    }

    /**
     * 加载模型Blob数据
     */
    async loadModelBlob(filename, onProgress = null) {
        const tracker = this.createPerformanceTracker(`加载模型Blob: ${filename}`);
        
        try {
            // 检查缓存
            const cacheKey = `blob_${filename}`;
            const cached = this.getCached(cacheKey);
            if (cached) {
                if (this.performanceConfig.enableLogging) {
                    console.log(`📦 从缓存加载模型: ${filename}`);
                }
                tracker.end();
                return cached;
            }

            const response = await fetch(`${this.baseUrl}/models/${filename}/blob`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentLength = parseInt(response.headers.get('content-length') || '0');
            const reader = response.body?.getReader();
            
            if (!reader) {
                throw new Error('无法获取响应流');
            }

            const chunks = [];
            let receivedLength = 0;

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                chunks.push(value);
                receivedLength += value.length;
                
                if (onProgress && contentLength > 0) {
                    onProgress({
                        loaded: receivedLength,
                        total: contentLength,
                        percentage: (receivedLength / contentLength) * 100
                    });
                }
            }

            const result = this.mergeChunks(chunks, receivedLength);
            
            // 缓存结果
            this.setCached(cacheKey, result);
            
            tracker.end();
            return result;
        } catch (error) {
            tracker.end();
            this.handleError('加载模型Blob', error);
        }
    }

    /**
     * 合并数据块
     */
    mergeChunks(chunks, totalLength) {
        const result = new Uint8Array(totalLength);
        let position = 0;
        
        for (const chunk of chunks) {
            result.set(chunk, position);
            position += chunk.length;
        }
        
        return result.buffer;
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
                tracker.end();
                return cached;
            }

            const response = await fetch(`${this.baseUrl}/models/${filename}/stream`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const contentLength = parseInt(response.headers.get('content-length') || '0');
            const reader = response.body?.getReader();
            
            if (!reader) {
                throw new Error('无法获取响应流');
            }

            const chunks = [];
            let receivedLength = 0;

            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;
                
                chunks.push(value);
                receivedLength += value.length;
                
                if (onProgress && contentLength > 0) {
                    onProgress({
                        loaded: receivedLength,
                        total: contentLength,
                        percentage: (receivedLength / contentLength) * 100,
                        chunk: value
                    });
                }
            }

            const result = this.mergeChunks(chunks, receivedLength);
            
            // 缓存结果
            this.setCached(cacheKey, result);
            
            tracker.end();
            return result;
        } catch (error) {
            tracker.end();
            this.handleError('流式加载模型', error);
        }
    }

    /**
     * 解码二进制数据
     */
    async decodeBinaryData(arrayBuffer) {
        const tracker = this.createPerformanceTracker('解码二进制数据');
        
        try {
            // 确保WASM已初始化
            await this.initWASM();
            
            // 解析头部信息
            const header = this.parseBinaryHeader(arrayBuffer);
            if (!header.isValid) {
                throw new Error('无效的二进制格式');
            }
            
            // 提取数据部分（跳过头部）
            const dataStart = 12; // 头部大小
            const compressedData = arrayBuffer.slice(dataStart);
            
            // 使用WASM解码
            const decodedData = this.wasmModule.decodeBinary(compressedData, header.version);
            
            tracker.end();
            return decodedData;
        } catch (error) {
            tracker.end();
            this.handleError('解码二进制数据', error);
        }
    }

    /**
     * 转换为Three.js几何体
     */
    async convertToThreeGeometry(gltfData) {
        const tracker = this.createPerformanceTracker('转换为Three.js几何体');
        
        try {
            // 这里需要根据实际的GLTF数据结构进行转换
            // 简化实现，实际应用中需要完整的GLTF解析
            const geometry = {
                vertices: gltfData.vertices || [],
                indices: gltfData.indices || [],
                normals: gltfData.normals || [],
                uvs: gltfData.uvs || []
            };
            
            tracker.end();
            return geometry;
        } catch (error) {
            tracker.end();
            this.handleError('转换为Three.js几何体', error);
        }
    }

    /**
     * 转换为Three.js模型
     */
    async convertToThreeModel(gltfData) {
        const tracker = this.createPerformanceTracker('转换为Three.js模型');
        
        try {
            // 检查Three.js是否可用
            if (typeof THREE === 'undefined') {
                throw new Error('Three.js库未加载');
            }
            
            // 创建几何体
            const geometry = new THREE.BufferGeometry();
            
            if (gltfData.vertices) {
                geometry.setAttribute('position', new THREE.Float32BufferAttribute(gltfData.vertices, 3));
            }
            
            if (gltfData.normals) {
                geometry.setAttribute('normal', new THREE.Float32BufferAttribute(gltfData.normals, 3));
            }
            
            if (gltfData.uvs) {
                geometry.setAttribute('uv', new THREE.Float32BufferAttribute(gltfData.uvs, 2));
            }
            
            if (gltfData.indices) {
                geometry.setIndex(gltfData.indices);
            }
            
            // 创建材质
            const material = new THREE.MeshStandardMaterial({
                color: 0xffffff,
                metalness: 0.1,
                roughness: 0.8
            });
            
            // 创建网格
            const mesh = new THREE.Mesh(geometry, material);
            
            tracker.end();
            return mesh;
        } catch (error) {
            tracker.end();
            this.handleError('转换为Three.js模型', error);
        }
    }

    /**
     * Base64转ArrayBuffer
     */
    base64ToArrayBuffer(base64Data) {
        try {
            const binaryString = atob(base64Data);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes.buffer;
        } catch (error) {
            this.handleError('Base64转换', error);
        }
    }

    /**
     * 提取几何体数据
     */
    extractGeometry(model) {
        try {
            const geometry = {
                vertices: [],
                indices: [],
                normals: [],
                uvs: []
            };
            
            // 遍历模型的所有网格
            model.traverse((child) => {
                if (child.isMesh && child.geometry) {
                    const geo = child.geometry;
                    
                    if (geo.attributes.position) {
                        geometry.vertices.push(...geo.attributes.position.array);
                    }
                    
                    if (geo.attributes.normal) {
                        geometry.normals.push(...geo.attributes.normal.array);
                    }
                    
                    if (geo.attributes.uv) {
                        geometry.uvs.push(...geo.attributes.uv.array);
                    }
                    
                    if (geo.index) {
                        geometry.indices.push(...geo.index.array);
                    }
                }
            });
            
            return geometry;
        } catch (error) {
            this.handleError('提取几何体数据', error);
        }
    }

    /**
     * 从Base64加载FBX
     */
    async loadFBXFromBase64(base64Data) {
        const tracker = this.createPerformanceTracker('从Base64加载FBX');
        
        try {
            // 检查FBXLoader是否可用
            if (typeof THREE === 'undefined' || !THREE.FBXLoader) {
                throw new Error('FBXLoader未加载');
            }
            
            const arrayBuffer = this.base64ToArrayBuffer(base64Data);
            const loader = new THREE.FBXLoader();
            
            return new Promise((resolve, reject) => {
                loader.parse(arrayBuffer, '', (model) => {
                    tracker.end();
                    resolve(model);
                }, (error) => {
                    tracker.end();
                    reject(error);
                });
            });
        } catch (error) {
            tracker.end();
            this.handleError('从Base64加载FBX', error);
        }
    }

    /**
     * 使用GLTFLoader加载
     */
    async loadWithGLTFLoader(gltfData) {
        const tracker = this.createPerformanceTracker('使用GLTFLoader加载');
        
        try {
            // 检查GLTFLoader是否可用
            if (typeof THREE === 'undefined' || !THREE.GLTFLoader) {
                throw new Error('GLTFLoader未加载');
            }
            
            const loader = new THREE.GLTFLoader();
            
            return new Promise((resolve, reject) => {
                if (typeof gltfData === 'string') {
                    // 如果是URL
                    loader.load(gltfData, (gltf) => {
                        tracker.end();
                        resolve(gltf);
                    }, undefined, (error) => {
                        tracker.end();
                        reject(error);
                    });
                } else {
                    // 如果是ArrayBuffer
                    loader.parse(gltfData, '', (gltf) => {
                        tracker.end();
                        resolve(gltf);
                    }, (error) => {
                        tracker.end();
                        reject(error);
                    });
                }
            });
        } catch (error) {
            tracker.end();
            this.handleError('使用GLTFLoader加载', error);
        }
    }

    /**
     * 使用GLTFLoader加载完整模型
     */
    async loadCompleteModelWithGLTFLoader(gltfData) {
        const tracker = this.createPerformanceTracker('使用GLTFLoader加载完整模型');
        
        try {
            const gltf = await this.loadWithGLTFLoader(gltfData);
            
            // 处理动画
            const animations = gltf.animations || [];
            
            // 处理场景
            const scene = gltf.scene;
            
            // 设置材质
            scene.traverse((child) => {
                if (child.isMesh) {
                    // 确保材质正确设置
                    if (child.material) {
                        child.material.needsUpdate = true;
                    }
                    
                    // 启用阴影
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            
            tracker.end();
            return {
                scene,
                animations,
                cameras: gltf.cameras || [],
                asset: gltf.asset || {}
            };
        } catch (error) {
            tracker.end();
            this.handleError('使用GLTFLoader加载完整模型', error);
        }
    }

    /**
     * 从ArrayBuffer加载GLB
     */
    async loadGLBFromArrayBuffer(arrayBuffer) {
        const tracker = this.createPerformanceTracker('从ArrayBuffer加载GLB');
        
        try {
            // 检查GLTFLoader是否可用
            if (typeof THREE === 'undefined' || !THREE.GLTFLoader) {
                throw new Error('GLTFLoader未加载');
            }
            
            const loader = new THREE.GLTFLoader();
            
            return new Promise((resolve, reject) => {
                loader.parse(arrayBuffer, '', (gltf) => {
                    // 处理加载的模型
                    const model = gltf.scene;
                    
                    // 计算边界盒
                    const box = new THREE.Box3().setFromObject(model);
                    const center = box.getCenter(new THREE.Vector3());
                    const size = box.getSize(new THREE.Vector3());
                    
                    // 居中模型
                    model.position.sub(center);
                    
                    tracker.end();
                    resolve({
                        model,
                        animations: gltf.animations || [],
                        boundingBox: { center, size },
                        originalGltf: gltf
                    });
                }, undefined, (error) => {
                    tracker.end();
                    reject(error);
                });
            });
        } catch (error) {
            tracker.end();
            this.handleError('从ArrayBuffer加载GLB', error);
        }
    }

    /**
     * 解析GLTF数据
     */
    parseGLTFData(gltfData) {
        try {
            const parsed = {
                vertices: [],
                indices: [],
                normals: [],
                uvs: [],
                materials: [],
                textures: []
            };
            
            // 解析网格数据
            if (gltfData.meshes) {
                for (const mesh of gltfData.meshes) {
                    for (const primitive of mesh.primitives) {
                        // 解析顶点数据
                        if (primitive.attributes.POSITION !== undefined) {
                            const accessor = gltfData.accessors[primitive.attributes.POSITION];
                            const vertices = this.extractAccessorData(gltfData, accessor);
                            parsed.vertices.push(...vertices);
                        }
                        
                        // 解析法线数据
                        if (primitive.attributes.NORMAL !== undefined) {
                            const accessor = gltfData.accessors[primitive.attributes.NORMAL];
                            const normals = this.extractAccessorData(gltfData, accessor);
                            parsed.normals.push(...normals);
                        }
                        
                        // 解析UV数据
                        if (primitive.attributes.TEXCOORD_0 !== undefined) {
                            const accessor = gltfData.accessors[primitive.attributes.TEXCOORD_0];
                            const uvs = this.extractAccessorData(gltfData, accessor);
                            parsed.uvs.push(...uvs);
                        }
                        
                        // 解析索引数据
                        if (primitive.indices !== undefined) {
                            const accessor = gltfData.accessors[primitive.indices];
                            const indices = this.extractAccessorData(gltfData, accessor);
                            parsed.indices.push(...indices);
                        }
                    }
                }
            }
            
            return parsed;
        } catch (error) {
            this.handleError('解析GLTF数据', error);
        }
    }

    /**
     * 提取访问器数据
     */
    extractAccessorData(gltfData, accessor) {
        try {
            const bufferView = gltfData.bufferViews[accessor.bufferView];
            const buffer = gltfData.buffers[bufferView.buffer];
            
            // 获取二进制数据
            let arrayBuffer;
            if (typeof buffer.uri === 'string' && buffer.uri.startsWith('data:')) {
                // Base64编码的数据
                const base64Data = buffer.uri.split(',')[1];
                arrayBuffer = this.base64ToArrayBuffer(base64Data);
            } else {
                // 外部文件或已加载的ArrayBuffer
                arrayBuffer = buffer.arrayBuffer || buffer;
            }
            
            const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
            const componentCount = this.getComponentCount(accessor.type);
            
            // 根据组件类型创建相应的类型化数组
            let TypedArray;
            switch (accessor.componentType) {
                case 5120: TypedArray = Int8Array; break;      // BYTE
                case 5121: TypedArray = Uint8Array; break;     // UNSIGNED_BYTE
                case 5122: TypedArray = Int16Array; break;     // SHORT
                case 5123: TypedArray = Uint16Array; break;    // UNSIGNED_SHORT
                case 5125: TypedArray = Uint32Array; break;    // UNSIGNED_INT
                case 5126: TypedArray = Float32Array; break;   // FLOAT
                default: throw new Error(`不支持的组件类型: ${accessor.componentType}`);
            }
            
            const elementCount = accessor.count * componentCount;
            const typedArray = new TypedArray(arrayBuffer, byteOffset, elementCount);
            
            return Array.from(typedArray);
        } catch (error) {
            this.handleError('提取访问器数据', error);
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
            default: throw new Error(`未知的类型: ${type}`);
        }
    }

    /**
     * 加载模型主方法
     */
    async loadModel(filename, options = {}) {
        const tracker = this.createPerformanceTracker(`加载模型: ${filename}`);
        
        try {
            const {
                useStream = false,
                format = 'auto',
                enableCache = true,
                onProgress = null
            } = options;
            
            // 检查缓存
            if (enableCache) {
                const cacheKey = `model_${filename}_${JSON.stringify(options)}`;
                const cached = this.getCached(cacheKey);
                if (cached) {
                    if (this.performanceConfig.enableLogging) {
                        console.log(`📦 从缓存加载模型: ${filename}`);
                    }
                    tracker.end();
                    return cached;
                }
            }
            
            // 确保WASM已初始化
            await this.initWASM();
            
            // 根据选项选择加载方式
            let arrayBuffer;
            if (useStream) {
                arrayBuffer = await this.loadModelStream(filename, onProgress);
            } else {
                arrayBuffer = await this.loadModelBlob(filename, onProgress);
            }
            
            // 解码二进制数据
            const decodedData = await this.decodeBinaryData(arrayBuffer);
            
            // 根据格式转换数据
            let result;
            if (format === 'geometry') {
                result = await this.convertToThreeGeometry(decodedData);
            } else if (format === 'model') {
                result = await this.convertToThreeModel(decodedData);
            } else {
                // 自动检测格式
                result = await this.convertToThreeModel(decodedData);
            }
            
            // 缓存结果
            if (enableCache) {
                const cacheKey = `model_${filename}_${JSON.stringify(options)}`;
                this.setCached(cacheKey, result);
            }
            
            tracker.end();
            return result;
        } catch (error) {
            tracker.end();
            this.handleError('加载模型', error);
        }
    }

    /**
     * 渐进式加载模型
     */
    async loadModelProgressive(filename, onProgress = null) {
        const tracker = this.createPerformanceTracker(`渐进式加载模型: ${filename}`);
        
        try {
            // 首先加载低质量版本
            const lowQualityModel = await this.loadModel(`${filename}_low`, {
                format: 'model',
                onProgress: (progress) => {
                    if (onProgress) {
                        onProgress({ ...progress, stage: 'low-quality', percentage: progress.percentage * 0.3 });
                    }
                }
            });
            
            // 然后加载高质量版本
            const highQualityModel = await this.loadModel(filename, {
                format: 'model',
                onProgress: (progress) => {
                    if (onProgress) {
                        onProgress({ ...progress, stage: 'high-quality', percentage: 30 + progress.percentage * 0.7 });
                    }
                }
            });
            
            tracker.end();
            return {
                lowQuality: lowQualityModel,
                highQuality: highQualityModel
            };
        } catch (error) {
            tracker.end();
            this.handleError('渐进式加载模型', error);
        }
    }

    /**
     * 批量加载多个模型
     */
    async loadMultipleModels(filenames, options = {}) {
        const tracker = this.createPerformanceTracker(`批量加载${filenames.length}个模型`);
        
        try {
            const {
                concurrent = 3,
                onProgress = null,
                onModelLoaded = null
            } = options;
            
            const results = [];
            const total = filenames.length;
            let completed = 0;
            
            // 分批并发加载
            for (let i = 0; i < filenames.length; i += concurrent) {
                const batch = filenames.slice(i, i + concurrent);
                const batchPromises = batch.map(async (filename, index) => {
                    try {
                        const model = await this.loadModel(filename, {
                            onProgress: (progress) => {
                                if (onProgress) {
                                    const globalProgress = {
                                        filename,
                                        modelIndex: i + index,
                                        modelProgress: progress.percentage,
                                        totalProgress: ((completed + progress.percentage / 100) / total) * 100
                                    };
                                    onProgress(globalProgress);
                                }
                            }
                        });
                        
                        completed++;
                        
                        if (onModelLoaded) {
                            onModelLoaded({
                                filename,
                                model,
                                index: i + index,
                                completed,
                                total
                            });
                        }
                        
                        return { filename, model, success: true };
                    } catch (error) {
                        completed++;
                        console.error(`❌ 加载模型失败: ${filename}`, error);
                        return { filename, error, success: false };
                    }
                });
                
                const batchResults = await Promise.all(batchPromises);
                results.push(...batchResults);
            }
            
            tracker.end();
            return results;
        } catch (error) {
            tracker.end();
            this.handleError('批量加载模型', error);
        }
    }

    /**
     * 预加载模型
     */
    async preloadModels(filenames, options = {}) {
        const tracker = this.createPerformanceTracker(`预加载${filenames.length}个模型`);
        
        try {
            const {
                priority = 'low',
                onProgress = null
            } = options;
            
            // 使用较低的并发数进行预加载
            const concurrent = priority === 'high' ? 3 : 1;
            
            const results = await this.loadMultipleModels(filenames, {
                concurrent,
                onProgress,
                onModelLoaded: (info) => {
                    if (this.performanceConfig.enableLogging) {
                        console.log(`📦 预加载完成: ${info.filename} (${info.completed}/${info.total})`);
                    }
                }
            });
            
            tracker.end();
            return results;
        } catch (error) {
            tracker.end();
            this.handleError('预加载模型', error);
        }
    }
}

// ES6模块导出
export default WASMModelLoader;
export { WASMModelLoader };

// 为了兼容性，也添加到window对象
if (typeof window !== 'undefined') {
    window.WASMModelLoader = WASMModelLoader;
}