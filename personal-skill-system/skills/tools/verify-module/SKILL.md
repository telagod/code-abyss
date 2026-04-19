---
schema-version: 2
name: verify-module
title: Verify Module Tool
description: Module completeness and packaging validation for structure, key files, and importable shape. Use when auditing whether a module is coherent and complete.
kind: tool
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [verify-module, module audit, module completeness, 模块校验, 模块审计, 模块完整性, module check, 模块检查]
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
aliases: [module-audit, 模块审计]
---

# Verify Module Tool

## Read These References

- `references/module-completeness-rules.md`
  Read when deciding which artifacts a module should contain and which warnings are meaningful.
- `references/interpreting-findings.md`
  Read when the checker reports missing docs, tests, or structure and you need to decide whether that is real debt.
- `references/expert-operating-principles.md`
  Read when module validation needs stronger coherence judgement across docs, tests, scripts, and runtime shape.

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
