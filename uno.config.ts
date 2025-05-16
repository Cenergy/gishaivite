import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind3,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'
// import presetWind3 from '@unocss/preset-wind3'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
import presetDark from '@unocss/preset-mini'

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
    'dark:bg-dark',
    'dark:text-white',
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
  ],
  presets: [
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
  // 自定义主题配置已移至下方合并
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
  // 自定义快捷方式
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
  },
  // 自定义@keyframes动画
  theme: {
    ...{
      colors: {
        primary: '#0066cc',
        secondary: '#004d99',
        success: '#15803d',
        warning: '#f59e0b',
        danger: '#dc2626',
        info: '#3b82f6',
        dark: '#18181c',
        light_border: '#efeff5',
        dark_border: '#2d2d30',
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
      },
    },
  },
})
