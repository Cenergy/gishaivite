// TypeScript 声明文件 for map module

// 控制器类型声明
export interface MapController {
  init(): void;
  destroy(): void;
  [key: string]: unknown;
}

// 导出的控制器
export declare const home: MapController;
export declare const test: MapController;

// 重新导出所有控制器
export * from './controls';