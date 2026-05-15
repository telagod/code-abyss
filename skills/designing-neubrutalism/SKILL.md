---
name: designing-neubrutalism
description: Neubrutalism design system skill. Use when building bold UI with thick borders, offset solid shadows, high saturation colors, and minimal border radius.
user-invocable: false
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

## 字体

粗体几何无衬线（Space Grotesk、Inter）。标题 `700`，正文 `500`，大写仅限标签。

## 关键约束

- 高饱和底色须验证文字对比度 ≥ 4.5:1
- `:focus-visible` 轮廓 ≥ 3px，与底色有足够反差
- `transition` 时长 ≥ `0.2s`
- 暗色模式用语义 token 切换，勿直接交换黑白

配色表、组件 CSS、暗色模式、无障碍详见 [references/components.md](references/components.md)
