import { defineConfig, presetAttributify, presetWind } from 'unocss'

export default defineConfig({
  presets: [
    presetWind(), // 启用Tailwind预设
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