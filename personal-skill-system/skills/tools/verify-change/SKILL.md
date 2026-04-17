---
schema-version: 2
name: verify-change
title: 变更校验工具
description: 对工作区、暂存区或提交内容做结构化变更分析，识别受影响模块、文档同步、测试缺口与风险面。
kind: tool
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [verify-change, diff, 变更检查, 提交前检查]
negative-keywords: []
priority: 90
runtime: scripted
executor: node
permissions: [Read, Grep, Bash]
risk-level: low
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [tool, diff]
aliases: [vc]
---

# Verify Change Tool

## Read These References

- `references/git-modes-and-target-scope.md`
  Read when choosing `working`, `staged`, or `committed`, and when analyzing only a subdirectory target.
- `references/interpreting-change-warnings.md`
  Read when the tool warns about tests, docs, or config drift and you need to decide whether to act or downgrade it.

## Checks

- changed file classes
- affected modules
- docs sync
- tests sync
- risk summary
- git-aware working/staged/committed modes when available

## Run

```bash
node scripts/run.js --mode working
node scripts/run.js --mode staged --json
node scripts/run.js --mode committed --json
```
