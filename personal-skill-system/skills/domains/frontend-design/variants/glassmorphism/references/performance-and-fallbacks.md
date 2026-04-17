# Performance And Fallbacks / 性能与降级

## 1. Blur Is Not Free

Evaluate:

- target device tier
- surface count
- animation overlap
- scrolling cost

## 2. Fallback Rules

- reduce blur radius first
- reduce pane count second
- replace decorative translucency with solid tint if needed
