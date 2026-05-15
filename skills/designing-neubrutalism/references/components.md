# Neubrutalism 组件参考

## WCAG AA 配色参考

高饱和底色须验证文字对比度 ≥ 4.5:1。安全组合：

| 底色 | 文字色 | 对比度 |
|------|--------|--------|
| `#FFD600`(黄) | `#000` | 14.4:1 |
| `#FF6B9D`(粉) | `#000` | 6.2:1 |
| `#4ECDC4`(青) | `#000` | 8.6:1 |
| `#FF4444`(红) | `#fff` | 4.6:1 |
| `#2D2D2D`(深灰) | `#fff` | 12.6:1 |

避免：浅色底 + 白字、深饱和蓝底 + 黑字。

## 组件速查

共享：`border: var(--nb-border)` / `border-radius: var(--nb-radius)` / `font-family: var(--nb-font)`

```css
/* Card */
.nb-card { background: var(--nb-white); border: var(--nb-border-thick);
  border-radius: var(--nb-radius); box-shadow: var(--nb-shadow); padding: 1.5rem; }

/* Button — hover 偏移放大影，active 归位消影 */
.nb-btn { background: var(--nb-yellow); box-shadow: var(--nb-shadow-sm);
  padding: 0.6rem 1.4rem; font-weight: var(--nb-font-weight);
  cursor: pointer; transition: transform 0.2s ease-out, box-shadow 0.2s ease-out; }
.nb-btn:hover { transform: translate(-2px, -2px); box-shadow: var(--nb-shadow); }
.nb-btn:active { transform: translate(3px, 3px); box-shadow: none; }
.nb-btn:focus-visible { outline: 3px solid var(--nb-accent, #4ECDC4);
  outline-offset: 2px; }

/* Navbar */
.nb-nav { background: var(--nb-bg); border-bottom: var(--nb-border-thick);
  padding: 1rem 2rem; position: sticky; top: 0; z-index: 100; }

/* Input — focus 时影扩大 */
.nb-input { background: var(--nb-white); box-shadow: var(--nb-shadow-sm);
  padding: 0.6rem 1rem; font-weight: var(--nb-font-weight-body); }
.nb-input:focus { outline: none; box-shadow: var(--nb-shadow); }
.nb-input:focus-visible { outline: 3px solid var(--nb-accent, #4ECDC4);
  outline-offset: 2px; }

/* 表单验证态 */
.nb-input[aria-invalid="true"] { border-color: var(--nb-error, #FF4444);
  box-shadow: 4px 4px 0 var(--nb-error, #FF4444); }
.nb-input:valid { border-color: var(--nb-success, #2ECC71); }
.nb-input:disabled { opacity: 0.5; cursor: not-allowed; }

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

## 暗色模式

用语义 token 切换，勿直接交换黑白。

```css
[data-theme="dark"] {
  --nb-bg: #1a1a2e;
  --nb-surface: #2d2d44;
  --nb-text: #f0f0f0;
  --nb-border-color: #f0f0f0;
  --nb-shadow-color: rgba(0,0,0,0.6);
}
.nb-card { background: var(--nb-surface); color: var(--nb-text);
  border-color: var(--nb-border-color);
  box-shadow: 5px 5px 0 var(--nb-shadow-color); }
```

## 无障碍

```css
@media (prefers-reduced-motion: reduce) {
  .nb-btn { transition: none; }
  .nb-btn:hover, .nb-btn:active { transform: none; }
}
```
