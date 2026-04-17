---
schema-version: 2
name: architecture-decision
title: 架构决策工作流
description: 面向关键技术决策的工作流，强调约束、方案对比、取舍、迁移与验收标准。
kind: workflow
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [架构决策, tradeoff, 选型, migration plan]
negative-keywords: [单点小修复]
priority: 80
auto-chain: [verify-change]
runtime: knowledge
executor: none
permissions: [Read]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 60
tags: [workflow, architecture]
aliases: [arch-decision]
---

# Architecture Decision Workflow

## Chain

1. define constraints
2. list candidate approaches
3. compare tradeoffs
4. select with explicit reasons
5. document migration and rollback

## Read These References

- `references/constraint-mapping.md`
  Read when you need to surface business, system, and technical constraints before comparing options.
- `references/tradeoff-and-migration.md`
  Read when the hard part is choosing, documenting tradeoffs, or planning migration and rollback.
