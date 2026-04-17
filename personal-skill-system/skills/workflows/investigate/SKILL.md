---
schema-version: 2
name: investigate
title: 调查工作流
description: 面向未知问题的系统化调查流程，强调证据收集、假设生成、排除与结论闭环。
kind: workflow
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [investigate, debug, why, 排查, 定位]
negative-keywords: [直接重写, 纯头脑风暴]
priority: 88
runtime: knowledge
executor: none
permissions: [Read, Grep, Bash]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [workflow, investigate]
aliases: [debug-investigate]
---

# Investigate Workflow

## Chain

1. collect facts
2. isolate symptoms
3. form hypotheses
4. test the strongest hypothesis first
5. conclude root cause or label as unverified

## Constraint

Do not jump to fixes before the evidence chain is coherent.

## Read These References

- `references/evidence-collection.md`
  Read when the investigation needs a tighter evidence chain, artifact list, or reproduction surface.
- `references/hypothesis-testing.md`
  Read when multiple plausible causes exist and you need an order for testing them.
