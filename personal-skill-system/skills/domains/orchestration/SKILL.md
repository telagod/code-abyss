---
schema-version: 2
name: orchestration
title: 协同编排知识域
description: 协同编排知识索引，覆盖任务分解、并发边界、角色划分、状态传递与多 skill 协作。
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [orchestration, 多agent, 并行, 协作, 任务分解]
negative-keywords: [单文件微调]
priority: 73
runtime: knowledge
executor: none
permissions: [Read]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [domain, orchestration]
aliases: []
---

# Orchestration Domain

## Use This When

- the task spans multiple modules, multiple steps, or role-based parallel work
- the user asks for coordination, decomposition, or multi-skill chaining

## Quick Judgement

- split by stable boundaries, not by arbitrary file count
- one owner per write surface unless there is a deliberate merge plan
- dependency order matters more than parallel enthusiasm

## Read These References

- `references/task-decomposition.md`
  Read when deciding how to split work into streams, roles, or phases.
- `references/dependency-and-conflict-matrix.md`
  Read when the problem is shared files, sequencing, merge risk, or blocking dependencies.
- `references/signaling-and-integration.md`
  Read when coordinating state handoff, result reporting, or final integration.

## Route onward

- explicit multi-agent / parallel work -> `multi-agent`
