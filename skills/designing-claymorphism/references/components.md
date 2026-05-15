# Claymorphism 组件参考

## 阴影层解析

```css
box-shadow:
  8px 8px 16px rgba(0,0,0,0.15),           /* 外影：锚定纵深 */
  inset -4px -4px 8px rgba(0,0,0,0.08),     /* 内暗影(右下)：底部凹陷 */
  inset 4px 4px 8px rgba(255,255,255,0.6);  /* 内亮影(左上)：顶部高光 */
```

## 组件速查

共享：`border: none` / `color: var(--clay-text)`

```css
/* Card */
.clay-card { background: var(--clay-bg-card); border-radius: var(--clay-radius-lg);
  box-shadow: var(--clay-shadow); padding: 1.5rem; color: var(--clay-text); }

/* Button — hover 浮起，active 按压 */
.clay-btn { background: var(--clay-bg-button); border: none;
  border-radius: var(--clay-radius-pill); box-shadow: var(--clay-shadow);
  padding: 0.75rem 1.5rem; color: var(--clay-text);
  cursor: pointer; transition: box-shadow 0.2s ease-out, transform 0.2s ease-out; }
.clay-btn:hover { box-shadow: var(--clay-shadow-elevated); transform: translateY(-1px); }
.clay-btn:active { box-shadow: var(--clay-shadow-pressed); transform: translateY(0); }
.clay-btn:focus-visible { outline: 2px solid var(--clay-accent); outline-offset: 2px; }

/* Input */
.clay-input { background: var(--clay-bg); border: none;
  border-radius: var(--clay-radius); box-shadow: var(--clay-shadow-pressed);
  padding: 0.75rem 1rem; color: var(--clay-text); }
.clay-input:focus { outline: 2px solid var(--clay-accent); outline-offset: 2px; }

/* Form 验证态 */
.clay-input[aria-invalid="true"] { outline: 2px solid var(--clay-error); }
.clay-input:valid { outline: 2px solid var(--clay-success); }

/* Modal */
.clay-overlay { background: rgba(0,0,0,0.3); }
.clay-modal { background: var(--clay-bg-card); border-radius: var(--clay-radius-lg);
  box-shadow: var(--clay-shadow-elevated); padding: 2rem; }

/* Badge */
.clay-badge { display: inline-block; background: var(--clay-bg-button);
  border-radius: var(--clay-radius-pill); box-shadow: var(--clay-shadow);
  padding: 0.25rem 0.75rem; font-size: 0.85rem; font-weight: 600; }

/* Toggle */
.clay-toggle { width: 56px; height: 30px; background: var(--clay-bg-card);
  border-radius: var(--clay-radius-pill); box-shadow: var(--clay-shadow-pressed); }
.clay-toggle-knob { width: 24px; height: 24px; background: var(--clay-bg);
  border-radius: 50%; box-shadow: var(--clay-shadow);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
```

## 弹簧动画

```css
:root { --clay-spring: cubic-bezier(0.34, 1.56, 0.64, 1); }

.clay-btn { transition: transform 0.3s var(--clay-spring), box-shadow 0.2s ease-out; }
.clay-modal { animation: clay-pop 0.35s var(--clay-spring) both; }

@keyframes clay-pop {
  from { opacity: 0; transform: scale(0.9); }
  to   { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .clay-btn, .clay-toggle-knob { transition: none; }
  .clay-modal { animation: none; }
}
```

## 暗色模式

内亮影须大幅减弱，否则暗底上出现发光伪影。外影加深补偿纵深。忌纯黑底。

```css
[data-theme="dark"] {
  --clay-bg-card: #2a2a3d;
  --clay-shadow:
    8px 8px 16px rgba(0,0,0,0.35),
    inset -4px -4px 8px rgba(0,0,0,0.2),
    inset 4px 4px 8px rgba(255,255,255,0.05);
  --clay-shadow-pressed:
    inset -2px -2px 6px rgba(0,0,0,0.25),
    inset 2px 2px 6px rgba(255,255,255,0.03);
}
```

## 无障碍

```css
@media (prefers-contrast: more) {
  .clay-card { box-shadow: 0 0 0 2px var(--clay-text); }
  .clay-btn { box-shadow: 0 0 0 2px var(--clay-text); }
}
```
