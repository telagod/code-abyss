---
schema-version: 2
name: bugfix
title: Bugfix Workflow
description: Known-defect repair workflow focused on minimal safe change, regression prevention, and verification. Use when the defect is understood and the task is to fix it.
kind: workflow
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [fix, bug, error, regression, 修复, 缺陷, 报错, 回归, bug fix, hotfix, 修bug, 故障修复]
negative-keywords: [brainstorm, 头脑风暴, review-only, 仅评审]
priority: 85
depends-on: [investigate]
auto-chain: [verify-quality, verify-security]
runtime: knowledge
executor: none
permissions: [Read, Write, Grep, Bash]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [workflow, bugfix]
aliases: [fix-bug, 缺陷修复]
---

# Bugfix Workflow

## Chain

1. reproduce
2. isolate root cause
3. apply the smallest safe fix
4. verify the changed surface
5. summarize risk and next steps
6. escalate only if the bug exposes a broken boundary rather than a local defect

## Auto-chain

- run `verify-quality`
- run `verify-security` when the issue touches input, auth, execution, or secrets

## Read These References

- `references/minimal-fix-patterns.md`
  Read when the repair scope is unclear and you need a disciplined way to keep the fix small.
- `references/verification-and-regression.md`
  Read when deciding how to validate the fix and prevent recurrence.
- `references/expert-operating-principles.md`
  Read when the repair needs stronger cause discipline, boundary judgement, or regression protection.
