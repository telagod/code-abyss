---
name: designing-liquid-glass
description: Apple Liquid Glass design system. Use when building UI with translucent, depth-aware glass morphism following Apple's design language. Provides CSS tokens, component patterns, dark/light mode, and animation specs.
license: MIT
user-invocable: false
disable-model-invocation: false
---

# Liquid Glass 设计规范

Apple 风格半透明玻璃 UI：纵深、折射、环境光响应。

## 五则

1. **透光** — 表面经 backdrop blur 透出下层
2. **纵深** — 元素浮于不同 z 层，写实阴影
3. **环境感应** — 玻璃色调随底层内容偏移
4. **极简边界** — 形状与模糊界定边缘，非描边
5. **物理动效** — 弹簧曲线，带惯性

## CSS Tokens

`@import 'references/tokens.css';` — 详见 [references/tokens.css](references/tokens.css)

| 类别 | 前缀 | 示例 |
|------|------|------|
| 玻璃底 | `--lg-bg-*` | `--lg-bg-primary` |
| 模糊 | `--lg-blur-*` | `--lg-blur-md` |
| 边框 | `--lg-border-*` | `--lg-border-color` |
| 阴影 | `--lg-shadow-*` | `--lg-shadow-elevated` |
| 圆角 | `--lg-radius-*` | `--lg-radius-lg` |
| 动画 | `--lg-duration-*` | `--lg-duration-normal` |
| 饱和 | `--lg-saturate` | `1.8` |

## 关键约束

- `backdrop-filter` 须附 `-webkit-` 前缀；`linear()` easing 较新，回退用 `cubic-bezier`
- 同屏 blur 元素 ≤ 3 个；低端设备降级为纯色
- 玻璃面文字须保 `contrast-ratio ≥ 4.5:1`，用 text-shadow 或垫层兜底
- `prefers-reduced-motion: reduce` 禁弹簧动画；`prefers-contrast: more` 替换为实色

组件 CSS、暗色模式、动画、无障碍详见 [references/components.md](references/components.md)
