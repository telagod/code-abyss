---
name: designing-glassmorphism
description: Glassmorphism design system skill. Use when building frosted-glass UI components with blur, transparency, and layered depth effects.
user-invocable: false
---

# Glassmorphism 设计规范

## 四要素

1. **透明** — `rgba()`/`hsla()` 半透明底，alpha `0.05–0.4`
2. **模糊** — `backdrop-filter: blur()` 磨砂质感
3. **细边** — 半透明边框 `1px solid rgba(255,255,255,0.18)`
4. **柔影** — 多层 `box-shadow` 营造纵深

## CSS Tokens

`@import 'references/tokens.css';` — 详见 [references/tokens.css](references/tokens.css)

## 关键约束

- `backdrop-filter` 须附 `-webkit-` 前缀；不支持时用 `@supports` 回退高不透明度纯色底
- 同屏 blur 元素 ≤ 3 个；滚动容器内避免 blur
- 玻璃面文字须保 contrast ≥ 4.5:1，逐底色验证
- `prefers-reduced-motion: reduce` 禁动画；`prefers-contrast: more` 增边框不透明度

模糊值参考、组件 CSS、暗色模式、回退策略、无障碍详见 [references/components.md](references/components.md)
