---
name: generating-docs
description: 文档生成器。自动分析模块结构，生成 README.md 和 DESIGN.md 骨架。当魔尊提到生成文档、创建README、创建DESIGN、文档骨架、文档模板时使用。在新建模块开始时自动触发。
compatibility: node>=18
user-invocable: false
allowed-tools: Bash, Read, Write, Glob
argument-hint: <模块路径> [--force]
---

# 造典关卡 · 文档生成器

## 命令

```bash
node scripts/doc_generator.js <模块路径>
node scripts/doc_generator.js <模块路径> --force  # 强制覆盖
node scripts/doc_generator.js <模块路径> --json   # JSON
```

## 生成内容

| 文件 | 内容 |
|------|------|
| README.md | 模块名(取自目录)、描述(docstring)、特性、依赖、使用方法、API 概览、目录结构 |
| DESIGN.md | 设计目标/非目标、架构、核心组件(取自代码)、决策表、技术选型、权衡、安全考量 |

## 语言支持

Python：类、函数、docstring、依赖 | Go/TS/Rust：目录结构、依赖 | 其他：基础目录结构

## 触发条件

新建模块 | 检测到缺失文档

## 流程

```
doc_generator.js 生成 → 填充 TODO → 补决策理由 → 加示例 → /verify-module 校验
```

## 生成后检查

README：描述、特性、示例、依赖齐备
DESIGN：目标、决策理由、选型、已知限制齐备
