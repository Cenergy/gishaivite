/**
 * HTTP数据提供者 - 负责处理所有网络请求
 * 实现数据获取与业务逻辑的分离
 */
import * as resources from "@/api/resources"

class HttpDataProvider {
    constructor() {
        // 所有网络请求都通过 resources API 处理
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
            return await resources.getModelInfo(filename);
        } catch (error) {
            this.handleError('获取模型信息', error);
        }
    }

    /**
     * 获取模型清单
     */
    async getModelManifest(filename) {
        try {
            return await resources.getModelManifest(filename);
        } catch (error) {
            this.handleError('获取模型清单', error);
        }
    }

    /**
     * 获取模型Blob数据
     */
    async fetchModelBlob(filename, onProgress = null) {
        try {
            return await resources.fetchModelBlob(filename, onProgress);
        } catch (error) {
            this.handleError('获取模型Blob数据', error);
        }
    }

    /**
     * 获取模型流数据
     */
    async fetchModelStream(filename, onProgress = null) {
        try {
            return await resources.fetchModelStream(filename, onProgress);
        } catch (error) {
            this.handleError('获取模型流数据', error);
        }
    }


}

export default HttpDataProvider;
export { HttpDataProvider };

// 浏览器全局变量支持
if (typeof window !== 'undefined') {
    window.HttpDataProvider = HttpDataProvider;
}