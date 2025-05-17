import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind3,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
  transformerCompileClass,
  transformerAttributifyJsx,
} from 'unocss'
// import presetWind3 from '@unocss/preset-wind3'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import presetDark from '@unocss/preset-mini'
import presetRemToPx from '@unocss/preset-rem-to-px'

import path from 'node:path'
import { globSync } from 'glob'

function getIcons(iconBasePath = 'src/assets/icons') {
  const icons = {}
  const files = globSync(`${iconBasePath}/**/*.svg`, { nodir: true, strict: true })
  files.forEach((filePath) => {
    const fileName = path.basename(filePath) // 获取文件名，包括后缀
    const fileNameWithoutExt = path.parse(fileName).name // 获取去除后缀的文件名
    const folderName = path.basename(path.dirname(filePath)) // 获取文件夹名
    if (!icons[folderName]) {
      icons[folderName] = []
    }
    icons[folderName].push(`i-${folderName}:${fileNameWithoutExt}`)
  })
  return icons
}

const iconBasePath = 'src/assets/icons'
const icons = getIcons(iconBasePath)
const collections2 = Object.fromEntries(
  Object.keys(icons).map((item) => [item, FileSystemIconLoader(`${iconBasePath}/${item}`)]),
)

// CSS变量定义
const cssVariables = {
  colors: {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-secondary)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    info: 'var(--color-info)',
    dark: 'var(--color-dark)',
    light: 'var(--color-light)',
    'light-border': 'var(--color-light-border)',
    'dark-border': 'var(--color-dark-border)',
  },
}

export default defineConfig({
  // 性能优化配置
  safelist: [
    // 确保关键类不被清除
    'btn',
    'btn-outline',
    'input-base',
    'card-base',
    'card-hover',
    // 确保响应式类不被清除
    'sm:flex',
    'md:flex',
    'lg:flex',
    'xl:flex',
    '2xl:flex',
    // 确保暗黑模式类不被清除
    'dark',
    'dark:bg-dark',
    'dark:text-white',
    'dark:bg-gray-800',
    'dark:text-gray-200',
    'dark:border-gray-700',
    // GIS相关类
    'map-container',
    'layer-control',
    'zoom-control',
    'legend-container',
  ],
  // 内容扫描配置
  content: {
    pipeline: {
      include: [
        // 扫描所有Vue文件
        '**/*.vue',
        // 扫描所有JS/TS文件
        '**/*.{js,ts}',
      ],
      // 排除node_modules和其他不需要扫描的目录
      exclude: ['node_modules/**/*', 'dist/**/*'],
    },
  },
  // 转换器配置
  transformers: [
    // 启用CSS指令转换器
    transformerDirectives(),
    // 启用变体组转换器
    transformerVariantGroup(),
    // 启用编译类转换器，提高性能
    transformerCompileClass(),
    // 支持JSX属性化语法
    transformerAttributifyJsx(),
  ],
  presets: [
    // 启用rem到px的自动转换，适合移动端
    presetRemToPx({
      baseFontSize: 16,
    }),
    presetIcons({
      warn: true,
      prefix: ['i-'],
      extraProperties: {
        display: 'inline-block',
      },
      collections: {
        custom: {
          circle: '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="50"></circle></svg>',
          square:
            '<svg viewBox="0 0 120 120"><rect x="10" y="10" width="100" height="100"></rect></svg>',
          triangle:
            '<svg viewBox="0 0 120 120"><polygon points="60,10 110,110 10,110"></polygon></svg>',
        },
        // 现有collections...
        // mdi: () => import('@iconify-json/mdi/icons.json').then((i) => i.default),
        // carbon: () => import('@iconify-json/carbon/icons.json').then((i) => i.default),
        tabler: () => import('@iconify-json/tabler/icons.json').then((i) => i.default),
        // 集成更多图标集
        ...collections2,
      },
    }),
    presetWind3(), // 启用Tailwind预设
    presetAttributify(), // 启用属性模式
    presetDark(), // 启用暗黑模式
    presetWebFonts({
      // 添加Web字体支持
      fonts: {
        // sans: 'Inter:400,500,600,700',
        // mono: 'Fira Code:400,500',
      },
    }),
  ],
  // 自定义变体
  variants: [
    // 鼠标悬停在父元素上时激活
    (matcher) => {
      if (!matcher.startsWith('parent-hover:')) return matcher
      return {
        // 去除前缀
        matcher: matcher.slice(13),
        // 添加选择器
        selector: (s) => `.parent:hover ${s}`,
      }
    },
    // 打印媒体查询
    (matcher) => {
      if (!matcher.startsWith('print:')) return matcher
      return {
        matcher: matcher.slice(6),
        selector: (s) => `@media print { ${s} }`,
      }
    },
    // GIS特定变体
    (matcher) => {
      if (!matcher.startsWith('map-active:')) return matcher
      return {
        matcher: matcher.slice(11),
        selector: (s) => `.map-active ${s}`,
      }
    },
  ],

  // 自定义规则
  rules: [
    // 卡片样式
    [
      'card-base',
      {
        'background-color': 'white',
        'border-radius': '0.75rem',
        'box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '1.5rem',
      },
    ],
    [
      'card-hover',
      {
        transform: 'translateY(-5px)',
        'box-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
      },
    ],
    // 渐变背景
    ['gradient-primary', { background: 'linear-gradient(135deg, #0066cc 0%, #004d99 100%)' }],
    ['gradient-secondary', { background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' }],
    ['gradient-success', { background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }],
    ['gradient-warning', { background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }],
    ['gradient-danger', { background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' }],

    // GIS特定样式
    ['map-container', { position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }],
    [
      'layer-control',
      {
        position: 'absolute',
        top: '10px',
        right: '10px',
        'z-index': '1000',
        background: 'white',
        padding: '0.5rem',
        'border-radius': '0.375rem',
        'box-shadow': '0 2px 4px rgba(0,0,0,0.1)',
      },
    ],
    ['zoom-control', { position: 'absolute', bottom: '20px', right: '10px', 'z-index': '1000' }],
    [
      'legend-container',
      {
        position: 'absolute',
        bottom: '20px',
        left: '10px',
        'z-index': '1000',
        background: 'white',
        padding: '0.5rem',
        'border-radius': '0.375rem',
        'box-shadow': '0 2px 4px rgba(0,0,0,0.1)',
      },
    ],
    // 响应式工具类
    [
      'responsive-container',
      { width: '100%', 'max-width': '1280px', margin: '0 auto', padding: '0 1rem' },
    ],
    [
      'responsive-grid',
      {
        display: 'grid',
        'grid-template-columns': 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
      },
    ],
    // 自定义动画
    ['animate-float', { animation: 'float 3s ease-in-out infinite' }],
    ['animate-pulse', { animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }],
    ['animate-bounce-slow', { animation: 'bounce 3s infinite' }],
    ['animate-fade-in', { animation: 'fadeIn 0.5s ease-in-out' }],
    ['animate-slide-in', { animation: 'slideIn 0.5s ease-in-out' }],
  ],
  // 静态快捷方式
  shortcuts: {
    btn: 'px-4 py-2 rounded inline-block bg-primary text-white cursor-pointer hover:bg-secondary transition-colors duration-300',
    'btn-outline':
      'px-4 py-2 rounded inline-block border border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300',
    'btn-success':
      'px-4 py-2 rounded inline-block bg-success text-white cursor-pointer hover:bg-success/80 transition-colors duration-300',
    'btn-danger':
      'px-4 py-2 rounded inline-block bg-danger text-white cursor-pointer hover:bg-danger/80 transition-colors duration-300',
    'input-base':
      'px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
    card: 'card-base hover:card-hover transition-all duration-300',
    'flex-center': 'flex items-center justify-center',
    'grid-responsive': 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4',

    // GIS相关快捷方式
    'map-btn':
      'px-3 py-1.5 rounded bg-white text-dark shadow-sm hover:shadow-md transition-shadow duration-200',
    'map-control': 'absolute z-10 bg-white rounded shadow-md p-2',
    'map-popup': 'p-3 max-w-xs bg-white rounded shadow-lg',
    'map-legend': 'flex flex-col gap-2 p-3 bg-white/90 rounded shadow-sm text-sm',

    // 响应式布局快捷方式
    'container-fluid': 'w-full px-4 mx-auto',
    'container-narrow': 'max-w-3xl mx-auto px-4',
    'container-wide': 'max-w-7xl mx-auto px-4',

    // 交互状态快捷方式
    interactive: 'transition-all duration-200 hover:opacity-80 active:opacity-70',
    focusable: 'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50',
  },
  // 自定义@keyframes动画
  theme: {
    ...cssVariables,
    ...{
      colors: {
        primary: '#0066cc',
        secondary: '#004d99',
        success: '#15803d',
        warning: '#f59e0b',
        danger: '#dc2626',
        info: '#3b82f6',
        dark: '#18181c',
        light: '#ffffff',
        light_border: '#efeff5',
        dark_border: '#2d2d30',
        // GIS特定颜色
        'map-highlight': '#ffcc00',
        'map-selection': '#3b82f6',
        'map-active': '#15803d',
        'map-inactive': '#9ca3af',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      // 自定义断点
      breakpoints: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    // 添加自定义动画关键帧
    animation: {
      durations: {
        fast: '0.2s',
        normal: '0.5s',
        slow: '1s',
        'very-slow': '2s',
      },
      timingFns: {
        'ease-in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease-out': 'cubic-bezier(0, 0, 0.2, 1)',
        'ease-in': 'cubic-bezier(0.4, 0, 1, 1)',
        bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulse: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        slideIn: {
          '0%': { transform: 'translateY(20px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        // 地图相关动画
        mapZoomIn: {
          '0%': { transform: 'scale(0.95)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        mapZoomOut: {
          '0%': { transform: 'scale(1.05)', opacity: 0 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        mapPulse: {
          '0%': { transform: 'scale(1)', 'box-shadow': '0 0 0 0 rgba(59, 130, 246, 0.7)' },
          '70%': { transform: 'scale(1.1)', 'box-shadow': '0 0 0 10px rgba(59, 130, 246, 0)' },
          '100%': { transform: 'scale(1)', 'box-shadow': '0 0 0 0 rgba(59, 130, 246, 0)' },
        },
      },
    },
    // 自定义阴影
    boxShadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
      none: 'none',
      // GIS特定阴影
      'map-control': '0 2px 6px rgba(0, 0, 0, 0.15)',
      'map-popup': '0 4px 12px rgba(0, 0, 0, 0.2)',
    },
  },
})
