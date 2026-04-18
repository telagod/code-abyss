---
schema-version: 2
name: tool-template
title: Tool Template
description: Template for creating a new tool skill.
kind: tool
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: []
negative-keywords: []
priority: 90
runtime: scripted
executor: node
permissions: [Read, Bash]
risk-level: low
supported-hosts: [codex, claude, gemini]
status: draft
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [template, tool]
aliases: []
---

# Tool Template

Describe:

1. inputs
2. outputs
3. failure conditions
4. invocation command
