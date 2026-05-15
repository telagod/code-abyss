---
name: testing
description: 软件测试。单元测试、集成测试、TDD、测试框架。当用户提到测试、单元测试、pytest、Jest、mock、TDD时使用。
---

# 🔧 炼器秘典 · 软件测试


## 测试金字塔

```
        /\
       /  \     E2E 测试 (少)
      /----\
     /      \   集成测试 (中)
    /--------\
   /          \ 单元测试 (多)
  --------------
```

## Python (pytest)

```python
import pytest
from myapp import calculate, UserService

# 基础测试
def test_add():
    assert calculate.add(1, 2) == 3

# 参数化
@pytest.mark.parametrize("a,b,expected", [
    (1, 2, 3),
    (0, 0, 0),
    (-1, 1, 0),
])
def test_add_params(a, b, expected):
    assert calculate.add(a, b) == expected

# Fixture
@pytest.fixture
def user_service():
    service = UserService()
    yield service
    service.cleanup()

def test_create_user(user_service):
    user = user_service.create("test")
    assert user.name == "test"

# Mock
from unittest.mock import Mock, patch

@patch('myapp.requests.get')
def test_fetch(mock_get):
    mock_get.return_value.json.return_value = {"id": 1}
    result = fetch_user(1)
    assert result["id"] == 1

# 异步测试
@pytest.mark.asyncio
async def test_async_fetch():
    result = await async_fetch()
    assert result is not None
```

### 运行命令
```bash
pytest                      # 运行所有
pytest test_file.py         # 指定文件
pytest -k "test_add"        # 匹配名称
pytest -v                   # 详细输出
pytest --cov=myapp          # 覆盖率
pytest -x                   # 失败即停
```

## JavaScript (Jest/Vitest)

```javascript
import { describe, it, expect, vi } from 'vitest';

// 基础测试
describe('add', () => {
  it('should add two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });

  it.each([
    [1, 2, 3],
    [0, 0, 0],
    [-1, 1, 0],
  ])('add(%i, %i) = %i', (a, b, expected) => {
    expect(add(a, b)).toBe(expected);
  });
});

// Mock
vi.mock('./api', () => ({
  getUser: vi.fn().mockResolvedValue({ id: 1, name: 'test' })
}));

it('should fetch user', async () => {
  const user = await fetchUser(1);
  expect(user.name).toBe('test');
});

// Spy
const spy = vi.spyOn(console, 'log');
doSomething();
expect(spy).toHaveBeenCalledWith('message');
```

## Go (testing)

```go
package main

import (
    "testing"
    "github.com/stretchr/testify/assert"
)

func TestAdd(t *testing.T) {
    result := Add(1, 2)
    assert.Equal(t, 3, result)
}

// 表驱动测试
func TestAddTable(t *testing.T) {
    tests := []struct {
        name     string
        a, b     int
        expected int
    }{
        {"positive", 1, 2, 3},
        {"zero", 0, 0, 0},
        {"negative", -1, 1, 0},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            assert.Equal(t, tt.expected, Add(tt.a, tt.b))
        })
    }
}

// Benchmark
func BenchmarkAdd(b *testing.B) {
    for i := 0; i < b.N; i++ {
        Add(1, 2)
    }
}
```

## 测试原则

```yaml
FIRST:
  - Fast: 快速执行
  - Independent: 相互独立
  - Repeatable: 可重复
  - Self-validating: 自验证
  - Timely: 及时编写

AAA:
  - Arrange: 准备数据
  - Act: 执行操作
  - Assert: 验证结果

原则:
  - 每个测试只验证一件事
  - 测试边界条件
  - 测试异常情况
  - 避免测试实现细节
```

## TDD 流程

```
红 → 绿 → 重构

1. 红: 写一个失败的测试
2. 绿: 写最少代码让测试通过
3. 重构: 优化代码，保持测试通过
```

---

## 测试策略（源自 testing-strategy）

### 测试金字塔比例

| 层级 | 占比 | 执行时间 | 成本 |
|------|------|----------|------|
| 单元测试 | 70% | <1s | 低 |
| 集成测试 | 20% | 1-10s | 中 |
| E2E测试 | 10% | 10s-5m | 高 |

### 测试左移 Checklist

```yaml
需求阶段: 可测试性评审、验收标准定义、测试用例设计
开发阶段: TDD、单元测试同步编写、代码审查包含测试
提交阶段: Pre-commit Hook、本地测试必过、静态分析
CI阶段: 自动化测试、覆盖率门禁、性能基准测试
```

### 契约测试要点

- 消费者驱动契约 (CDC)：Consumer 定义期望 → Provider 验证契约
- 工具：Pact（多语言）、Spring Cloud Contract（Java）
- 核心：Provider API <-> Contract <-> Consumer，双方独立验证

### 覆盖率策略

```yaml
类型: 行覆盖率、分支覆盖率、函数覆盖率、语句覆盖率
门禁: 全局 ≥80%，核心模块 ≥90%
排除: tests/、migrations/、__init__.py、config 文件
```

### 变异测试

- 修改源码（变异体）验证测试是否能捕获
- 工具：Stryker (JS)、Pitest (Java)
- 阈值：high 80% / low 60% / break 50%

### 测试最佳实践

- AAA 模式：Arrange → Act → Assert
- 命名：`should [预期行为] when [条件]`
- 单一职责：每个测试只验证一件事
- 数据隔离：Fixture/Factory 模式，每测试独立实例
- 并行执行：Jest `maxWorkers: '50%'`、pytest `-n auto`

---

## E2E 测试（源自 e2e-testing）

### Playwright vs Cypress

| 特性 | Playwright | Cypress |
|------|-----------|---------|
| 多浏览器 | Chromium/Firefox/WebKit | Chromium/Firefox/Edge |
| 多标签页/iframe | 原生支持 | 有限 |
| 并行执行 | 原生支持 | 需付费 |
| 调试体验 | 一般 | 优秀 |

### 选择器优先级

```
1. data-testid (推荐)
2. role + accessible name
3. 稳定的 class/id
4. 文本内容 (谨慎)
5. CSS/XPath (避免)
```

### E2E Checklist

```yaml
架构:
  - 页面对象模式 (POM) 封装页面操作
  - 测试独立性：通过 API 准备数据，不依赖其他测试
  - 智能等待：waitForSelector/waitForResponse，禁止 waitForTimeout

网络:
  - Mock API：page.route() / cy.intercept() 隔离后端
  - 等待响应：waitForResponse 确认数据加载

可视化回归:
  - Playwright: toHaveScreenshot() + mask 动态内容
  - Percy/Chromatic: 云端截图对比

认证:
  - Playwright: storageState 复用登录态
  - Cypress: cy.session() 缓存会话

CI集成:
  - retries: CI 环境 2 次重试
  - artifacts: 失败时保存截图/视频/trace
```

