// 外部脚本类型声明

declare global {
  interface Window {
    FastDogWASMDecoder: any
    WASMModelLoader: any
  }
}

// WASM解码器类型
export interface FastDogWASMDecoder {
  init(): Promise<void>
  decode(data: ArrayBuffer): Promise<any>
  getStats(): any
  clearCache(): void
}

// 模型加载器类型
export interface WASMModelLoader {
  loadModel(modelId: string, options?: any): Promise<any>
  getProgress(): number
  cancel(): void
  getStats(): any
}

export {}