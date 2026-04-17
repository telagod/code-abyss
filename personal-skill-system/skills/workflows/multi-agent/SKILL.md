---
schema-version: 2
name: multi-agent
title: 多 Agent 编排工作流
description: 面向多角色并行协作的工作流，覆盖任务拆解、文件所有权、并发约束、等待与收口。
kind: workflow
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [multi-agent, 多agent, 并行协作, delegation, 拆任务]
negative-keywords: [单文件小修]
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
