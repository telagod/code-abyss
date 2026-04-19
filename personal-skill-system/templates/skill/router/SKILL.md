---
schema-version: 2
name: router-template
title: Router Template
description: Template for creating a new router skill.
kind: router
visibility: public
user-invocable: false
trigger-mode: [auto]
trigger-keywords: [router keyword, 路由关键词]
negative-keywords: [negative keyword, 负向关键词]
priority: 100
runtime: knowledge
executor: none
permissions: [Read]
risk-level: low
supported-hosts: [codex, claude, gemini]
status: draft
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 90
tags: [template, router]
aliases: [alias keyword, 别名关键词]
---

# Router Template

Describe:

1. routing order
2. conflict policy
3. fallback behavior
