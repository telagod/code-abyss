---
schema-version: 2
name: ship
title: 交付工作流
description: 面向提交、合并、发布的交付流程，强调前置验证、变更摘要、风险确认与收口。
kind: workflow
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [ship, release, merge, deploy, 发布]
negative-keywords: [只讨论不执行]
priority: 79
auto-chain: [verify-change, pre-merge-gate]
runtime: knowledge
executor: none
permissions: [Read, Bash]
risk-level: high
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [workflow, release]
aliases: [release-flow]
---

# Ship Workflow

## Chain

1. confirm target and branch state
2. run the narrowest relevant checks
3. summarize user-facing impact
4. call out remaining risk
5. proceed only if guard conditions pass

## Read These References

- `references/readiness-checklist.md`
  Read when deciding whether the change is actually ready to merge or release.
- `references/release-risk-and-rollback.md`
  Read when the release surface is risky and you need explicit rollback or mitigation planning.
