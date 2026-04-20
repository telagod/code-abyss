---
schema-version: 2
name: liquid-glass
title: Liquid Glass Variant
description: Liquid glass design variant for Apple-like translucent surfaces and depth-aware layering. Use when the desired frontend style is liquid glass.

kind: domain
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [liquid-glass, apple glass, liquid interface, 液态玻璃, 苹果玻璃, 液态界面, liquid style, 液态风格]
negative-keywords: [api design, 接口设计]
priority: 57
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
aliases: [apple-liquid-glass, 液态玻璃]
---

# Liquid Glass Variant

## Use This When

Use when the UI needs a premium, translucent, highly polished system aesthetic.

## Quick Judgement

Prefer:

- subtle depth
- premium motion
- extremely careful contrast and spacing

## Read These References

- `references/depth-and-motion-language.md`
  Read when tuning premium motion, depth cues, and surface choreography.
- `references/component-recipes.md`
  Read when the style must become a consistent card, navigation, modal, and control system.
- `references/fallback-contrast-and-legibility.md`
  Read when premium translucency starts hurting readability or touch ergonomics.
- `references/precision-and-device-constraints.md`
  Read when balancing polish against legibility, responsiveness, and device constraints.

## Output Expectations

- motion and depth rules
- component recipes
- legibility constraints
- device-aware fallbacks
