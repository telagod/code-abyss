---
schema-version: 2
name: ai
title: AI 知识域
description: AI 与 agent 系统知识索引，覆盖 prompts、evaluation、tool use、RAG 与 guardrails。
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [ai, llm, prompt, rag, agent, eval]
negative-keywords: [纯基础设施排障]
priority: 66
runtime: knowledge
executor: none
permissions: [Read]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 60
tags: [domain, ai]
aliases: [llm]
---

# AI Domain

## Use This When

- the task is prompt design, agent behavior, retrieval, evaluation, or model safety

## Quick Judgement

- task framing
- structured outputs
- tool boundaries
- evaluation before intuition

## Read These References

- `references/prompt-design-and-evals.md`
  Read when the task is prompt shaping, output structure, benchmark design, or eval criteria.
- `references/agent-tooling-and-guardrails.md`
  Read when the issue is tool use, delegation, trust boundaries, or agent operating limits.
- `references/rag-and-context-engineering.md`
  Read when the task is retrieval, context packing, grounding, or document use strategy.
