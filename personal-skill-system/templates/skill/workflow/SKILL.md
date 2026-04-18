---
schema-version: 2
name: workflow-template
title: Workflow Template
description: Template for creating a new workflow skill.
kind: workflow
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: []
negative-keywords: []
priority: 80
runtime: knowledge
executor: none
permissions: [Read, Write, Grep, Bash]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: draft
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 60
tags: [template, workflow]
aliases: []
---

# Workflow Template

Describe:

1. entry condition
2. step-by-step execution chain
3. verification chain
4. summary format
