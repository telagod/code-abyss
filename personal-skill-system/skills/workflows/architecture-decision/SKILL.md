---
schema-version: 2
name: architecture-decision
title: Architecture Decision Workflow
description: Structured flow for architectural tradeoffs, option comparison, migration design, and rollback thinking. Use when the task is a decision, not just a general architecture explanation.
kind: workflow
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [architecture decision, tradeoff, migration plan, adr]
negative-keywords: [small local fix]
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
- `references/expert-decision-framing.md`
  Read when the first problem is deciding what the real decision even is.
- `references/expert-option-scoring.md`
  Read when candidate paths exist and now need disciplined scoring or weighting.
- `references/expert-migration-and-rollback.md`
  Read when the choice creates a bridge period, coexistence cost, or rollback risk.
- `references/expert-org-and-ownership-tradeoffs.md`
  Read when the architecture decision also changes who builds, owns, or operates the system.
- `references/top-developer-overlays.md`
  Read when you want the compact expert index that routes into the split decision modules.
