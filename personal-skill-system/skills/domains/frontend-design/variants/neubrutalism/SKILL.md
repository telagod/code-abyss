---
schema-version: 2
name: neubrutalism
title: Neubrutalism Variant
description: Neubrutalism design variant for bold color, thick borders, offset shadows, and intentionally blunt interfaces. Use when the desired frontend style is neubrutalism.

kind: domain
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [neubrutalism, brutalist ui, 新粗野主义, 粗野风界面, brutal style, 粗野风格]
negative-keywords: [api design, 接口设计]
priority: 65
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
aliases: [brutalist-style, 新粗野主义]
---

# Neubrutalism Variant

## Use This When

Use when the UI should feel loud, graphic, and intentional.

## Quick Judgement

Prefer:

- heavy borders
- offset shadows
- limited radii
- bold color blocks

## Read These References

- `references/graphic-hierarchy-and-tokens.md`
  Read when setting border weight, color blocks, and punchy component hierarchy.
- `references/component-recipes.md`
  Read when applying the style to cards, buttons, forms, alerts, and navigation consistently.
- `references/accessibility-and-density-controls.md`
  Read when boldness starts to reduce readability, spacing, or responsive fit.
- `references/restraint-and-responsive-behavior.md`
  Read when the style risks becoming noisy, childish, or cramped on smaller screens.

## Output Expectations

- hierarchy tokens
- component recipes
- density controls
- responsive restraint rules
