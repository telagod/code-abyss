---
name: generating-docs
description: Generates README.md and DESIGN.md scaffolds by analyzing module structure. Use when creating documentation templates for new modules. Automatically triggered at module creation.
compatibility: node>=18
user-invocable: false
allowed-tools: Bash, Read, Write, Glob
argument-hint: <模块路径> [--force]
---

# 造典关卡 · 文档生成器

> 生成的是骨架，不是答案。**填决策理由是人的工作，工具不能代劳。**

## 何时使用

| 场景 | 跑 | 理由 |
|------|------|------|
| 新模块创建后第一时间 | ✅ | 趁记忆新鲜填决策 |
| [verifying-modules](../verifying-modules/SKILL.md) 报「缺 README/DESIGN」 | ✅ | 直接补救 |
| 重构后边界变化 | ⚠ | 看是否要重生成或手动改；**不要 `--force` 覆盖已有内容** |
| 已有完整文档 | ❌ | 不要破坏人工写的内容 |

## 生成内容

### README.md（自动可填部分）

| 字段 | 自动来源 | 待人补 |
|------|----------|--------|
| 模块名 | 目录名 | 是否有更好的展示名 |
| 描述 | 顶级 docstring（Python） | 「存在理由」必须人写 |
| 特性 | TODO（占位） | 列 3–5 个核心能力 |
| 依赖 | `requirements.txt` / `package.json` / `Cargo.toml` 等 | 是否有运行时假设 |
| 使用方法 | TODO（占位） | 5 分钟跑通示例 |
| API 概览 | 公开类/函数签名 | 调用顺序、生命周期 |
| 目录结构 | `tree` 输出 | — |

### DESIGN.md（骨架占位）

| 字段 | 自动 | 待人补（最重要） |
|------|------|------------------|
| 设计目标 / 非目标 | TODO | **核心决策驱动力** |
| 架构 | TODO | 含一张图最好 |
| 核心组件 | 公开类/函数列表 | 各组件的协作关系 |
| 决策表 | TODO | **方案对比 + 选择理由** |
| 技术选型 | 依赖列表 | 选 X 不选 Y 的理由 |
| 权衡 | TODO | 牺牲了什么 |
| 安全考量 | TODO | 信任边界、威胁模型 |

## 语言支持

| 语言 | 提取深度 |
|------|----------|
| Python | 类、函数、docstring、依赖（最完整） |
| Go / TypeScript / Rust | 目录结构 + 依赖 |
| 其他 | 基础目录结构 |

## 流程

```
doc_generator.js 生成骨架
        ↓
人工填 TODO（决策理由、使用示例、非目标）
        ↓
verify-module 校验完整性
        ↓
通过则提交
```

## 何时不要 `--force`

- **目标文件已有人工内容** —— `--force` 会无差别覆盖。先 diff 旧版，手动合并。
- **CI 环境** —— 生成应在开发机做，CI 只校验，不生成。

## 与其他 skill 联动

- 跑完后 → 必跑 [verifying-modules](../verifying-modules/SKILL.md)
- 大模块 → 拆分前先 [designing-architectures](../designing-architectures/SKILL.md) 想清楚边界

## 使用

```bash
node scripts/doc_generator.js <模块路径>
node scripts/doc_generator.js <模块路径> --force   # 强制覆盖（慎用）
node scripts/doc_generator.js <模块路径> --json    # CI 用
```

## 收口

工具给骨架，**TODO 不补完不算交付**。生成后 5 分钟内人工填决策；超过 1 天会忘原因，文档质量陡降。
