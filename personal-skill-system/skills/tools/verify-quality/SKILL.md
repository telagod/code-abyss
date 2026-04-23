---
schema-version: 2
name: verify-quality
title: Verify Quality Tool
description: Code-shape and maintainability scan for complexity, size, and quality smells. Use when the task is explicit quality validation.

kind: tool
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [verify-quality, quality scan, complexity scan, code smell, 质量校验, 复杂度扫描, 代码异味, quality check, code quality check, 代码质量检查]
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
aliases: [vq, quality-audit, 质量审计]
---

# Verify Quality Tool

## Read These References

- `references/heuristic-scope-and-limits.md`
  Read when deciding how much trust to put in lightweight quality heuristics.
- `references/acting-on-quality-findings.md`
  Read when warnings appear and you need to decide whether to refactor now, defer, or ignore.
- `references/expert-operating-principles.md`
  Read when the quality scan should emphasize maintainability hotspots and language-specific smells rather than shallow noise.

## Checks

- file complexity
- oversized units
- language-specific smells
- long lines and TODO density heuristics
- hotspot summary

## Run

```bash
node scripts/run.js --target ./src
node scripts/run.js --target ./src --json
```
