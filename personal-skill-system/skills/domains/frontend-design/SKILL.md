---
schema-version: 2
name: frontend-design
title: Frontend Design Domain
description: UI, UX, interaction systems, accessibility, hierarchy, and style direction. Use when the task is about frontend experience, design systems, visual polish, or component behavior.
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [ui, ux, frontend design, component design, accessibility, 前端设计, 界面设计, 用户体验, 组件设计, 无障碍, ui design, interaction design, UI设计, 交互设计]
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
aliases: [ui-design, 前端设计]
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
- `references/expert-operating-principles.md`
  Read when the design task needs top-tier hierarchy, interaction, accessibility, and visual-direction judgement.

## Route onward

- implementation-heavy UI changes -> `development`
- larger system constraint discussion -> `architecture`
