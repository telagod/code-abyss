---
schema-version: 2
name: sage
title: Sage Router
description: Root router for the personal skill system. Route requests into domains, workflows, tools, and guards based on intent, scope, risk, and execution depth. Use when the bundle needs a stable top-level routing policy.
kind: router
visibility: public
user-invocable: false
trigger-mode: [auto]
trigger-keywords: [router, routing, skill system, dispatch, 路由, 技能路由, 技能系统, 分发]
negative-keywords: []
priority: 100
runtime: knowledge
executor: none
permissions: [Read]
risk-level: low
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-18
review-cycle-days: 60
tags: [router, core]
aliases: [router-core, 总路由]
---

# Sage Router

## Route model

Classify every request across four axes:

1. intent
2. problem domain
3. execution depth
4. risk level

## Intent order

Use this precedence:

1. explicit skill name or alias
2. self-system work -> `skill-evolution`
3. action request -> workflow
4. explicit verification request -> tool
5. advisory request -> domain
6. guard only as downstream risk control

## Core routes

- engineering execution: `development`, `investigate`, `bugfix`, `review`
- security and trust boundaries: `security`, `verify-security`
- architecture and irreversible choices: `architecture`, `architecture-decision`
- design system and visual work: `frontend-design`
- delivery and release risk: `ship`, `pre-merge-gate`
- skill-system self-hosting: `skill-evolution`

## Escalation rules

- uncertain cause -> `investigate`
- known fix intent -> `bugfix`
- findings-first evaluation -> `review`
- tradeoff-heavy or migration-heavy choice -> `architecture-decision`
- skill bundle, route map, registry, template, or portability work -> `skill-evolution`
- explicit parallel ownership plan -> `multi-agent`

## Conflict policy

- UI, UX, interaction, or component language -> `frontend-design`
- API boundary, service split, queue, cache, or migration -> `architecture`
- runtime topology, cluster, IaC, or GitOps -> `infrastructure`
- agent coordination theory -> `orchestration`
- actual parallel execution plan -> `multi-agent`
- prompt, eval, RAG, or tool-using agent behavior -> `ai`

## Auto-chain policy

- `bugfix` may chain into `verify-quality` and `verify-security`
- `ship` may chain into `verify-change` and `pre-merge-gate`
- `skill-evolution` may chain into `verify-change` and `verify-quality`
- security-sensitive work may attach `verify-security`

## Fallback

If no skill is clearly dominant, ask at most one clarification question.

## Read These References

- `references/route-policy.md`
  Read when the problem is route precedence, conflict handling, or escalation depth.
- `references/skill-catalog.md`
  Read when you need a compact map of major skills and their responsibilities.