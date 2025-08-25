/**
 * HTTP数据提供者 - 负责处理所有网络请求
 * 实现数据获取与业务逻辑的分离
 */

class HttpDataProvider {
    constructor(baseUrl = '/api/v1/resources', authToken = null) {
        this.baseUrl = baseUrl;
        this.authToken = authToken;
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
     * 统一错误处理
     */
    handleError(operation, error) {
        const errorMessage = `${operation}失败: ${error.message}`;
        console.error(errorMessage, error);
        throw new Error(errorMessage);
    }

    /**
     * 获取模型信息
     */
    async getModelInfo(filename) {
        try {
            const response = await fetch(`${this.baseUrl}/models/${filename}/info`, {
                headers: this.getHeaders()
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            this.handleError('获取模型信息', error);
        }
    }

    /**
     * 获取模型清单
     */
    async getModelManifest(filename) {
        try {
            const response = await fetch(`${this.baseUrl}/models/${filename}/manifest`, {
                headers: this.getHeaders()
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            this.handleError('获取模型清单', error);
        }
    }

    /**
     * 获取模型Blob数据
     */
    async fetchModelBlob(filename, onProgress = null) {
        try {
            const response = await fetch(`${this.baseUrl}/models/${filename}/blob`, {
                headers: this.getHeaders()
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // 获取响应头信息
            const headers = {
                originalSize: response.headers.get('X-Original-Size'),
                compressedSize: response.headers.get('X-Compressed-Size'),
                compressionRatio: response.headers.get('X-Compression-Ratio'),
                format: response.headers.get('X-Format')
            };

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

            return {
                arrayBuffer: this.mergeChunks(chunks, receivedLength),
                headers
            };
        } catch (error) {
            this.handleError('获取模型Blob数据', error);
        }
    }

    /**
     * 获取模型流数据
     */
    async fetchModelStream(filename, onProgress = null) {
        try {
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

            return this.mergeChunks(chunks, receivedLength);
        } catch (error) {
            this.handleError('获取模型流数据', error);
        }
    }

    /**
     * 合并数据块为ArrayBuffer
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
     * 设置认证令牌
     */
    setAuthToken(token) {
        this.authToken = token;
    }

    /**
     * 设置基础URL
     */
    setBaseUrl(url) {
        this.baseUrl = url;
    }

    /**
     * 获取当前配置
     */
    getConfig() {
        return {
            baseUrl: this.baseUrl,
            hasAuthToken: !!this.authToken
        };
    }
}

export default HttpDataProvider;
export { HttpDataProvider };

// 浏览器全局变量支持
if (typeof window !== 'undefined') {
    window.HttpDataProvider = HttpDataProvider;
}