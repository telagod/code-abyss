---
schema-version: 2
name: development
title: Development Domain
description: Implementation, refactoring, debugging, and test strategy for code changes. Use when the task is mainly about writing or modifying code rather than high-level architecture or explicit audit work.
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [coding, development, code, refactor, implement, 开发, 编码, 代码实现, 重构, 实现, software development, write code, 编程开发, 写代码]
negative-keywords: [penetration test, 渗透测试, visual design, 视觉设计]
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
aliases: [coding, 开发]
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
- `references/expert-python-design-and-types.md`
  Read when Python code shape, type discipline, and boundary design are the hard part.
- `references/expert-python-concurrency.md`
  Read when the real decision is async versus threads versus processes versus workers.
- `references/expert-python-memory-and-runtime.md`
  Read when memory behavior, object lifetime, or runtime pressure dominate the problem.
- `references/expert-query-shape-and-orm.md`
  Read when ORM, query shape, or N+1 behavior are the real boundary failures.
- `references/expert-transactions-pagination-and-write-paths.md`
  Read when transactions, pagination, or write-path design are the real persistence risks.
- `references/expert-bottleneck-diagnosis.md`
  Read when the first task is proving where latency, throughput, or saturation is actually lost.
- `references/expert-batching-caching-and-concurrency.md`
  Read when the best fix is in batching, caching, coalescing, or bounded concurrency rather than micro-tuning.
- `references/expert-config-and-runtime-boundaries.md`
  Read when runtime safety depends on better configuration contracts and boundary defaults.
- `references/expert-observability-and-shutdown.md`
  Read when production-readiness hinges on operator visibility, health semantics, or shutdown behavior.
- `references/top-developer-overlays.md`
  Read when you want the compact expert index that routes into the split development modules.

## Route onward

- bug or regression -> `bugfix`
- code review -> `review`
- broad architecture choice -> `architecture`
