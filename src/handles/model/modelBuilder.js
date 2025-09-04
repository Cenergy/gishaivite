import { THREE, GLTFLoader, FBXLoader } from '@/utils/three.js';

/**
 * ModelBuilder 类 - 负责处理所有模型构建和格式转换逻辑
 * 从 ModelDecoder 中提取的模型构建相关功能
 */
export class ModelBuilder {
  constructor() {}

  /**
   * 使用 GLTFLoader 构建模型
   * @param {*} modelData - 模型数据
   * @returns {Promise<Object>} 构建结果 { model, geometry }
   */
  async buildModelWithGLTFLoader(modelData) {
    return new Promise((resolve, reject) => {
      try {
        console.log('🎨 开始解析模型数据');
        console.log('📊 传入数据类型:', typeof modelData);
        console.log('📊 传入数据内容:', modelData);

        // 检测并处理特殊格式（FBX等）
        const specialFormatResult = this._detectAndProcessFormat(modelData);
        if (specialFormatResult) {
          resolve(specialFormatResult);
          return;
        }

        // GLTF/GLB格式处理
        const loader = new GLTFLoader();
        const dataToParse = this._prepareGLTFData(modelData);

        console.log('📊 解析数据类型:', typeof dataToParse);

        // 直接使用parse方法解析GLTF JSON数据，无需创建Blob URL
        loader.parse(
          dataToParse, // 传入正确格式的数据
          '', // 资源路径（空字符串表示无外部资源）
          (gltf) => {
            console.log('✅ GLTFLoader直接解析成功，保留完整材质');

            // 使用通用的几何体提取方法
            const geometry = this._extractGeometry(gltf.scene);

            // 返回完整的模型和几何体
            resolve({
              model: gltf.scene || new THREE.Object3D(),
              geometry: geometry,
            });
          },
          (error) => {
            console.error('❌ GLTFLoader直接解析失败:', error);
            reject(error);
          },
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 将base64字符串转换为ArrayBuffer的通用方法
   * @param {string} base64Data - base64编码的数据
   * @returns {ArrayBuffer} 转换后的ArrayBuffer
   */
  _base64ToArrayBuffer(base64Data) {
    try {
      const binaryString = atob(base64Data);
      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      return arrayBuffer;
    } catch (error) {
      throw new Error(`Base64数据转换失败: ${error.message}`);
    }
  }

  /**
   * 处理FBX格式数据的通用方法
   * @param {string} fbxData - FBX格式的base64数据
   * @returns {Object} 处理结果 { model, geometry }
   */
  _processFBXData(fbxData) {
    try {
      const arrayBuffer = this._base64ToArrayBuffer(fbxData);
      const loader = new FBXLoader();
      const fbxModel = loader.parse(arrayBuffer, '');

      console.log('✅ FBXLoader解析成功');

      const geometry = this._extractGeometry(fbxModel);
      return {
        model: fbxModel,
        geometry: geometry,
      };
    } catch (error) {
      throw new Error(`FBX数据解析失败: ${error.message}`);
    }
  }

  /**
   * 检测并处理不同的数据格式
   * @param {*} modelData - 模型数据
   * @returns {Object|null} 处理结果或null（表示需要用GLTF处理）
   */
  _detectAndProcessFormat(modelData) {
    // 检查是否包含原始格式数据（FBX等）
    if (
      typeof modelData === 'object' &&
      modelData !== null &&
      'extensions' in modelData &&
      typeof modelData.extensions === 'object' &&
      modelData.extensions !== null &&
      'FASTDOG_ORIGINAL_FORMAT' in modelData.extensions
    ) {
      const originalFormat = modelData.extensions.FASTDOG_ORIGINAL_FORMAT;
      console.log(`🔧 检测到原始格式: ${originalFormat.format}`);

      if (originalFormat.format === '.fbx') {
        console.log('📊 检测到FBX格式，使用FBXLoader');
        return this._processFBXData(originalFormat.data);
      } else {
        throw new Error(`不支持的原始格式: ${originalFormat.format}`);
      }
    }

    // 检查直接的FBX格式标识
    if (
      typeof modelData === 'object' &&
      modelData !== null &&
      modelData.type === 'fbx' &&
      modelData.data
    ) {
      console.log('📊 检测到直接FBX格式，使用FBXLoader');
      return this._processFBXData(modelData.data);
    }

    // 返回null表示不是特殊格式，需要用GLTF处理
    return null;
  }

  /**
   * 准备GLTF解析数据
   * @param {*} modelData - 模型数据
   * @returns {*} 准备好的数据
   */
  _prepareGLTFData(modelData) {
    if (modelData instanceof ArrayBuffer) {
      console.log('📊 检测到GLB二进制数据，大小:', modelData.byteLength, '字节');
      return modelData;
    } else if (
      typeof modelData === 'object' &&
      modelData !== null &&
      modelData.type === 'glb' &&
      modelData.data
    ) {
      console.log('📊 检测到WASM解码器GLB对象格式，转换base64数据');
      const arrayBuffer = this._base64ToArrayBuffer(modelData.data);
      console.log('📊 GLB数据转换完成，大小:', arrayBuffer.byteLength, '字节');
      return arrayBuffer;
    } else if (typeof modelData === 'string') {
      return modelData;
    } else if (typeof modelData === 'object' && modelData !== null) {
      return JSON.stringify(modelData);
    } else {
      throw new Error('无效的模型数据格式');
    }
  }

  /**
   * 提取模型几何体的通用方法
   * @param {THREE.Object3D} modelObj - 模型对象
   * @returns {THREE.Geometry} 提取的几何体
   */
  _extractGeometry(modelObj) {
    let geometry = null;
    modelObj.traverse((child) => {
      if (child.isMesh && child.geometry && !geometry) {
        geometry = child.geometry;
      }
    });
    return geometry || new THREE.BoxGeometry(1, 1, 1);
  }

  /**
   * 获取文件加载器
   * @param {string} extension - 文件扩展名
   * @returns {GLTFLoader|FBXLoader} 对应的加载器实例
   */
  _getFileLoader(extension) {
    if (extension === 'gltf' || extension === 'glb') {
      return new GLTFLoader();
    } else if (extension === 'fbx') {
      return new FBXLoader();
    } else {
      throw new Error(`不支持的文件格式: ${extension}`);
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    // 目前没有需要清理的资源
  }

  /**
   * 销毁构建器
   */
  dispose() {
    this.cleanup();
  }
}

// 导出单例实例
export default new ModelBuilder();