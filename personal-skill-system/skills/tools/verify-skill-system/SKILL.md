---
schema-version: 2
name: verify-skill-system
title: Verify Skill System Tool
description: Validate a portable skill bundle itself: frontmatter integrity, registry coverage, route-map coverage, reference links, runtime contracts, and structural portability assumptions. Use when auditing the health of a personal skill system rather than application code.
kind: tool
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [verify-skill-system, skill system audit, registry audit, route map audit]
negative-keywords: []
priority: 90
runtime: scripted
executor: node
permissions: [Read, Glob, Bash]
risk-level: low
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-18
review-cycle-days: 30
tags: [tool, skills, governance]
aliases: [skill-system-audit]
---

# Verify Skill System Tool

## Read These References

- `references/check-surface.md`
  Read when deciding what a healthy portable skill bundle should validate.
- `references/interpreting-findings.md`
  Read when the checker reports drift, missing coverage, or runtime-contract problems and you need to prioritize the damage.

## Checks

- top-level bundle structure
- `SKILL.md` frontmatter integrity
- registry completeness
- route-map completeness for user-invocable skills
- reference link existence
- runtime and script contract alignment
- route-map linkage to known skills

## Run

```bash
node scripts/run.js --target ./personal-skill-system --json
```
