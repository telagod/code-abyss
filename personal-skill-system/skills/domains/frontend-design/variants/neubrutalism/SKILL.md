---
schema-version: 2
name: neubrutalism
title: Neubrutalism 风格
description: 强边框、高饱和、低圆角的前端视觉风格 skill，适合大胆、叛逆、性能敏感界面。
kind: domain
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [neubrutalism, brutal ui, 粗野风格]
negative-keywords: [温柔品牌调性]
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
