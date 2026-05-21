---
name: applying-ui-design-system
description: Frontend UI design system selector and implementation guide covering Glassmorphism, Liquid Glass (Apple-style), Neubrutalism, and Claymorphism. Use when building UI components, choosing a visual aesthetic, implementing design tokens, or auditing accessibility/contrast on themed surfaces. Provides per-style tokens, component patterns, dark mode, and a11y constraints.
user-invocable: false
---

# 设计语言选型

> 不同设计语言不可混搭。先选语言，再按 reference 落地组件。

## 风格决策

| 想要的感觉 | 选 | 加载 |
|---|---|---|
| 半透明、磨砂、轻盈、纵深感弱 | **Glassmorphism** | [references/glassmorphism.md](references/glassmorphism.md) |
| Apple 风格、立体玻璃、环境光响应、弹簧动效 | **Liquid Glass** | [references/liquid-glass.md](references/liquid-glass.md) |
| 粗框硬影、高饱和、纯平、反精致 | **Neubrutalism** | [references/neubrutalism.md](references/neubrutalism.md) |
| 软糯黏土、大圆角、双内影、温暖 | **Claymorphism** | [references/claymorphism.md](references/claymorphism.md) |

每个 reference 自包含「核心要素 + CSS Tokens + 关键约束 + 组件 + 暗色模式 + 无障碍」全套。

## 共享铁律（跨风格）

无论选哪种风格，下列约束**全部适用**：

1. **对比度** — 主文字 ≥ 4.5:1，大字体（≥18pt 常规 / ≥14pt 粗体）≥ 3:1。**逐底色验证**，不靠白底脑补。
2. **`:focus-visible`** — 必须可见；轮廓与底色有足够反差。键盘可达性是底线。
3. **`prefers-reduced-motion: reduce`** — 禁用弹簧、滑入、parallax 等装饰动画；保留功能性 transition。
4. **`prefers-contrast: more`** — 减少透明、增强边界、平化阴影。
5. **暗色模式** — 用语义 token 切换（如 `--bg-surface`），不要硬编码 `#fff/#000` 后再交换。

## 落地流程

1. **选风格** — 一个项目通常一种主风格；可有第二风格作辅助层（如主体 Liquid Glass + 强调按钮 Neubrutalism）
2. **导入 tokens** — 复制对应 `tokens-<style>.css` 到项目，按需扩展
3. **按 reference 抄组件** — Card / Button / Modal / Nav 速查已就位
4. **验证对比度 + 焦点 + 减弱动效** — 跑 a11y 自检
5. **暗色模式映射** — 每个 token 都要有暗色对应

## 何时不要本 skill

- 仅需 vanilla CSS / Tailwind 默认组件 → 不需要设计系统选型
- 已有完整 design system（如 Material、Ant Design）→ 沿用，不重新选风格
- 后端工作 / 数据可视化主导 → 走 [designing-architectures](../designing-architectures/SKILL.md)

## 性能基线

- 同屏 `backdrop-filter` 元素 ≤ 3（Glassmorphism / Liquid Glass 限制）
- 滚动容器内避免 blur（触发逐帧重绘）
- 阴影层叠 ≤ 3 层（Claymorphism 多内影时尤其注意）
- 低端设备：用 `@supports` 或 `@media (hover: none)` 降级为纯色
