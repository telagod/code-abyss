---
schema-version: 2
name: verify-module
title: 模块校验工具
description: 校验模块目录是否完整，检查代码、文档、脚本与测试骨架是否匹配。
kind: tool
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [verify-module, 模块校验]
negative-keywords: []
priority: 90
runtime: scripted
executor: node
permissions: [Read, Glob, Bash]
risk-level: low
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [tool, module]
aliases: []
---

# Verify Module Tool

## Read These References

- `references/module-completeness-rules.md`
  Read when deciding which artifacts a module should contain and which warnings are meaningful.
- `references/interpreting-findings.md`
  Read when the checker reports missing docs, tests, or structure and you need to decide whether that is real debt.

## Checks

- source structure
- doc presence
- test presence
- naming consistency
- script/documentation surface hints

## Run

```bash
node scripts/run.js --target ./path/to/module --json
```
