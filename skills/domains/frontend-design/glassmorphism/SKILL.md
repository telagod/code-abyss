---
name: glassmorphism
description: Glassmorphism design system skill. Use when building frosted-glass UI components with blur, transparency, and layered depth effects.
license: MIT
user-invocable: false
disable-model-invocation: false
---

# Glassmorphism 设计规范

## 四要素

1. **透明** — `rgba()`/`hsla()` 半透明底，alpha `0.05–0.4`
2. **模糊** — `backdrop-filter: blur()` 8–40px，磨砂质感
3. **细边** — 半透明边框（`1px solid rgba(255,255,255,0.18)`）
4. **柔影** — 多层 `box-shadow` 营造纵深

## CSS Tokens

`@import 'references/tokens.css';` — 详见 [references/tokens.css](references/tokens.css)

## 组件速查

所有组件共享：`backdrop-filter: var(--glass-blur)` + `-webkit-backdrop-filter` + `border: var(--glass-border)`

```css
/* Card */
.glass-card { background: var(--glass-bg); backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur); border: var(--glass-border);
  border-radius: var(--glass-radius); box-shadow: var(--glass-shadow); padding: 1.5rem; }

/* Navbar */
.glass-nav { background: var(--glass-bg-heavy); backdrop-filter: var(--glass-blur-strong);
  -webkit-backdrop-filter: var(--glass-blur-strong); border-bottom: var(--glass-border);
  box-shadow: var(--glass-shadow); position: sticky; top: 0; z-index: 100; }

/* Modal */
.glass-modal-backdrop { background: rgba(0,0,0,0.4); backdrop-filter: blur(4px); }
.glass-modal { background: var(--glass-bg-heavy); backdrop-filter: var(--glass-blur-strong);
  -webkit-backdrop-filter: var(--glass-blur-strong); border: var(--glass-border);
  border-radius: var(--glass-radius-lg); box-shadow: var(--glass-shadow-elevated); }

/* Button */
.glass-btn { background: var(--glass-bg-light); backdrop-filter: var(--glass-blur-light);
  -webkit-backdrop-filter: var(--glass-blur-light); border: var(--glass-border);
  border-radius: var(--glass-radius); transition: background 0.2s; }
.glass-btn:hover { background: var(--glass-bg); }
```

## 浏览器兼容

| 特性 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| `backdrop-filter` | 76+ | 103+ | 9+(`-webkit-`) | 79+ |

须附 `-webkit-backdrop-filter`。Firefox <103 用 `@supports` 回退：

```css
.glass-card { background: rgba(255,255,255,0.85); }
@supports (backdrop-filter: blur(1px)) {
  .glass-card { background: var(--glass-bg); backdrop-filter: var(--glass-blur); }
}
```

## 无障碍

- 玻璃面文字须保 contrast ≥ 4.5:1，逐底色验证
- `prefers-reduced-transparency` 关闭模糊与透明
- `prefers-contrast: more` 增边框不透明度

```css
@media (prefers-reduced-transparency: reduce) {
  .glass-card { background: rgba(255,255,255,0.92); backdrop-filter: none; }
}
@media (prefers-contrast: more) {
  .glass-card { background: rgba(255,255,255,0.85); border: 1px solid rgba(0,0,0,0.3); }
}
```
