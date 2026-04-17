---
schema-version: 2
name: verify-security
title: 安全校验工具
description: 对输入处理、命令执行、认证、敏感信息与危险模式做快速安全检查。
kind: tool
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [verify-security, 安全扫描, security check]
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
aliases: [vs]
---

# Verify Security Tool

## Read These References

- `references/heuristic-security-scan-boundaries.md`
  Read when deciding what this lightweight scan can and cannot prove.
- `references/triaging-security-findings.md`
  Read when a finding appears and you need to separate real risk from fixture noise or benign matches.

## Checks

- input -> sink patterns
- secrets exposure
- unsafe execution
- auth and boundary mistakes
- lightweight heuristic scans for eval, exec, shell, innerHTML, and secret-like material

## Run

```bash
node scripts/run.js --target ./src
node scripts/run.js --target ./src --json
```
