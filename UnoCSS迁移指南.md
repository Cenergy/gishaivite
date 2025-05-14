# UnoCSS 迁移指南

## 项目CSS迁移计划

本文档提供了将项目中传统CSS样式替换为UnoCSS原子类的详细指南。

### 已完成的UnoCSS配置

项目已经完成了UnoCSS的基本配置：

- `uno.config.ts` 文件已配置，启用了Tailwind预设和属性模式
- `vite.config.ts` 中已添加UnoCSS插件
- `main.ts` 中已导入UnoCSS样式
- 项目中已有`UnoTest.vue`组件作为UnoCSS使用示例

### 迁移策略

1. **保留全局CSS变量**：在`base.css`中定义的CSS变量（如颜色、间距等）应保留，这些变量可以在UnoCSS中使用

2. **组件迁移优先级**：
   - 首先迁移简单组件（如WelcomeItem）
   - 然后迁移复杂组件（如BlogSection、ToolsSection等）
   - 最后处理布局组件（如App.vue、HomeView.vue）

3. **迁移方法**：
   - 对于简单样式，直接使用UnoCSS的原子类替换
   - 对于复杂样式，可以使用UnoCSS的组合功能或保留少量CSS
   - 对于动画和过渡效果，可以使用UnoCSS的动画类或保留原CSS

### 常见CSS属性对应的UnoCSS类

| CSS属性 | UnoCSS类 | 示例 |
|---------|----------|------|
| display: flex | flex | `<div class="flex">` |
| flex-direction: column | flex-col | `<div class="flex flex-col">` |
| justify-content: center | justify-center | `<div class="flex justify-center">` |
| align-items: center | items-center | `<div class="flex items-center">` |
| margin: 1rem | m-4 | `<div class="m-4">` |
| padding: 1rem | p-4 | `<div class="p-4">` |
| width: 100% | w-full | `<div class="w-full">` |
| height: 100% | h-full | `<div class="h-full">` |
| border-radius: 0.25rem | rounded | `<div class="rounded">` |
| background-color: #fff | bg-white | `<div class="bg-white">` |
| color: #000 | text-black | `<div class="text-black">` |
| font-weight: bold | font-bold | `<div class="font-bold">` |
| font-size: 1.5rem | text-2xl | `<div class="text-2xl">` |
| box-shadow | shadow | `<div class="shadow">` |

### 示例转换

#### 原CSS样式：
```css
.card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
  padding: 2rem;
  width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
```

#### 转换为UnoCSS：
```html
<div class="bg-white rounded-xl shadow-lg p-8 w-[300px] flex flex-col items-center text-center">
  <!-- 内容 -->
</div>
```

### 使用属性模式

UnoCSS的属性模式允许将样式作为HTML属性应用：

```html
<!-- 传统类模式 -->
<div class="flex items-center justify-between p-4 bg-blue-500 text-white">
  内容
</div>

<!-- 属性模式 -->
<div flex items-center justify-between p-4 bg-blue-500 text-white>
  内容
</div>
```

### 复杂样式处理建议

1. **媒体查询**：使用UnoCSS的响应式前缀
   - `sm:` - 小屏幕
   - `md:` - 中等屏幕
   - `lg:` - 大屏幕
   - `xl:` - 超大屏幕

   例如：`<div class="w-full md:w-1/2 lg:w-1/3">`

2. **悬停状态**：使用`hover:`前缀
   例如：`<button class="bg-blue-500 hover:bg-blue-600">`

3. **动画**：对于简单动画可以使用UnoCSS的transition类，复杂动画可以保留CSS

4. **自定义样式**：对于非常特殊的样式，可以在`uno.config.ts`中添加自定义规则

### 迁移后的维护建议

1. 尽量使用UnoCSS的原子类，减少自定义CSS的使用
2. 对于新组件，直接使用UnoCSS开发
3. 保持`uno.config.ts`文件的更新，添加项目所需的自定义规则
4. 考虑创建常用组合的快捷方式，提高开发效率

### 参考资源

- [UnoCSS官方文档](https://unocss.dev/)
- [Tailwind CSS参考](https://tailwindcss.com/docs)
- [Attributify Mode文档](https://unocss.dev/presets/attributify)