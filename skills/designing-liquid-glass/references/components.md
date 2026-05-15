# Liquid Glass 组件参考

## 浏览器支持

| 特性 | Chrome | Firefox | Safari | Edge |
|------|--------|---------|--------|------|
| `backdrop-filter` | 76+ | 103+ | 9+(`-webkit-`) | 79+ |
| `filter: saturate()` | 53+ | 35+ | 9.1+ | 79+ |
| `linear()` easing | 113+ | 112+ | 17.2+ | 113+ |

须附 `-webkit-backdrop-filter`。`saturate()` 支持广泛，但 `linear()` easing 较新，回退用 `cubic-bezier`。

## 组件速查

```css
/* Card — hover 上浮加深影 */
.glass-card { background: var(--lg-bg-primary);
  backdrop-filter: blur(var(--lg-blur-md)) saturate(var(--lg-saturate));
  -webkit-backdrop-filter: blur(var(--lg-blur-md)) saturate(var(--lg-saturate));
  border: 1px solid var(--lg-border-color); border-radius: var(--lg-radius-lg);
  box-shadow: var(--lg-shadow-elevated);
  transition: transform var(--lg-duration-normal) var(--lg-easing-spring); }
.glass-card:hover { transform: translateY(-2px); box-shadow: var(--lg-shadow-high); }

/* Toolbar */
.glass-toolbar { background: var(--lg-bg-toolbar);
  backdrop-filter: blur(var(--lg-blur-lg)) saturate(var(--lg-saturate));
  -webkit-backdrop-filter: blur(var(--lg-blur-lg)) saturate(var(--lg-saturate));
  border-bottom: 1px solid var(--lg-border-subtle);
  position: sticky; top: 0; z-index: 100; }

/* Button — active 缩放 */
.glass-btn { background: var(--lg-bg-interactive);
  backdrop-filter: blur(var(--lg-blur-sm));
  -webkit-backdrop-filter: blur(var(--lg-blur-sm));
  border: 1px solid var(--lg-border-color); border-radius: var(--lg-radius-md);
  transition: all var(--lg-duration-fast) var(--lg-easing-spring); }
.glass-btn:hover { background: var(--lg-bg-hover); }
.glass-btn:active { transform: scale(0.97); background: var(--lg-bg-pressed); }
.glass-btn:focus-visible { outline: 2px solid var(--lg-accent); outline-offset: 2px; }

/* Modal */
.glass-overlay { background: var(--lg-bg-scrim); backdrop-filter: blur(var(--lg-blur-xl));
  -webkit-backdrop-filter: blur(var(--lg-blur-xl)); }
.glass-modal { background: var(--lg-bg-elevated); border: 1px solid var(--lg-border-color);
  border-radius: var(--lg-radius-xl); box-shadow: var(--lg-shadow-high); }

/* Tab Bar */
.glass-tabs { display: flex; gap: 0; background: var(--lg-bg-primary);
  backdrop-filter: blur(var(--lg-blur-md)) saturate(var(--lg-saturate));
  -webkit-backdrop-filter: blur(var(--lg-blur-md)) saturate(var(--lg-saturate));
  border-radius: var(--lg-radius-lg); padding: 4px; }
.glass-tab { flex: 1; text-align: center; padding: 0.5rem 1rem;
  border-radius: var(--lg-radius-md); transition: background var(--lg-duration-fast); }
.glass-tab[aria-selected="true"] { background: var(--lg-bg-elevated);
  box-shadow: var(--lg-shadow-elevated); }

/* Notification */
.glass-toast { background: var(--lg-bg-elevated);
  backdrop-filter: blur(var(--lg-blur-lg)) saturate(var(--lg-saturate));
  -webkit-backdrop-filter: blur(var(--lg-blur-lg)) saturate(var(--lg-saturate));
  border: 1px solid var(--lg-border-subtle); border-radius: var(--lg-radius-lg);
  box-shadow: var(--lg-shadow-high); padding: 0.75rem 1.25rem; }
```

## 文字对比度

半透明底上文字易失对比。策略：

```css
.glass-text-safe { text-shadow: 0 0 8px rgba(0,0,0,0.3); }
.glass-label::before { content: ''; position: absolute; inset: -2px -6px;
  background: rgba(0,0,0,0.25); border-radius: 4px; z-index: -1; }
```

暗色模式下用 `rgba(0,0,0,0.5)` 垫层 + 白字；亮色用 `rgba(255,255,255,0.6)` + 深字。

## 明暗模式

```css
:root { --lg-bg-primary: rgba(255,255,255,0.45); --lg-blur-md: 20px;
  --lg-saturate: 1.8; }
@media (prefers-color-scheme: dark) {
  :root { --lg-bg-primary: rgba(0,0,0,0.35); --lg-blur-md: 28px;
    --lg-saturate: 2.0; --lg-border-color: rgba(255,255,255,0.08); }
}
```

## 动画

```css
@keyframes glass-enter {
  from { opacity: 0; transform: scale(0.95) translateY(8px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
.glass-animate-in {
  animation: glass-enter var(--lg-duration-normal) var(--lg-easing-spring) both;
}
```

## 移动端性能

- 同屏 blur 元素 ≤ 3 个；滚动容器内避免
- 低端设备降级：`@media (hover: none) and (pointer: coarse)` 减 blur 或用纯色
- `will-change: transform` 仅动画期间设置
- `saturate()` 单独开销低，可保留；主要瓶颈在 `blur()`

## 无障碍

```css
@media (prefers-reduced-motion: reduce) {
  .glass-card, .glass-btn { transition: none; }
  .glass-animate-in { animation: none; opacity: 1; }
}
@media (prefers-contrast: more) {
  .glass-card { backdrop-filter: none; -webkit-backdrop-filter: none;
    background: var(--lg-bg-solid, #fff); border: 2px solid var(--lg-text); }
}
```
