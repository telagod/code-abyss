---
name: verify-module
description: 模块完整性校验关卡。扫描目录结构、检测缺失文档、验证代码与文档同步。当魔尊提到模块校验、文档检查、结构完整性、README检查、DESIGN检查时使用。在新建模块完成时自动触发。
license: MIT
compatibility: node>=18
user-invocable: true
disable-model-invocation: false
allowed-tools: Bash, Read, Glob
argument-hint: <模块路径>
---

# ⚖ 校验关卡 · 模块完整性

## 道基

```
模块 = 代码 + README.md + DESIGN.md
缺一不可，残缺即异端
```

## 自动扫描

```bash
node scripts/module_scanner.js <模块路径>
node scripts/module_scanner.js <模块路径> -v      # 详细
node scripts/module_scanner.js <模块路径> --json  # JSON
```

## 检测项

### 必须存在

| 文件 | 缺失后果 |
|------|----------|
| `README.md` | 🔴 阻断交付 |
| `DESIGN.md` | 🔴 阻断交付 |

### 推荐存在

| 文件/目录 | 缺失后果 |
|-----------|----------|
| `tests/` | 🟠 警告 |
| `__init__.py` | 🟡 提示 |
| `.gitignore` | 🔵 信息 |

### README.md 须含

模块名与定位、存在理由、核心职责、依赖关系、快速使用示例

### DESIGN.md 须含

设计目标、方案选择与理由、关键决策、已知限制、变更历史

## 触发时机

新建模块 | 模块重构 | 提交前

## 流程

```
module_scanner.js 扫描 → 检结构/README/DESIGN → 验代码与文档一致 → 出报告
```

## 快速修复

缺文档时用 `/gen-docs <模块路径>` 生成骨架。

---
