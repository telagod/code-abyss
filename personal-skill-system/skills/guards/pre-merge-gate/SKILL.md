---
schema-version: 2
name: pre-merge-gate
title: Pre-Merge Gate
description: Merge and release gate that consumes verification results before a risky change is landed. Use when the user explicitly wants a merge gate or release gate.
kind: guard
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [pre-merge, merge gate, release gate, 合并前检查, 合并门禁, 发布门禁, merge check, 合并检查]
negative-keywords: []
priority: 94
auto-chain: [verify-change, verify-quality, verify-security]
runtime: scripted
executor: node
permissions: [Read, Bash]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 30
tags: [guard, merge]
aliases: [merge-gate, 合并门禁]
---

# Pre-Merge Gate

## Read These References

- `references/merge-readiness-policy.md`
  Read when deciding which findings should block merge and which should only require reviewer awareness.
- `references/release-risk-escalation.md`
  Read when the gate detects unresolved risk and you need a rollback, mitigation, or approval path.

## Block when

- high-risk findings remain open
- release notes or impact summary are missing
- security-sensitive paths changed without explicit review
- required verification has not run
- lightweight security or change heuristics still indicate unresolved risk

## Run

```bash
node scripts/run.js
node scripts/run.js --target ./path --json
```
