---
schema-version: 2
name: verify-security
title: Verify Security Tool
description: Rule-based security scan for dangerous patterns, trust-boundary violations, and common vulnerability clues. Use when the task is explicit security validation.

kind: tool
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [verify-security, security scan, vulnerability scan, 安全扫描, 漏洞扫描, 安全校验, security check, vulnerability review, 安全体检, 漏洞审查]
negative-keywords: []
priority: 95
runtime: scripted
executor: node
permissions: [Read, Grep, Bash]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 30
tags: [tool, security]
aliases: [vs, security-audit, 安全校验]
---

# Verify Security Tool

## Read These References

- `references/heuristic-security-scan-boundaries.md`
  Read when deciding what this lightweight scan can and cannot prove.
- `references/triaging-security-findings.md`
  Read when a finding appears and you need to separate real risk from fixture noise or benign matches.
- `references/expert-operating-principles.md`
  Read when the scan needs stronger severity judgement, exploit-surface framing, or triage discipline.

## Checks

- input -> sink patterns
- secrets exposure
- unsafe execution
- auth and boundary mistakes
- lightweight heuristic scans for eval, exec, shell, innerHTML, unsafe deserialization, TLS bypass, permissive CORS, and secret-like material
- hotspot summary

## Run

```bash
node scripts/run.js --target ./src
node scripts/run.js --target ./src --json
```
