---
name: designing-claymorphism
description: Claymorphism design system skill. Use when building soft, puffy, clay-like UI components with large radii, dual inner shadows, and offset outer shadows.
user-invocable: false
---

# Claymorphism 设计规范

## 三要素

1. **大圆角** — `border-radius` 20–50px，膨胀饱满
2. **双内影** — 左上亮 inset + 右下暗 inset，模拟 3D 黏土面
3. **偏移外影** — 方向性 `box-shadow`（非居中），锚定元素

## CSS Tokens

`@import 'references/tokens.css';` — 详见 [references/tokens.css](references/tokens.css)

## 关键约束

- 文字对比度 ≥ 4.5:1，黏土柔色底须逐一验证 `--clay-text`
- 须提供可见 `:focus-visible` 轮廓
- `prefers-contrast: more` 平化阴影、增强边界
- 暗色模式：内亮影须大幅减弱，忌纯黑底

组件 CSS、动画、暗色模式、无障碍详见 [references/components.md](references/components.md)
