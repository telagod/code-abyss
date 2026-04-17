---
schema-version: 2
name: guard-template
title: 关卡模板
description: 用于创建新的 guard skill。
kind: guard
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: []
negative-keywords: []
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
aliases: []
---

# Guard Template

Describe:

1. block conditions
2. pass conditions
3. required upstream checks
4. invocation command
