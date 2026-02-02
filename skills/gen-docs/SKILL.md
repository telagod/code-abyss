---
name: gen-docs
description: 文档生成器。自动分析模块结构，生成 README.md 和 DESIGN.md 骨架。
user-invocable: true
disable-model-invocation: false
allowed-tools: Bash, Read, Write
argument-hint: <模块路径> [--force]
---

# 文档生成器

## 核心原则

```
无文档不成模块
文档是模块的身份证
```

## 自动生成

运行文档生成脚本（跨平台）：

```bash
# 在 skill 目录下运行
python scripts/doc_generator.py <模块路径>
python scripts/doc_generator.py <模块路径> --force  # 强制覆盖已存在的文档
python scripts/doc_generator.py <模块路径> --json   # JSON 输出
```

## 生成内容

### README.md 骨架

自动生成的 README.md 包含：

- **模块名称** — 从目录名提取
- **描述** — 从代码文档字符串提取（如有）
- **特性列表** — 待填充
- **依赖** — 从 requirements.txt/pyproject.toml 提取
- **使用方法** — 基础模板
- **API 概览** — 从代码提取类和函数列表
- **目录结构** — 自动扫描生成

### DESIGN.md 骨架

自动生成的 DESIGN.md 包含：

- **设计概述** — 目标与非目标模板
- **架构设计** — 架构图占位符
- **核心组件** — 从代码提取类列表
- **设计决策** — 决策记录表格模板
- **技术选型** — 自动检测语言和依赖
- **权衡取舍** — 已知限制和技术债务模板
- **安全考量** — 威胁模型和安全措施模板
- **变更历史** — 初始版本记录

## 智能分析

### 支持的语言

| 语言 | 分析能力 |
|------|----------|
| **Python** | 类、函数、文档字符串、依赖 |
| **Go** | 目录结构、依赖 |
| **TypeScript** | 目录结构、依赖 |
| **Rust** | 目录结构、依赖 |
| **其他** | 基础目录结构 |

### 提取的信息

- 模块名称（目录名）
- 主要编程语言
- 代码文件列表
- 类和函数定义（Python）
- 文档字符串（Python）
- 依赖列表
- 入口点文件

## 使用流程

```
1. 运行 doc_generator.py 生成骨架
2. 填充 TODO 标记的内容
3. 补充设计决策和理由
4. 添加使用示例
5. 运行 /verify-module 校验完整性
```

---

**文档是模块的身份证，没有身份证的模块不允许上线。**
