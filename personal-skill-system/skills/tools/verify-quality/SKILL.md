---
schema-version: 2
name: verify-quality
title: 质量校验工具
description: 扫描复杂度、重复、命名与结构性异味，用于在改动后快速检查工程质量风险。
kind: tool
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [verify-quality, 质量检查, code quality]
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
tags: [tool, quality]
aliases: [vq]
---

# Verify Quality Tool

## Read These References

- `references/heuristic-scope-and-limits.md`
  Read when deciding how much trust to put in lightweight quality heuristics.
- `references/acting-on-quality-findings.md`
  Read when warnings appear and you need to decide whether to refactor now, defer, or ignore.

## Checks

- file complexity
- naming issues
- duplicated patterns
- oversized units
- long lines and TODO density heuristics

## Run

```bash
node scripts/run.js --target ./src
node scripts/run.js --target ./src --json
```
