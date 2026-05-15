---
name: frontend-engineering
description: 前端工程化。性能优化（Web Vitals、懒加载、虚拟滚动）、测试（Vitest、Playwright、MSW）、构建工具（Vite、Webpack、esbuild）。当用户提到性能优化、前端测试、构建工具、代码分割时使用。
---

# 前端工程化 · Frontend Engineering

## 一、性能优化

### Core Web Vitals

| 指标 | 含义 | 目标值 |
|------|------|--------|
| LCP | Largest Contentful Paint | < 2.5s |
| FID | First Input Delay | < 100ms |
| CLS | Cumulative Layout Shift | < 0.1 |
| FCP | First Contentful Paint | < 1.8s |
| TTI | Time to Interactive | < 3.8s |

### 性能决策树

```
加载慢 → Bundle 大？代码分割 + Tree Shaking | 资源多？懒加载 + 预加载 | 网络慢？CDN + 压缩
渲染慢 → 列表长？虚拟滚动 | 重渲染？React.memo + useMemo | 布局抖动？固定尺寸
交互慢 → JS 阻塞？Web Worker + startTransition | 动画卡顿？CSS 动画 + rAF
```

### 代码分割

```typescript
// 路由级别 — React.lazy + Suspense
const Dashboard = lazy(() => import('./pages/Dashboard'))

// 组件级别 — 按需加载重量级组件
const HeavyChart = lazy(() => import('./components/HeavyChart'))

// Vite manualChunks
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui': ['@mui/material'],
        },
      },
    },
  },
})
```

### 虚拟滚动

```typescript
import { FixedSizeList } from 'react-window'

function VirtualList({ items }: { items: Item[] }) {
  return (
    <FixedSizeList height={600} itemCount={items.length} itemSize={50} width="100%">
      {({ index, style }) => <div style={style}>{items[index].name}</div>}
    </FixedSizeList>
  )
}
```

### React 性能要点

```typescript
// memo 避免重渲染
const Row = memo(function Row({ item, onClick }: Props) {
  return <div onClick={() => onClick(item.id)}>{item.name}</div>
})

// useMemo 缓存计算 + useCallback 缓存回调
const filtered = useMemo(() => data.filter(x => x.name.includes(q)), [data, q])
const handleClick = useCallback((id: string) => select(id), [])

// startTransition 低优先级更新
startTransition(() => setResults(heavySearch(query)))
```

### 资源优化 Checklist

- 图片：WebP 格式 + `loading="lazy"` + 响应式 `<picture>`
- 字体：`font-display: swap` + `preload` woff2
- 预加载：`dns-prefetch` → `preconnect` → `preload` → `prefetch`
- 压缩：Gzip/Brotli + HTTP/2

### 性能监控

```typescript
import { onCLS, onFID, onLCP } from 'web-vitals'
onCLS(sendToAnalytics)
onFID(sendToAnalytics)
onLCP(sendToAnalytics)

// 自定义指标
performance.mark('start')
doWork()
performance.mark('end')
performance.measure('work', 'start', 'end')
```

## 二、测试

### 测试金字塔

```
    /\       E2E (10%) — Playwright
   /--\      集成 (20%) — Testing Library + MSW
  /----\     单元 (70%) — Vitest
```

### Vitest 配置

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      provider: 'v8',
      thresholds: { lines: 80, functions: 80, branches: 75 },
    },
  },
})
```

### 单元测试

```typescript
describe('formatCurrency', () => {
  it('formats number', () => expect(formatCurrency(1234.56)).toBe('$1,234.56'))
  it('handles zero', () => expect(formatCurrency(0)).toBe('$0.00'))
})
```

### 组件测试

```typescript
import { render, screen, fireEvent } from '@testing-library/react'

it('calls onClick', () => {
  const fn = vi.fn()
  render(<Button onClick={fn}>Click</Button>)
  fireEvent.click(screen.getByText('Click'))
  expect(fn).toHaveBeenCalledTimes(1)
})
```

### MSW Mock

```typescript
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('/api/users/:id', ({ params }) =>
    HttpResponse.json({ id: params.id, name: 'John' })
  ),
)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

### Playwright E2E

```typescript
// playwright.config.ts 核心
export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  webServer: { command: 'npm run dev', url: 'http://localhost:3000' },
})

// Page Object 模式
class LoginPage {
  constructor(private page: Page) {}
  async login(email: string, password: string) {
    await this.page.fill('[name="email"]', email)
    await this.page.fill('[name="password"]', password)
    await this.page.click('[type="submit"]')
  }
}
```

### 测试 Checklist

- 遵循 AAA 模式（Arrange / Act / Assert）
- 测试行为而非实现
- Mock 外部依赖（API、时间）
- 测试边界条件和错误路径
- CI 中自动运行 + 覆盖率门禁 80%+

## 三、构建工具

### 选型决策

```
新项目 React/Vue → Vite | Next.js → Turbopack | 零配置 → Parcel
库开发 → Rollup / esbuild
老项目复杂配置 → 保持 Webpack | 可迁移 → Vite
```

### 工具对比

| 工具 | 冷启动 | HMR | 生产构建 | 生态 |
|------|--------|-----|----------|------|
| Vite | < 1s | < 100ms | 10-30s | 成熟 |
| Webpack | 10-30s | 1-3s | 30-60s | 最丰富 |
| Turbopack | < 1s | < 100ms | 10-20s | 新兴 |
| esbuild | < 1s | N/A | 5-10s | 基础 |

### Vite 核心配置

```typescript
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 3000,
    proxy: { '/api': { target: 'http://localhost:8080', changeOrigin: true } },
  },
  build: {
    minify: 'terser',
    terserOptions: { compress: { drop_console: true } },
    rollupOptions: {
      output: {
        manualChunks: { 'react-vendor': ['react', 'react-dom'] },
        entryFileNames: 'assets/[name].[hash].js',
      },
    },
  },
  optimizeDeps: { include: ['react', 'react-dom'] },
})
```

### Webpack 生产优化要点

```javascript
optimization: {
  minimize: true,
  minimizer: [new TerserPlugin(), new CssMinimizerPlugin()],
  splitChunks: {
    chunks: 'all',
    cacheGroups: {
      react: { test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/, priority: 20 },
      vendor: { test: /[\\/]node_modules[\\/]/, priority: 10 },
    },
  },
  runtimeChunk: 'single',
}
```

### Webpack → Vite 迁移要点

1. `npm install -D vite @vitejs/plugin-react`
2. `index.html` 移到根目录，加 `<script type="module" src="/src/main.tsx">`
3. `REACT_APP_*` → `VITE_*`，`process.env` → `import.meta.env`
4. `require()` → `import`

### 构建 Checklist

- 合理代码分割（路由级 + 第三方库分组）
- Tree Shaking + 压缩（terser / esbuild）
- 文件名哈希实现长期缓存
- Source map 仅 dev 或 hidden
- 定期 `webpack-bundle-analyzer` / `rollup-plugin-visualizer` 审计
- CI 缓存 `node_modules` + 构建产物

## 工具速查

| 类别 | 推荐工具 |
|------|----------|
| 构建 | Vite (新项目) / Webpack (复杂项目) |
| 单元测试 | Vitest |
| 组件测试 | Testing Library |
| E2E | Playwright |
| API Mock | MSW |
| 性能监控 | web-vitals + Lighthouse |
| Bundle 分析 | webpack-bundle-analyzer / rollup-plugin-visualizer |
| 视觉回归 | Playwright screenshots / Chromatic |

---
