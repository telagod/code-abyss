# Glassmorphism 组件参考

## 模糊值参考

| 组件类型 | blur 值 | 用途 |
|----------|---------|------|
| 按钮/小控件 | `4–8px` | 轻微质感，不遮内容 |
| 卡片/面板 | `12–20px` | 标准毛玻璃 |
| 导航栏 | `20–30px` | 固定层需强隔离 |
| 模态遮罩 | `4–8px` | 背景虚化，聚焦前景 |
| 模态面板 | `24–40px` | 最大深度隔离 |

## 组件速查

共享：`backdrop-filter` + `-webkit-backdrop-filter` + `border: var(--glass-border)`

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
.glass-btn:focus-visible { outline: 2px solid var(--glass-accent); outline-offset: 2px; }
```

## 浏览器兼容与回退

| 特性 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| `backdrop-filter` | 76+ | 103+ | 9+(`-webkit-`) | 79+ |

```css
.glass-card { background: rgba(255,255,255,0.85); }
@supports (backdrop-filter: blur(1px)) {
  .glass-card { background: var(--glass-bg); backdrop-filter: var(--glass-blur);
    -webkit-backdrop-filter: var(--glass-blur); }
}
```

## 移动端性能

- 限制同屏 blur 元素 ≤ 3 个
- 滚动容器内避免 blur（触发逐帧重绘）
- 低端设备可用 `@media (hover: none)` 降级为纯色底
- `will-change: backdrop-filter` 仅在动画前设置，动画后移除

## 暗色模式

```css
[data-theme="dark"] .glass-card {
  background: rgba(0,0,0,0.35);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  color: rgba(255,255,255,0.9);
}
```

## 无障碍

```css
@media (prefers-reduced-motion: reduce) {
  .glass-card { backdrop-filter: none; -webkit-backdrop-filter: none;
    background: rgba(255,255,255,0.92); transition: none; }
}
@media (prefers-contrast: more) {
  .glass-card { background: rgba(255,255,255,0.85);
    border: 1px solid rgba(0,0,0,0.3); }
}
```
