---
schema-version: 2
name: orchestration
title: Orchestration Domain
description: Coordination, decomposition, sequencing, ownership, and integration across multi-step work. Use when the task spans many modules, phases, or collaborating roles.
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [orchestration, coordination, decomposition, workflow]
negative-keywords: [single file bug]
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
- `references/expert-work-decomposition.md`
  Read when the hard part is how to split the work without creating chaos.
- `references/expert-ownership-and-write-boundaries.md`
  Read when ownership, write surfaces, and conflict prevention are the core orchestration problem.
- `references/expert-dependency-and-integration.md`
  Read when sequencing and final integration are the main source of risk.
- `references/expert-status-and-handoffs.md`
  Read when the system needs clearer handoffs, completion signals, or status reporting.
- `references/expert-operating-principles.md`
  Read when you want the compact expert index that routes into the split orchestration modules.

## Route onward

- explicit multi-agent / parallel work -> `multi-agent`
