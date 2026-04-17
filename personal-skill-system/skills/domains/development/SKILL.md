---
schema-version: 2
name: development
title: 开发知识域
description: 通用开发知识索引，覆盖语言实现、重构、代码组织、调试与测试协作。
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [编程, 开发, 代码, 重构, 实现]
negative-keywords: [渗透, 审计, 视觉设计]
priority: 70
runtime: knowledge
executor: none
permissions: [Read, Write, Grep, Bash]
risk-level: low
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 60
tags: [domain, engineering]
aliases: [coding]
---

# Development Domain

## Use This When

- the task is mostly about implementing code
- the issue is language-level or module-level
- the user wants refactoring, debugging, or test strategy

## Quick Judgement

- understand module boundaries before editing
- prefer minimal diffs
- preserve existing conventions
- verify with the narrowest relevant test first

## Read These References

- `references/code-implementation-and-refactoring.md`
  Read when the task is implementation quality, structure, abstraction, or safe refactoring.
- `references/debugging-and-test-strategy.md`
  Read when the task is debugging, reproduction, regression prevention, or test selection.

## Route onward

- bug or regression -> `bugfix`
- code review -> `review`
- broad architecture choice -> `architecture`
