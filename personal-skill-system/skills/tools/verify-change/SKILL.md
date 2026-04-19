---
schema-version: 2
name: verify-change
title: Verify Change Tool
description: Diff-aware validation of changed files, likely module impact, and possible documentation drift. Use when the task is to inspect a change set rather than a whole module.

kind: tool
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [verify-change, diff analysis, change audit, 变更校验, 差异分析, 变更审计, change review, diff review, 改动审查]
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
aliases: [vc, change-audit, 变更审计]
---

# Verify Change Tool

## Read These References

- `references/git-modes-and-target-scope.md`
  Read when choosing `working`, `staged`, or `committed`, and when analyzing only a subdirectory target.
- `references/interpreting-change-warnings.md`
  Read when the tool warns about tests, docs, or config drift and you need to decide whether to act or downgrade it.
- `references/expert-operating-principles.md`
  Read when change analysis must account for blast radius, sensitive surfaces, or release verification strategy.

## Checks

- changed file classes
- affected modules
- sensitive change surfaces
- docs sync
- tests sync
- risk summary
- recommended follow-up checks
- git-aware working/staged/committed modes when available

## Run

```bash
node scripts/run.js --mode working
node scripts/run.js --mode staged --json
node scripts/run.js --mode committed --json
```
