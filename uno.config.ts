import { defineConfig, presetAttributify,presetIcons } from 'unocss';
import presetWind3 from '@unocss/preset-wind3';
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'

import path from 'node:path'
import { globSync } from 'glob'

function getIcons() {
  const icons = {}
  const files = globSync('src/assets/icons/**/*.svg', { nodir: true, strict: true })
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

const icons = getIcons()
const collections2 = Object.fromEntries(Object.keys(icons).map(item => [item, FileSystemIconLoader(`src/assets/icons/${item}`)]))


export default defineConfig({
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
        },
        ...collections2,
      },
    }),
    presetWind3(), // 启用Tailwind预设
    presetAttributify(), // 启用属性模式
  ],
  // 自定义主题配置
  theme: {
    colors: {
      'primary': '#0066cc',
      'secondary': '#004d99',
      'success': '#15803d',
      'warning': '#f59e0b',
      'danger': '#dc2626',
      'info': '#3b82f6',
      'dark': '#18181c',
      'light_border': '#efeff5',
      'dark_border': '#2d2d30',
    },
    fontFamily: {
      sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
    },
    // 自定义断点
    breakpoints: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
  },
  // 自定义规则
  rules: [
    // 卡片样式
    ['card-base', { 'background-color': 'white', 'border-radius': '0.75rem', 'box-shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', 'padding': '1.5rem' }],
    ['card-hover', { 'transform': 'translateY(-5px)', 'box-shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', 'transition': 'all 0.3s ease' }],
    // 渐变背景
    ['gradient-primary', { 'background': 'linear-gradient(135deg, #0066cc 0%, #004d99 100%)' }],
    // 自定义动画
    ['animate-float', { 'animation': 'float 3s ease-in-out infinite' }],
  ],
  // 自定义快捷方式
  shortcuts: {
    'btn': 'px-4 py-2 rounded inline-block bg-primary text-white cursor-pointer hover:bg-secondary transition-colors duration-300',
    'btn-outline': 'px-4 py-2 rounded inline-block border border-primary text-primary hover:bg-primary hover:text-white transition-colors duration-300',
    'input-base': 'px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
  },
})