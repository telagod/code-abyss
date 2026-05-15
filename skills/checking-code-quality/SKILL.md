---
name: checking-code-quality
description: 代码质量校验关卡。检测复杂度、重复代码、命名规范、函数长度等质量指标。当魔尊提到代码质量、复杂度检查、代码异味、重构建议、lint检查、代码规范时使用。在复杂模块、重构完成时自动触发。
license: MIT
compatibility: node>=18
user-invocable: false
disable-model-invocation: false
allowed-tools: Bash, Read, Glob
argument-hint: <扫描路径>
---

# 代码质量校验关卡

## 命令

```bash
node scripts/quality_checker.js <路径>
node scripts/quality_checker.js <路径> -v      # 详细
node scripts/quality_checker.js <路径> --json  # JSON
```

## 检测指标

| 指标 | 阈值 | 超标处置 |
|------|------|----------|
| 圈复杂度 | <=10 | 拆分函数 |
| 函数长度 | <=50 行 | 提取子函数 |
| 文件长度 | <=500 行 | 拆分模块 |
| 参数数量 | <=5 | 封装对象 |
| 嵌套深度 | <=4 | 早返回/提取 |
| 行长度 | <=120 | 换行 |

## 代码异味

| 异味 | 严重度 | 处置 |
|------|--------|------|
| 重复代码 >10 行 | High | 提取公共函数 |
| 参数 >5 个 | Medium | 封装参数对象 |
| 魔法数字 | Medium | 提取常量 |
| 死代码/注释代码块 | Low | 删除 |

说明：`bin/` 下带 Node shebang 的 CLI 入口文件按命令编排层处理，不参与文件长度阈值；其业务逻辑仍应优先下沉到 `bin/lib/`。

## 命名规范

类名 PascalCase | 函数 snake_case/camelCase | 常量 UPPER_SNAKE | 变量 snake_case/camelCase

## 重构范式

```python
# 深嵌套 → 早返回
def process(data):
    if not c1: return
    if not c2: return
    # 主逻辑

# 重复 → 提取
def common(): ...
def f1(): common()
def f2(): common()
```

## 触发条件

复杂模块 | 重构完成 | 提交前。报告以 `quality_checker.js` 实际输出为准。
