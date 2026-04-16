---
name: claymorphism
description: Claymorphism design system skill. Use when building soft, puffy, clay-like UI components with large radii, dual inner shadows, and offset outer shadows.
license: MIT
user-invocable: false
disable-model-invocation: false
---

# Claymorphism 设计规范

## 三要素

1. **大圆角** — `border-radius` 20–50px，膨胀饱满
2. **双内影** — 左上亮 inset + 右下暗 inset，模拟 3D 黏土面
3. **偏移外影** — 方向性 `box-shadow`（非居中），锚定元素

## CSS Tokens

`@import 'references/tokens.css';` — 详见 [references/tokens.css](references/tokens.css)

## 组件速查

所有组件共享：`border: none` / `color: var(--clay-text)`

```css
/* Card */
.clay-card { background: var(--clay-bg-card); border-radius: var(--clay-radius-lg);
  box-shadow: var(--clay-shadow); padding: 1.5rem; color: var(--clay-text); }

/* Button — hover 浮起，active 按压 */
.clay-btn { background: var(--clay-bg-button); border: none;
  border-radius: var(--clay-radius-pill); box-shadow: var(--clay-shadow);
  padding: 0.75rem 1.5rem; color: var(--clay-text);
  cursor: pointer; transition: box-shadow 0.2s; }
.clay-btn:hover { box-shadow: var(--clay-shadow-elevated); }
.clay-btn:active { box-shadow: var(--clay-shadow-pressed); }

/* Input */
.clay-input { background: var(--clay-bg); border: none;
  border-radius: var(--clay-radius); box-shadow: var(--clay-shadow-pressed);
  padding: 0.75rem 1rem; color: var(--clay-text); }
.clay-input:focus { outline: 2px solid var(--clay-accent); outline-offset: 2px; }

/* Toggle */
.clay-toggle { width: 56px; height: 30px; background: var(--clay-bg-card);
  border-radius: var(--clay-radius-pill); box-shadow: var(--clay-shadow-pressed); }
.clay-toggle-knob { width: 24px; height: 24px; background: var(--clay-bg);
  border-radius: 50%; box-shadow: var(--clay-shadow); transition: transform 0.2s; }
```

## 暗色模式

- 内高光减弱（`rgba(255,255,255,0.05)` 替代 `0.6`），避免发光伪影
- 外影不透明度增大以维持暗底纵深；底色偏暖深调，忌纯黑
- 暗色 token 定义于 `tokens.css` 之 `[data-theme="dark"]`

## 无障碍

- 文字对比度须 ≥ 4.5:1，黏土底色偏柔须验证 `--clay-text`
- 须提供可见 `:focus` 轮廓；`prefers-contrast: more` 平化阴影增强对比

```css
@media (prefers-contrast: more) {
  .clay-card { box-shadow: 0 0 0 2px var(--clay-text); }
}
```
