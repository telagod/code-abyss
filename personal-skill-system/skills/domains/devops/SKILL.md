---
schema-version: 2
name: devops
title: DevOps Domain
description: CI/CD, release safety, observability, and operational readiness. Use when the task is about pipelines, deploy flow, release gates, logging, metrics, or runtime readiness.
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [devops, ci, cd, pipeline, deploy, observability]
negative-keywords: [pure product design]
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
- `references/expert-operating-principles.md`
  Read when the task needs platform-grade release engineering judgement, rollback strategy, or signal-quality design.
- `references/expert-release-gates.md`
  Read when the hard part is deciding what should block or allow a release.
- `references/expert-release-gate-design.md`
  Read when gate depth, gate purpose, or evidence requirements need sharper design.
- `references/expert-rollback-and-release-operations.md`
  Read when rollback, staged rollout, or release operations are the real difficulty.
- `references/expert-observability-operations.md`
  Read when operator visibility, signal design, and diagnosis speed are the core DevOps problem.
- `references/expert-signal-design-and-instrumentation.md`
  Read when the question is what signals and instrumentation should exist at all.
- `references/expert-alerts-runbooks-and-diagnosis.md`
  Read when alerts, runbooks, and diagnosis workflow are the weak point.

## Route onward

- shipping flow -> `ship`
- pre-release checks -> `pre-merge-gate`
