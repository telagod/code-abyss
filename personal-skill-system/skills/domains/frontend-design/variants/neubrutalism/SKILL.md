---
schema-version: 2
name: neubrutalism
title: Neubrutalism Variant
description: Neubrutalism design variant for bold color, thick borders, offset shadows, and intentionally blunt interfaces. Use when the desired frontend style is neubrutalism.

kind: domain
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [neubrutalism, brutalist ui]
negative-keywords: [api design]
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
aliases: []
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
- `references/restraint-and-responsive-behavior.md`
  Read when the style risks becoming noisy, childish, or cramped on smaller screens.
