---
schema-version: 2
name: bugfix
title: 缺陷修复工作流
description: 面向报错、回归、异常行为的修复流程，强调复现、根因、最小修复、验证与摘要闭环。
kind: workflow
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [fix, bug, 报错, 异常, 回归, 修复]
negative-keywords: [brainstorm, review-only]
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
aliases: [fix-bug]
---

# Bugfix Workflow

## Chain

1. reproduce
2. isolate root cause
3. apply the smallest safe fix
4. verify the changed surface
5. summarize risk and next steps

## Auto-chain

- run `verify-quality`
- run `verify-security` when the issue touches input, auth, execution, or secrets

## Read These References

- `references/minimal-fix-patterns.md`
  Read when the repair scope is unclear and you need a disciplined way to keep the fix small.
- `references/verification-and-regression.md`
  Read when deciding how to validate the fix and prevent recurrence.
