---
schema-version: 2
name: frontend-design
title: 前端设计知识域
description: 前端设计与交互知识索引，覆盖 UI、UX、组件模式、可访问性与视觉风格选择。
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [ui, ux, 前端设计, 组件设计, 交互设计, 可访问性]
negative-keywords: [数据库, ssrf, queue]
priority: 76
runtime: knowledge
executor: none
permissions: [Read, Write]
risk-level: low
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 60
tags: [domain, design, frontend]
aliases: [ui-design]
---

# Frontend Design Domain

## Use This When

- the user asks for UI/UX direction
- the task is component structure, interaction, layout, motion, or design language

## Quick Judgement

- hierarchy first
- interaction clarity second
- accessibility always
- visual language should be intentional, not generic

## Read These References

- `references/information-architecture-and-interaction.md`
  Read when the issue is structure, flow, navigation, or interaction logic.
- `references/accessibility-and-visual-systems.md`
  Read when the work touches hierarchy, typography, contrast, spacing, or accessibility.
- `references/variant-selection-and-performance.md`
  Read when choosing among design variants or balancing aesthetics against performance constraints.

## Route onward

- implementation-heavy UI changes -> `development`
- larger system constraint discussion -> `architecture`
