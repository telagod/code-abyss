---
schema-version: 2
name: claymorphism
title: Claymorphism 风格
description: 柔和圆润的前端视觉风格 skill，适合亲和、软性、触感化界面。
kind: domain
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [claymorphism, soft ui, 柔和界面]
negative-keywords: [低性能极限约束]
priority: 58
runtime: knowledge
executor: none
permissions: [Read, Write]
risk-level: low
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 90
tags: [design, variant]
aliases: []
---

# Claymorphism Variant

## Use This When

Use when the UI should feel soft, tactile, rounded, and friendly.

## Quick Judgement

Prefer:

- large radii
- layered soft shadows
- restrained contrast

## Read These References

- `references/surface-and-shadow-system.md`
  Read when building the visual token system for puffy surfaces, inner shadows, and depth.
- `references/fallbacks-and-misuse.md`
  Read when the style starts feeling muddy, low-contrast, or too heavy on constrained devices.
