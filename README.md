# 及时嗨 (GishaiVite)

一个基于 Vue 3 + TypeScript + Vite 构建的现代化 Web 应用，集成了地图展示、相册管理、主题切换等功能。

## ✨ 项目特性

### 🎨 现代化技术栈
- **Vue 3** - 使用 Composition API 和 `<script setup>` 语法
- **TypeScript** - 提供完整的类型安全支持
- **Vite** - 极速的开发服务器和构建工具
- **UnoCSS** - 原子化 CSS 框架，高性能样式解决方案
- **Element Plus** - 企业级 Vue 3 UI 组件库
- **Pinia** - Vue 3 官方推荐的状态管理库

### 🗺️ 地图功能
- **maptalks-gl** - 专业的 WebGL 地图渲染引擎
- **坐标转换** - 支持多种坐标系转换 (WGS84, GCJ02, BD09)
- **Web Workers** - 地理数据处理不阻塞主线程
- **交互式地图** - 支持缩放、平移、标记等交互操作

### 📸 相册管理
- **分类管理** - 支持相册分类和标签
- **地理位置** - 照片地理位置信息展示
- **响应式布局** - 适配各种屏幕尺寸
- **懒加载** - 图片懒加载优化性能

### 🎯 用户体验
- **主题切换** - 支持亮色/暗色主题
- **响应式设计** - 完美适配移动端和桌面端
- **路由懒加载** - 按需加载页面组件
- **代码分割** - 智能的 chunk 分离策略

### ⚡ 性能优化
- **Gzip/Brotli 压缩** - 减少资源传输大小
- **Tree Shaking** - 移除未使用的代码
- **异步组件** - 组件级别的懒加载
- **缓存策略** - 合理的浏览器缓存配置

## 🛠️ 技术栈

### 核心框架
- [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

### UI 和样式
- [Element Plus](https://element-plus.org/) - Vue 3 UI 组件库
- [UnoCSS](https://unocss.dev/) - 即时原子化 CSS 引擎
- [Iconify](https://iconify.design/) - 统一的图标框架

### 地图和数据
- [maptalks-gl](https://maptalks.org/) - WebGL 地图渲染引擎
- [gcoord](https://github.com/hujiulong/gcoord) - 地理坐标系转换库
- [Axios](https://axios-http.com/) - HTTP 客户端

### 开发工具
- [ESLint](https://eslint.org/) - 代码质量检查
- [Prettier](https://prettier.io/) - 代码格式化
- [Vue DevTools](https://devtools.vuejs.org/) - Vue 开发者工具

## 📦 项目结构

```
gishaivite/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口
│   ├── assets/            # 资源文件
│   ├── components/        # 组件
│   │   ├── common/        # 通用组件
│   │   ├── demo/          # 演示组件
│   │   ├── dialog/        # 对话框组件
│   │   ├── gallery/       # 相册组件
│   │   ├── layout/        # 布局组件
│   │   ├── map/           # 地图组件
│   │   └── sections/      # 页面区块组件
│   ├── composables/       # 组合式函数
│   ├── map/               # 地图相关
│   │   ├── constants.js   # 地图常量
│   │   ├── controls/      # 地图控件
│   │   ├── layers/        # 地图图层
│   │   ├── shaders/       # 着色器
│   │   └── tools/         # 地图工具
│   ├── plugins/           # 插件
│   ├── router/            # 路由配置
│   ├── stores/            # 状态管理
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   └── workers/           # Web Workers
├── docs/                  # 文档
├── scripts/               # 构建脚本
└── 配置文件...
```

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (推荐) 或 npm/yarn

### 安装依赖

```bash
# 使用 pnpm (推荐)
pnpm install

# 或使用 npm
npm install

# 或使用 yarn
yarn install
```

### 开发环境

```bash
# 启动开发服务器
pnpm dev

# 服务器将在 http://localhost:5173 启动
```

### 构建生产版本

```bash
# 类型检查 + 构建
pnpm build

# 仅构建 (跳过类型检查)
pnpm build-only

# 预览构建结果
pnpm preview
```

### 代码质量

```bash
# 运行 ESLint 检查并自动修复
pnpm lint

# 格式化代码
pnpm format

# TypeScript 类型检查
pnpm type-check
```

## 🔧 开发指南

### 推荐的 IDE 设置

- **编辑器**: [VSCode](https://code.visualstudio.com/)
- **插件**:
  - [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 3 语言支持
  - [TypeScript Vue Plugin](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) - TS 支持
  - [UnoCSS](https://marketplace.visualstudio.com/items?itemName=antfu.unocss) - UnoCSS 智能提示
  - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) - 代码检查
  - [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) - 代码格式化

### 环境变量

创建 `.env.local` 文件配置本地环境变量：

```bash
# API 基础路径
VITE_API_BASE_URL=http://localhost:8000/api

# 地图服务配置
VITE_MAP_TOKEN=your_map_token_here
```

### 代码规范

项目使用 ESLint + Prettier 确保代码质量和一致性：

- **ESLint**: 基于 Vue 3 + TypeScript 官方配置
- **Prettier**: 统一的代码格式化规则
- **提交前检查**: 使用 Git hooks 在提交前自动检查代码

### 组件开发

```vue
<!-- 推荐的组件模板 -->
<template>
  <div class="component-name">
    <!-- 组件内容 -->
  </div>
</template>

<script setup lang="ts">
// 使用 Composition API + TypeScript
import { ref, computed } from 'vue'

// 定义 props
interface Props {
  title: string
  count?: number
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

// 定义 emits
const emit = defineEmits<{
  update: [value: string]
}>()

// 响应式数据
const isVisible = ref(false)

// 计算属性
const displayText = computed(() => {
  return `${props.title}: ${props.count}`
})
</script>

<style scoped>
.component-name {
  /* 组件样式 */
}
</style>
```

## 📚 主要功能

### 地图功能

- **多图层支持**: 底图、矢量图层、标记图层
- **交互控件**: 缩放、平移、全屏、图层切换
- **数据可视化**: 支持 GeoJSON 数据展示
- **性能优化**: 使用 Web Workers 处理大量地理数据

### 相册系统

- **分类管理**: 支持多级分类和标签系统
- **批量操作**: 批量上传、删除、移动照片
- **地理标记**: 照片地理位置信息管理
- **搜索过滤**: 按时间、地点、标签搜索照片

### 主题系统

- **动态切换**: 支持亮色/暗色主题实时切换
- **自动适配**: 根据系统偏好自动选择主题
- **自定义配置**: 支持自定义主题色彩

## 🔗 相关链接

- [Vue 3 文档](https://vuejs.org/)
- [Vite 文档](https://vitejs.dev/)
- [UnoCSS 文档](https://unocss.dev/)
- [Element Plus 文档](https://element-plus.org/)
- [maptalks-gl 文档](https://maptalks.org/)

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 [Issue](https://github.com/your-username/gishaivite/issues)
- 发送邮件至: your-email@example.com
