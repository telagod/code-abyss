---
name: gen-docs
description: 文档生成器。自动分析模块结构，生成 README.md 和 DESIGN.md 骨架。当魔尊提到生成文档、创建README、创建DESIGN、文档骨架、文档模板时使用。在新建模块开始时自动触发。
license: MIT
compatibility: node>=18
user-invocable: true
disable-model-invocation: false
allowed-tools: Bash, Read, Write, Glob
argument-hint: <模块路径> [--force]
---

# 📝 造典关卡 · 文档生成器

## 道基

```
无文档不成模块，文档乃模块身份证
```

## 自动生成

```bash
node scripts/doc_generator.js <模块路径>
node scripts/doc_generator.js <模块路径> --force  # 强制覆盖
node scripts/doc_generator.js <模块路径> --json   # JSON
```

## 生成内容

### README.md 骨架

模块名（取自目录）、描述（取自 docstring）、特性列表、依赖（取自 requirements.txt/pyproject.toml）、使用方法、API 概览（类与函数）、目录结构。

### DESIGN.md 骨架

设计概述（目标/非目标）、架构设计、核心组件（取自代码）、设计决策表、技术选型（自动检测）、权衡取舍、安全考量、变更历史。

## 语言支持

| 语言 | 分析能力 |
|------|----------|
| Python | 类、函数、docstring、依赖 |
| Go/TS/Rust | 目录结构、依赖 |
| 其他 | 基础目录结构 |

## 触发时机

新建模块 | 检测到缺失文档

## 流程

```
doc_generator.js 生成 → 填充 TODO → 补决策理由 → 加示例 → /verify-module 校验
```

## 生成后检查

README.md: 描述、特性、示例、依赖
DESIGN.md: 目标、决策、选型理由、已知限制

---
