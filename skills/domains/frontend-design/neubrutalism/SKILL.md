---
name: neubrutalism
description: Neubrutalism design system skill. Use when building bold UI with thick borders, offset solid shadows, high saturation colors, and minimal border radius.
license: MIT
user-invocable: false
disable-model-invocation: false
---

# Neubrutalism 设计规范

## 核心五要

1. **粗框** — `3–5px solid` 黑边
2. **硬影** — 零模糊 `box-shadow`（`5px 5px 0 #000`）
3. **高饱和** — 浓烈填色：粉、黄、蓝、绿
4. **锐角** — `border-radius` 0–8px
5. **纯平** — 无渐变、无模糊、无透明

## CSS Tokens

`@import 'references/tokens.css';` — 详见 [references/tokens.css](references/tokens.css)

## 组件速查

所有组件共享：`border: var(--nb-border)` / `border-radius: var(--nb-radius)` / `font-family: var(--nb-font)`

```css
/* Card */
.nb-card { background: var(--nb-white); border: var(--nb-border-thick);
  border-radius: var(--nb-radius); box-shadow: var(--nb-shadow); padding: 1.5rem; }

/* Button — hover 左上偏移放大影，active 右下归位消影 */
.nb-btn { background: var(--nb-yellow); box-shadow: var(--nb-shadow-sm);
  padding: 0.6rem 1.4rem; font-weight: var(--nb-font-weight);
  cursor: pointer; transition: transform 0.1s, box-shadow 0.1s; }
.nb-btn:hover { transform: translate(-2px, -2px); box-shadow: var(--nb-shadow); }
.nb-btn:active { transform: translate(3px, 3px); box-shadow: none; }

/* Navbar */
.nb-nav { background: var(--nb-bg); border-bottom: var(--nb-border-thick);
  padding: 1rem 2rem; position: sticky; top: 0; z-index: 100; }

/* Input — focus 时影扩大 */
.nb-input { background: var(--nb-white); box-shadow: var(--nb-shadow-sm);
  padding: 0.6rem 1rem; font-weight: var(--nb-font-weight-body); }
.nb-input:focus { outline: none; box-shadow: var(--nb-shadow); }

/* Badge */
.nb-badge { background: var(--nb-pink); padding: 0.2rem 0.8rem;
  font-weight: var(--nb-font-weight); font-size: 0.85rem; }
```

## 字体

粗体几何无衬线（Space Grotesk、Inter）。标题 `700`，正文 `500`，大写仅限标签。

```css
h1, h2, h3 { font-family: var(--nb-font-heading); font-weight: var(--nb-font-weight);
  letter-spacing: var(--nb-letter-spacing); }
body { font-family: var(--nb-font); font-weight: var(--nb-font-weight-body); }
```

## 无障碍

- 粗框利于弱视辨识；文字于彩底须保 contrast ≥ 4.5:1
- hover/active `transform` 须备 `prefers-reduced-motion` 回退

```css
@media (prefers-reduced-motion: reduce) {
  .nb-btn:hover, .nb-btn:active { transform: none; }
}
```
