---
schema-version: 2
name: ai
title: AI Domain
description: AI and agent systems knowledge: prompt design, evaluation, tool use, RAG, context engineering, and guardrails. Use when the task is about LLMs, prompts, agents, retrieval, or model behavior.
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [ai, llm, prompt, rag, agent, eval]
negative-keywords: [cluster sizing]
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
- `references/expert-task-framing-and-evals.md`
  Read when the real problem is defining the AI task and its benchmark surface correctly.
- `references/expert-task-definition.md`
  Read when the first risk is solving the wrong AI task.
- `references/expert-eval-design-and-acceptance.md`
  Read when acceptance criteria, benchmark design, or failure-class evals are the real bottleneck.
- `references/expert-context-and-retrieval.md`
  Read when retrieval quality, context selection, or grounding are the limiting factors.
- `references/expert-retrieval-objective-and-corpus-shaping.md`
  Read when corpus design and evidence intent must be defined before ranking.
- `references/expert-chunking-ranking-and-grounding.md`
  Read when chunking, ranking, and grounding strategy are the limiting factors.
- `references/expert-tool-using-agents.md`
  Read when the system needs acting agents, tool boundaries, or explicit step verification.
- `references/expert-tool-authority-and-boundaries.md`
  Read when tool-granted authority and mutation boundaries are the core design risk.
- `references/expert-agent-loop-and-state-control.md`
  Read when planner loops, state, retries, or stop conditions are the hard problem.
- `references/expert-guardrails-and-failure-economics.md`
  Read when the issue is safety, failure handling, latency budget, or cost posture.
- `references/expert-guardrail-policy-and-fallbacks.md`
  Read when guardrail behavior, fallback policy, or abstention logic need to be explicit.
- `references/expert-latency-cost-and-reliability.md`
  Read when the AI system must be justified economically and operationally, not only functionally.
- `references/expert-operating-principles.md`
  Read when you want the compact expert index that routes into the split AI modules.
