---
schema-version: 2
name: devops
title: DevOps 知识域
description: DevOps 与工程交付知识索引，覆盖测试、CI、部署、可观测性与运行质量。
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [devops, ci, deploy, test pipeline, observability]
negative-keywords: [纯视觉设计]
priority: 68
runtime: knowledge
executor: none
permissions: [Read, Bash]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 60
tags: [domain, devops]
aliases: []
---

# DevOps Domain

## Use This When

- the problem is delivery, CI, runtime health, or observability
- the user asks about release readiness or guardrails

## Quick Judgement

- delivery speed without safety is debt
- CI should fail on meaningful risk, not vanity formatting noise alone
- observability must answer what broke, where, and since when

## Read These References

- `references/ci-cd-and-release-gates.md`
  Read when the task is pipeline design, release readiness, or deployment safety gates.
- `references/observability-and-incident-readiness.md`
  Read when the problem is logging, metrics, tracing, alerting, or incident response quality.

## Route onward

- shipping flow -> `ship`
- pre-release checks -> `pre-merge-gate`
