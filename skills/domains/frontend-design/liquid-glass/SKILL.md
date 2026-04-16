---
name: liquid-glass
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

## 组件速查

```css
/* Card — hover 上浮加深影 */
.glass-card { background: var(--lg-bg-primary);
  backdrop-filter: blur(var(--lg-blur-md));
  -webkit-backdrop-filter: blur(var(--lg-blur-md));
  border: 1px solid var(--lg-border-color); border-radius: var(--lg-radius-lg);
  box-shadow: var(--lg-shadow-elevated);
  transition: transform var(--lg-duration-normal) var(--lg-easing-spring); }
.glass-card:hover { transform: translateY(-2px); box-shadow: var(--lg-shadow-high); }

/* Toolbar */
.glass-toolbar { background: var(--lg-bg-toolbar);
  backdrop-filter: blur(var(--lg-blur-lg)) saturate(var(--lg-saturate));
  -webkit-backdrop-filter: blur(var(--lg-blur-lg)) saturate(var(--lg-saturate));
  border-bottom: 1px solid var(--lg-border-subtle); }

/* Button — active 缩放 */
.glass-btn { background: var(--lg-bg-interactive);
  backdrop-filter: blur(var(--lg-blur-sm));
  border: 1px solid var(--lg-border-color); border-radius: var(--lg-radius-md);
  transition: all var(--lg-duration-fast) var(--lg-easing-spring); }
.glass-btn:active { transform: scale(0.97); background: var(--lg-bg-pressed); }

/* Modal */
.glass-overlay { background: var(--lg-bg-scrim); backdrop-filter: blur(var(--lg-blur-xl)); }
.glass-modal { background: var(--lg-bg-elevated); border: 1px solid var(--lg-border-color);
  border-radius: var(--lg-radius-xl); box-shadow: var(--lg-shadow-high); }
```

## 明暗模式

Token 经 `prefers-color-scheme` 自动切换。亮用白调玻璃，暗用深调配更强模糊。

```css
.light-glass { color-scheme: light; }
.dark-glass  { color-scheme: dark; }
```

## 动画

弹簧缓动，物理质感：

```css
@keyframes glass-enter {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.glass-animate-in {
  animation: glass-enter var(--lg-duration-normal) var(--lg-easing-spring) both;
}
```

## 无障碍

- 玻璃面文字须保 `contrast-ratio ≥ 4.5:1`
- 遵循 `prefers-reduced-motion`：禁模糊动画，仅用 opacity 过渡
- `prefers-contrast: high` 将半透明底替换为实色
