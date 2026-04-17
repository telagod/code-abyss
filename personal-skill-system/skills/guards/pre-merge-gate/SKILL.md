---
schema-version: 2
name: pre-merge-gate
title: 合并前关卡
description: 在合并前做更严格的质量、安全与发布准备确认，阻断高风险未收敛的改动。
kind: guard
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [pre-merge, merge gate, 合并前关卡]
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
aliases: []
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
