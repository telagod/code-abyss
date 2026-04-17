---
schema-version: 2
name: sage
title: 总路由
description: 个人 SKILL 体系总入口。根据用户意图，将任务分流到 domain、workflow、tool 或 guard。
kind: router
visibility: public
user-invocable: false
trigger-mode: [auto]
trigger-keywords: [router, 总路由, 分流]
negative-keywords: []
priority: 100
runtime: knowledge
executor: none
permissions: [Read]
risk-level: low
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 90
tags: [router, core]
aliases: []
---

# Sage Router

## Rule

1. 用户要执行任务时，优先 workflow。
2. 用户要知识与方法时，优先 domain。
3. 用户显式要求检查、验证、扫描时，优先 tool。
4. guard 默认自动补挂，不主动抢路由。

## Core routes

- engineering: `development`, `investigate`, `bugfix`, `review`
- security: `security`, `verify-security`
- system design: `architecture`, `architecture-decision`
- frontend experience: `frontend-design`
- shipping: `ship`, `pre-merge-gate`

## Conflict policy

- UI/UX/视觉/组件设计 -> `frontend-design`
- API/边界/系统拆分/消息/缓存 -> `architecture`
- 报错/回归/异常 -> `bugfix`
- 审查/评估/风险清单 -> `review`

## Fallback

If no skill is clearly dominant, ask at most one clarification question.

## Read These References

- `references/route-policy.md`
  Read when the problem is route precedence, conflict handling, or host-specific import strategy.
- `references/skill-catalog.md`
  Read when you need a compact map of all major skills and their responsibilities.
