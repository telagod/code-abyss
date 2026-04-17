---
schema-version: 2
name: infrastructure
title: 基础设施知识域
description: 云原生基础设施知识索引，覆盖 Kubernetes、GitOps、IaC、部署拓扑、平台治理与运行边界。
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [k8s, kubernetes, gitops, iac, terraform, infra, platform]
negative-keywords: [纯视觉, 纯业务文案]
priority: 77
runtime: knowledge
executor: none
permissions: [Read, Bash]
risk-level: high
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [domain, infrastructure]
aliases: [platform-infra]
---

# Infrastructure Domain

## Use This When

- the task is cluster, deployment topology, GitOps, IaC, or platform operations
- the user asks about Kubernetes, Helm, Terraform, or runtime governance

## Quick Judgement

- default to declarative state, not hand-tuned snowflakes
- separate environment concerns before choosing tooling
- identity and secrets are first-class architecture, not YAML afterthoughts
- every rollout plan needs rollback and observability

## Read These References

- `references/kubernetes-and-topology.md`
  Read when the question is workload shape, cluster boundaries, deployment topology, or release strategy.
- `references/gitops-and-drift-control.md`
  Read when the issue is desired state, reconciliation, config drift, or promotion flow.
- `references/identity-secrets-and-runtime-ops.md`
  Read when the task touches access, secrets, tenancy, runtime governance, or operational safety.

## Output Expectations

- name the control plane and runtime boundaries
- state the source of desired truth
- define how drift is detected and corrected
- specify rollout, rollback, and access controls
