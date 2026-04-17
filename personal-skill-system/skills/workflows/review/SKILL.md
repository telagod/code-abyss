---
schema-version: 2
name: review
title: 代码审查工作流
description: 以 bug、回归、安全与缺失测试为核心的审查流程，优先发现问题而不是给摘要。
kind: workflow
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [review, code review, 审查, 评审]
negative-keywords: [直接修复, 纯设计草案]
priority: 84
runtime: knowledge
executor: none
permissions: [Read, Grep]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [workflow, review]
aliases: [code-review]
---

# Review Workflow

## Output order

1. findings
2. open questions
3. residual risks
4. brief summary

## Severity order

- correctness
- security
- regression risk
- missing tests
- maintainability

## Read These References

- `references/findings-prioritization.md`
  Read when the review surface is large and findings need severity-driven ordering.
- `references/review-checklist.md`
  Read when you want a compact but disciplined pass over behavior, risk, and tests.
