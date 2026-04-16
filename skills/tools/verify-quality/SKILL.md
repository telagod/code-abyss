---
name: verify-quality
description: 代码质量校验关卡。检测复杂度、重复代码、命名规范、函数长度等质量指标。当魔尊提到代码质量、复杂度检查、代码异味、重构建议、lint检查、代码规范时使用。在复杂模块、重构完成时自动触发。
license: MIT
compatibility: node>=18
user-invocable: true
disable-model-invocation: false
allowed-tools: Bash, Read, Glob
argument-hint: <扫描路径>
---

# ⚖ 校验关卡 · 代码质量

## 道基

```
质量 = 可读 + 可维护 + 可测试
复杂度乃 bug 温床，劣码即技术债
```

## 自动检查

```bash
node scripts/quality_checker.js <路径>
node scripts/quality_checker.js <路径> -v      # 详细
node scripts/quality_checker.js <路径> --json  # JSON
```

## 检测指标

### 复杂度

| 指标 | 阈值 | 超标 |
|------|------|------|
| 圈复杂度 | ≤ 10 | 🟠 拆分 |
| 函数长度 | ≤ 50 行 | 🟠 拆分 |
| 文件长度 | ≤ 500 行 | 🟡 拆分 |
| 参数数量 | ≤ 5 | 🟠 封装 |
| 嵌套深度 | ≤ 4 | 🟠 重构 |
| 行长度 | ≤ 120 | 🔵 提示 |

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 类名 | PascalCase | `UserService` |
| 函数名 | snake_case | `get_user` |
| 常量 | UPPER_SNAKE | `MAX_RETRY` |
| 变量 | snake_case | `user_id` |

### 代码异味

| 异味 | 严重度 |
|------|--------|
| 重复代码 >10 行 | 🟠 High |
| 参数 >5 个 | 🟡 Medium |
| 魔法数字 | 🟡 Medium |
| 死代码 | 🔵 Low |
| 注释代码块 | 🔵 Low |

## 流程

```
扫描 → 算复杂度 → 检异味 → 验命名 → 出报告
```

报告以 `quality_checker.js` 实际输出为准。

## 重构范式

```python
# 🔴 深嵌套
def process(data):
    if c1:
        if c2:
            if c3:
                pass

# ✅ 早返回
def process(data):
    if not c1: return
    if not c2: return
    if not c3: return
    # 主逻辑

# 🔴 重复
def f1(): # 10行同逻辑
def f2(): # 10行同逻辑

# ✅ 提取
def common(): ...
def f1(): common()
def f2(): common()
```

---
