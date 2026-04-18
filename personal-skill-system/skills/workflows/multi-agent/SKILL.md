---
schema-version: 2
name: multi-agent
title: Multi-Agent Workflow
description: Parallel execution planning with explicit ownership, write boundaries, dependency order, and integration rules. Use when the task needs real concurrent streams rather than simple conceptual decomposition.
kind: workflow
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [multi-agent, parallel, delegation, parallelize]
priority: 83
depends-on: [orchestration]
runtime: knowledge
executor: none
permissions: [Read]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [workflow, orchestration]
aliases: []
---

# Multi-Agent Workflow

## Chain

1. identify separable workstreams
2. assign ownership by file or concern
3. define done criteria per stream
4. prevent overlapping writes
5. integrate and review at the end

## Rules

- do not parallelize the critical blocker if local progress depends on it now
- keep disjoint write sets whenever possible
- close the loop with review, not just completion

## Read These References

- `references/execution-playbook.md`
  Read when you need the end-to-end operating sequence for parallel work.
- `references/prompt-templates.md`
  Read when you want reusable prompts for lead, worker, reviewer, or fallback sequential mode.
- `references/failure-recovery.md`
  Read when streams diverge, block each other, or produce conflicting outputs.

## Host Adaptation

- if the host supports real subagents, use explicit ownership and integration checkpoints
- if the host does not support subagents, simulate roles sequentially: lead -> worker -> reviewer
