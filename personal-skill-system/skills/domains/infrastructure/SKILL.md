---
schema-version: 2
name: infrastructure
title: Infrastructure Domain
description: Infrastructure and platform runtime knowledge: Kubernetes, Terraform, GitOps, identity, cluster controls, and deployment topology. Use when the task is about infra shape or runtime platform operations.
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [kubernetes, terraform, gitops, infra, cluster, k8s, 基础设施, 云原生, 集群, 平台运维, kubernetes集群, infra architecture, cloud infrastructure, 基础架构, 云基础设施]
negative-keywords: [ux, 用户体验, component design, 组件设计]
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
aliases: [platform-infra, 平台基础设施]
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
- `references/expert-operating-principles.md`
  Read when the infra work needs stronger source-of-truth, control-plane, tenancy, or drift-control judgement.
- `references/expert-cloud-native-topology.md`
  Read when the hard part is the cloud-native shape itself: environment, tenancy, and topology decisions.
- `references/expert-control-plane-and-tenancy.md`
  Read when the main question is control-plane ownership, shared risk, or tenancy boundary.
- `references/expert-cluster-shape-and-environment-strategy.md`
  Read when cluster count, environment shape, or promotion flow are the real design choices.
- `references/expert-service-mesh-and-runtime-control.md`
  Read when runtime policy, service mesh, or traffic governance become first-class concerns.
- `references/expert-traffic-governance-and-mesh-adoption.md`
  Read when the real question is whether mesh or traffic governance is justified at all.
- `references/expert-runtime-policy-and-identity-plane.md`
  Read when workload identity, runtime policy, and trust enforcement are the hard parts.
- `references/expert-multi-region-and-dr.md`
  Read when multi-region, failover, DR, or geographic blast radius drive the infra decision.
- `references/expert-failover-topology-and-consistency.md`
  Read when failover shape and consistency tradeoffs are driving the design.
- `references/expert-dr-exercises-and-recovery-operations.md`
  Read when DR realism depends on exercises, operator drills, and recovery operations.

## Output Expectations

- name the control plane and runtime boundaries
- state the source of desired truth
- define how drift is detected and corrected
- specify rollout, rollback, and access controls
