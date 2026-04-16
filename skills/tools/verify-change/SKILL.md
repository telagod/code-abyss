---
name: verify-change
description: 变更校验关卡。分析代码变更，检测文档同步状态，评估变更影响范围。当魔尊提到变更检查、文档同步、代码审查、提交前检查、diff分析时使用。在设计级变更、重构完成时自动触发。
license: MIT
compatibility: node>=18
user-invocable: true
disable-model-invocation: false
allowed-tools: Bash, Read, Grep
argument-hint: [--mode working|staged|committed]
---

# ⚖ 校验关卡 · 变更校验

## 道基

```
变更 = 代码改动 + 文档更新 + 理由记录
无记录之变更乃灾祸之源
```

## 自动分析

```bash
node scripts/change_analyzer.js                    # 工作区（默认）
node scripts/change_analyzer.js --mode staged      # 暂存区
node scripts/change_analyzer.js --mode committed   # 已提交
node scripts/change_analyzer.js -v                 # 详细
node scripts/change_analyzer.js --json             # JSON
```

## 检测项

| 检测项 | 说明 |
|--------|------|
| 文件分类 | 自动识别代码/文档/测试/配置 |
| 模块识别 | 识别受影响模块 |
| 文档同步 | 代码变更是否同步更新文档 |
| 测试覆盖 | 代码变更是否有对应测试 |
| 影响评估 | 变更规模与影响范围 |

### 触发警告

- 代码变更 >50 行而 DESIGN.md 未更新
- 代码变更 >30 行而无测试更新
- 新增文件而 README.md 未更新
- 配置变更未记录
- 删除文件须确认引用已清理

## 人工复核要点

先读受影响模块 `README.md`/`DESIGN.md`，确认职责、设计、测试是否同步。设计级改动须于 `DESIGN.md` 留痕：改了什么、为何改、影响何处。

## 触发时机

设计级变更 | 重构完成 | 代码变更 >30 行 | 提交前

## 流程

```
change_analyzer.js 分析 → 识别变更与模块 → 检文档同步 → 评估影响 → 出报告
```

报告以脚本输出为准。

---
