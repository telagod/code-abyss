---
schema-version: 2
name: claymorphism
title: Claymorphism Variant
description: Claymorphism design variant for soft, puffy surfaces, large radii, and tactile depth. Use when the desired frontend style is claymorphism.

kind: domain
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [claymorphism, soft ui, 粘土风, 软拟态, soft neumorphism, 软拟物]
negative-keywords: [api design, 接口设计]
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
aliases: [soft-ui, 粘土风]
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
- `references/component-recipes.md`
  Read when turning the style into cards, buttons, inputs, panels, and layout primitives.
- `references/accessibility-and-responsive-constraints.md`
  Read when softness starts to hurt contrast, touch targets, or small-screen legibility.
- `references/fallbacks-and-misuse.md`
  Read when the style starts feeling muddy, low-contrast, or too heavy on constrained devices.

## Output Expectations

- token rules
- component recipes
- contrast constraints
- responsive fallbacks
