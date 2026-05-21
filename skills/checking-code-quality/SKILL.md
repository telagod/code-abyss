---
name: checking-code-quality
description: Checks code quality metrics including complexity, duplication, naming conventions, and function length. Use when running quality gates, reviewing code smells, or checking lint rules. Automatically triggered on complex modules or post-refactor.
compatibility: node>=18
user-invocable: false
allowed-tools: Bash, Read, Glob
argument-hint: <扫描路径>
---

# 代码质量校验关卡

> 阈值是 heuristic，不是判决。**主动判断哪些超标值得拆，哪些是合理复杂度。**

## 何时使用

| 场景 | 跑 | 判据 |
|------|------|------|
| 重构完成 | ✅ | 验证拆分有效，未引入新异味 |
| 复杂模块新增 | ✅ | 早期发现可读性问题 |
| 提交前（>30 行变更） | ✅ | 防腐烂 |
| PR review | ✅ | 客观度量替代主观争论 |
| 紧急修复 | ❌ | 优先稳定，质量在收口阶段补 |
| 算法/性能关键路径 | ⚠ | 工具阈值不适用，按性能基准判断 |

## 阈值与处置

| 指标 | 阈值 | 超标处置 | 何时容忍 |
|------|------|----------|----------|
| 圈复杂度 | ≤10 | 拆分函数、引入策略模式 | 有限状态机/解析器（结构性复杂） |
| 函数长度 | ≤50 行 | 提取子函数 | 配置/常量声明、大型 switch |
| 文件长度 | ≤500 行 | 拆分模块 | 自动生成代码、protobuf |
| 参数数量 | ≤5 | 封装参数对象 | 构造函数（builder 模式更佳） |
| 嵌套深度 | ≤4 | 早返回、提取函数、查表 | 罕见情况下的状态机 |
| 行长度 | ≤120 | 换行 | 长字符串字面量、SQL |

**例外说明**：`bin/` 下带 Node shebang 的 CLI 入口按命令编排层处理，不参与文件长度阈值；其业务逻辑仍应优先下沉到 `bin/lib/`。

## 代码异味

| 异味 | 严重度 | 处置 |
|------|--------|------|
| 重复代码 >10 行 | High | 提取公共函数；判断是否真重复（结构相似但语义不同时不要强抽） |
| 参数 >5 个 | Medium | 封装参数对象 |
| 魔法数字 | Medium | 提取常量；常见数（0, 1, 2）可豁免 |
| 死代码/注释代码块 | Low | 删除；用 git history 追溯，不要靠注释保留 |

## 命名规范

| 实体 | 规则 |
|------|------|
| 类 | PascalCase |
| 函数 | snake_case (Python/Rust) / camelCase (JS/TS/Go) |
| 常量 | UPPER_SNAKE |
| 变量 | snake_case / camelCase（按语言） |

跨语言项目按主语言定，**不混搭**。

## 判断式重构

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

> **重构红线**：测试不绿不重构。先把测试补齐，才有改动的安全网。

## 与其他 skill 联动

- 重构后 → 同步跑 [analyzing-changes](../analyzing-changes/SKILL.md)（看影响面）+ [analyzing-security](../analyzing-security/SKILL.md)（防退化）
- 复杂度爆炸时 → 看是否需要 [designing-architectures](../designing-architectures/SKILL.md) 的拆分模式

## 使用

```bash
node scripts/quality_checker.js <路径>
node scripts/quality_checker.js <路径> -v       # 详细
node scripts/quality_checker.js <路径> --json   # CI 用
```

## 收口

报告以 `quality_checker.js` 实际输出为准。超标项要么修复，要么在 DESIGN.md 留「为何接受」的说明。**不允许悄悄忽略。**
