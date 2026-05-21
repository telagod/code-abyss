---
name: analyzing-changes
description: Analyzes code changes, detects documentation drift, and evaluates change impact scope. Use when reviewing diffs, checking doc sync, or running pre-commit analysis. Automatically triggered after design-level changes or refactoring.
compatibility: node>=18
user-invocable: false
allowed-tools: Bash, Read, Grep
argument-hint: [--mode working|staged|committed]
---

# 变更校验关卡

> 看清「改了什么、影响哪里、文档是否跟上」——是变更的体检，不是审查替代品。

## 何时使用

| 场景 | 跑 | 判据 |
|------|------|------|
| 提交前（任何代码改动） | ✅ | 默认门禁 |
| 重构完成 | ✅ | 评估辐射面 |
| 设计级改动 | ✅ | DESIGN.md 是否同步 |
| PR review | ✅ | 替代手工 diff 计数 |
| 跨模块大改 | ✅ | 看依赖图是否成环 |
| 紧急 hotfix | ⚠ | 跑，但允许文档同步延后到稳定后 |

## 三种模式

| 模式 | 时机 | 用途 |
|------|------|------|
| `working` (默认) | 写代码过程中 | 自检，看「我现在的工作面有哪些待整理」 |
| `staged` | `git add` 后、`commit` 前 | 提交闸，看「这一 commit 的合理性」 |
| `committed` | commit 完成后 | review，看「上一段历史改了哪些范围」 |

## 警告判定

| 警告 | 触发 | 处置 |
|------|------|------|
| 代码 >50 行 而 DESIGN.md 未更新 | 设计层面变化未留痕 | 补 DESIGN.md「改了什么/为何」段 |
| 代码 >30 行 而无测试更新 | 测试覆盖滞后 | 补单测/集成测；或在 PR 注明「该路径已有 E2E 覆盖」 |
| 新增文件而 README.md 未更新 | 用户视角文档滞后 | 补模块入口说明 |
| 配置变更未记录 | 部署可能踩坑 | CHANGELOG / DESIGN 留迁移说明 |
| 删除文件 | 引用可能未清理 | 全仓 grep 文件名/导出符号 |

## 解读输出

工具产出三类信号：

1. **文件分类** — 自动分代码/文档/测试/配置；用于判断「是否纯文档变更」
2. **模块识别** — 把变更聚到模块边界；用于判断「跨模块改动」
3. **影响评估** — 行数 + 文件数；用于判断「改动是否需要拆 PR」

> **拆 PR 的判据**（基于 commit 角度）：
> - 跨 ≥3 模块且无统一主题 → 拆
> - 单 commit >500 行非生成代码 → 拆
> - 一次同时改架构 + 实现 + 文档 → 通常合理（同主题）

## 与其他 skill 联动

- 设计级变更 → 触发 [verifying-modules](../verifying-modules/SKILL.md) 看新模块文档完整性
- 安全相关变更 → 触发 [analyzing-security](../analyzing-security/SKILL.md)
- 重构 → 触发 [checking-code-quality](../checking-code-quality/SKILL.md) 防退化

## 使用

```bash
node scripts/change_analyzer.js                   # working（默认）
node scripts/change_analyzer.js --mode staged     # 暂存区
node scripts/change_analyzer.js --mode committed  # 已提交
node scripts/change_analyzer.js -v                # 详细
node scripts/change_analyzer.js --json            # CI 用
```

## 人工复核

工具给信号，人下结论。先读受影响模块 README/DESIGN，确认：
- 职责边界是否仍清晰
- 设计决策是否仍成立
- 测试是否覆盖新路径

设计级改动须于 DESIGN.md 留痕：**改了什么、为何改、影响何处**。三段缺一不可。
