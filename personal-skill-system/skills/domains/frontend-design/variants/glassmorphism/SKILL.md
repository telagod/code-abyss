---
schema-version: 2
name: glassmorphism
title: Glassmorphism Variant
description: Glassmorphism design variant for frosted transparency, layered blur, and depth. Use when the desired frontend style is glassmorphism.

kind: domain
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [glassmorphism, frosted glass]
negative-keywords: [api design]
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

# Glassmorphism Variant

## Use This When

Use when the UI should feel translucent, layered, and slightly futuristic.

## Quick Judgement

Prefer:

- blur with restraint
- stacked surfaces
- strong contrast for text and controls

## Read These References

- `references/layering-and-contrast.md`
  Read when arranging translucent panes, text contrast, and surface stacking.
- `references/performance-and-fallbacks.md`
  Read when blur, transparency, or mobile cost becomes the main constraint.
