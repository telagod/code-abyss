---
schema-version: 2
name: ship
title: Ship Workflow
description: Release and merge workflow focused on readiness, risk, rollback, and guard conditions. Use when the task is to ship, merge, deploy, or prepare a change for release.
kind: workflow
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [ship, release, deploy, merge, 发布, 上线, 部署, 合并, go live, production release, 上线发布]
negative-keywords: [discuss only, 仅讨论]
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
aliases: [release-flow, 发布流程]
---

# Ship Workflow

## Chain

1. confirm target and branch state
2. run the narrowest relevant checks
3. summarize user-facing impact
4. call out remaining risk
5. name the rollback path and owner
6. proceed only if guard conditions pass

## Read These References

- `references/readiness-checklist.md`
  Read when deciding whether the change is actually ready to merge or release.
- `references/release-risk-and-rollback.md`
  Read when the release surface is risky and you need explicit rollback or mitigation planning.
- `references/expert-operating-principles.md`
  Read when the release needs stronger go/no-go judgement, rollback criteria, or operator-confidence framing.
