---
schema-version: 2
name: guard-template
title: Guard Template
description: Template for creating a new guard skill.
kind: guard
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [guard keyword, 门禁关键词]
negative-keywords: [negative keyword, 负向关键词]
priority: 95
runtime: scripted
executor: node
permissions: [Read, Bash]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: draft
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [template, guard]
aliases: [alias keyword, 别名关键词]
---

# Guard Template

Describe:

1. block conditions
2. pass conditions
3. required upstream checks
4. invocation command
