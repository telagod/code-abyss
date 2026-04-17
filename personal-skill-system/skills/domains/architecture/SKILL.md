---
schema-version: 2
name: architecture
title: 架构知识域
description: 系统设计与技术决策知识索引，覆盖边界划分、数据流、接口、性能、可靠性与扩展性。
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [架构, 系统设计, api, 边界, 数据流, 服务拆分]
negative-keywords: [纯ui, 纯视觉]
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
aliases: [system-design]
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

## Route onward

- formal decision record -> `architecture-decision`
- implementation-heavy work -> `development`
- release process -> `ship`
