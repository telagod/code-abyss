---
schema-version: 2
name: pre-commit-gate
title: Pre-Commit Gate
description: Commit-time gate that consumes validation results before a change is finalized locally. Use when the user explicitly wants a commit gate rather than general review.
kind: guard
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [pre-commit, commit gate]
negative-keywords: []
priority: 92
auto-chain: [verify-change, verify-quality]
runtime: scripted
executor: node
permissions: [Read, Bash]
risk-level: low
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 30
tags: [guard, commit]
aliases: []
---

# Pre-Commit Gate

## Read These References

- `references/commit-blocking-policy.md`
  Read when deciding what should actually block a commit versus what should only warn.
- `references/false-positive-handling.md`
  Read when the gate feels too noisy and you need a disciplined way to override or defer.

## Block when

- change summary is unclear
- risky code changed without tests
- docs drift is obvious
- quality checks return fatal issues
- lightweight quality or change heuristics still show unresolved warnings

## Run

```bash
node scripts/run.js
node scripts/run.js --target ./path --json
```
