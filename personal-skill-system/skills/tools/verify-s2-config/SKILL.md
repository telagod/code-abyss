---
schema-version: 2
name: verify-s2-config
title: Verify S2 Config Tool
description: Heuristic validation for AntV S2 configuration misuse in dataCfg, SheetComponent props, imperative sheet lifecycle, pagination wiring, and field mapping shape. Use when the task is explicit S2 config validation.
kind: tool
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [verify-s2-config, s2 config check, pivot table validation, s2 validation, S2配置校验, 透视表配置校验, S2校验, SheetComponent 检查]
negative-keywords: []
priority: 88
runtime: scripted
executor: node
permissions: [Read, Grep, Bash]
risk-level: low
supported-hosts: [codex, claude, gemini]
status: beta
owner: self
last-reviewed: 2026-04-20
review-cycle-days: 30
tags: [tool, s2, chart, visualization]
aliases: [s2-config-audit, pivot-config-check, S2配置审计]
---

# Verify S2 Config Tool

## Read These References

- `references/heuristic-s2-scan-boundaries.md`
  Read when deciding what this lightweight S2 validator can and cannot prove.
- `references/triaging-s2-findings.md`
  Read when a finding appears and you need to separate true S2 misuse from framework-local abstractions.

## Checks

- `SheetComponent` missing `dataCfg` or `options`
- `showPagination` enabled without nearby `pagination` config
- `sheetType="table"` with inline `dataCfg.fields` missing `columns`
- `fields.rows` / `fields.columns` / `fields.values` written as scalar instead of array
- pivot-like `fields` blocks with rows or columns but missing values
- imperative `new PivotSheet(...)` / `new TableSheet(...)` without visible `render()` or `destroy()`

## Run

```bash
node scripts/run.js --target ./src
node scripts/run.js --target ./src --json
node scripts/run.js --target ./table/App.tsx --json
```
