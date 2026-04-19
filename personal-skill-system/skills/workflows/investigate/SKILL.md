---
schema-version: 2
name: investigate
title: Investigate Workflow
description: Evidence-first investigation workflow for unknown failures, unclear regressions, and root-cause discovery. Use when the cause is not yet coherent enough to justify a fix.
kind: workflow
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [investigate, debug, why broken, root cause, 排查, 调试, 为什么坏了, 根因分析, incident investigation, issue triage, 故障定位, 问题排查]
negative-keywords: [known fix, 已知修复, review-only, 仅评审]
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
aliases: [debug-investigate, 故障排查]
---

# Investigate Workflow

## Chain

1. collect facts
2. isolate symptoms
3. form hypotheses
4. test the strongest hypothesis first
5. conclude root cause or label as unverified
6. hand off to `bugfix` only when the evidence chain is coherent

## Constraint

Do not jump to fixes before the evidence chain is coherent.

## Read These References

- `references/evidence-collection.md`
  Read when the investigation needs a tighter evidence chain, artifact list, or reproduction surface.
- `references/hypothesis-testing.md`
  Read when multiple plausible causes exist and you need an order for testing them.
- `references/expert-operating-principles.md`
  Read when the investigation needs stronger triage, hypothesis discipline, or explicit exit criteria.
