---
schema-version: 2
name: architecture
title: Architecture Domain
description: System design and technical decision making: service boundaries, APIs, data flow, migrations, reliability, and scaling tradeoffs. Use when the task is about architecture, topology, or irreversible system choices.
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [architecture, system design, api, boundaries, migration, data flow, 架构, 系统设计, 接口设计, 边界, 迁移, 数据流, technical architecture, system architecture, 技术架构, 系统架构]
negative-keywords: [visual design, 视觉设计]
priority: 78
runtime: knowledge
executor: none
permissions: [Read]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 60
tags: [domain, architecture]
aliases: [system-design, 系统设计]
---

# Architecture Domain

## Use This When

- the task is about service boundaries, API shape, queues, cache, or deployment topology
- the user asks for tradeoffs, constraints, or migration paths

## Quick Judgement

- business problem first
- system boundary second
- technology choice third
- document tradeoffs and constraints

## Read These References

- `references/api-boundaries-and-data-flow.md`
  Read when designing service/API boundaries, ownership lines, or data flow through the system.
- `references/reliability-and-scalability.md`
  Read when the problem is latency, throughput, resilience, caching, queuing, or scaling pressure.
- `references/migration-and-decision-records.md`
  Read when choosing among options, planning transitions, or writing down irreversible decisions.
- `references/expert-requirements-and-constraints.md`
  Read when the architecture work needs deeper constraint framing before any pattern or technology choice.
- `references/expert-pattern-selection.md`
  Read when choosing among modular monolith, hexagonal, event-driven, microservices, or CQRS-like shapes.
- `references/expert-middleware-evolution.md`
  Read when the architecture pressure lives in cache, queue, database, search, or observability evolution.
- `references/expert-reliability-and-ha.md`
  Read when the problem is HA, DR, failure controls, or reliability proof under load.
- `references/expert-performance-architecture.md`
  Read when latency, throughput, saturation, or cost pressure are architecture-level constraints.
- `references/expert-security-architecture.md`
  Read when trust boundaries, secrets, auth, encryption, or auditability must shape the design itself.
- `references/expert-platform-governance.md`
  Read when observability, team fit, ownership, ADRs, or governance are part of the architecture decision.
- `references/top-developer-overlays.md`
  Read when you want the compact expert index that routes into the split architecture modules.

## Route onward

- formal decision record -> `architecture-decision`
- implementation-heavy work -> `development`
- release process -> `ship`
