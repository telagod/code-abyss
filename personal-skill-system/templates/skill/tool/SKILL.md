---
schema-version: 2
name: tool-template
title: Tool Template
description: Template for creating a new tool skill.
kind: tool
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [tool keyword, 工具关键词]
negative-keywords: [negative keyword, 负向关键词]
priority: 90
runtime: scripted
executor: node
permissions: [Read, Bash]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: draft
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [template, tool]
aliases: [alias keyword, 别名关键词]
---

# Tool Template

Describe:

1. what this tool validates or generates
2. expected inputs
3. output contract
4. run command
