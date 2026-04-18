---
schema-version: 2
name: skill-evolution
title: Skill Evolution Workflow
description: Improve a personal skill system itself: skill architecture, router behavior, trigger surfaces, reference layering, registry quality, portability, pack strategy, and self-hosting governance. Use when refining or rebuilding a skill bundle rather than solving an ordinary product or code task.
kind: workflow
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [skill system, skill-evolution, skill architecture, route map, registry, portability, personal skill]
negative-keywords: [ordinary feature, single bug]
priority: 86
auto-chain: [verify-skill-system, verify-change, verify-quality]
runtime: knowledge
executor: none
permissions: [Read, Write, Grep, Bash]
risk-level: medium
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-18
review-cycle-days: 30
tags: [workflow, skills, system-design]
aliases: [skill-system]
---

# Skill Evolution Workflow

## Chain

1. audit the current bundle shape
2. identify structural bottlenecks
3. decide what belongs in router, domain, workflow, tool, guard, or reference
4. optimize for portable depth, not local convenience
5. validate registry, routes, and self-consistency with `verify-skill-system`

## Constraint

Do not bloat SKILL entry points when the same value belongs in references or generated registry files.

## Read These References

- `references/system-audit-lens.md`
  Read when reviewing a skill bundle as a whole and looking for structural weakness instead of isolated wording issues.
- `references/routing-and-depth-strategy.md`
  Read when deciding what should be routed directly, what should stay as depth references, and how escalation should work.
- `references/portability-and-governance.md`
  Read when the hard part is self-contained packaging, generated metadata, pack boundaries, or validation gates.
