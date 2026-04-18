---
schema-version: 2
name: gen-docs
title: Generate Docs Tool
description: Generate module documentation scaffolds such as README and DESIGN seeds. Use when creating a new module or when a project needs a documentation skeleton.

kind: tool
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [gen-docs, generate docs, doc scaffold, readme scaffold, design scaffold]
negative-keywords: [review-only]
priority: 90
runtime: scripted
executor: node
permissions: [Read, Write, Bash]
risk-level: low
supported-hosts: [codex, claude, gemini]
status: stable
owner: self
last-reviewed: 2026-04-17
review-cycle-days: 45
tags: [tool, docs]
aliases: []
---

# Gen Docs Tool

## Read These References

- `references/scaffold-scope-and-boundaries.md`
  Read when deciding what the generated docs should cover and what they should deliberately omit.
- `references/manual-fill-and-review.md`
  Read after generation to turn the scaffold into a real module document instead of leaving template sludge.
- `references/expert-operating-principles.md`
  Read when the generated scaffold needs to preserve boundary, dependency, failure-mode, and verification thinking.

## Input

- `--target <path>`
- `--write` to write `README.md` and `DESIGN.md`
- `--force` to overwrite existing targets
- `--json` for machine-readable output

## Output

- preview of README and DESIGN skeletons
- written files when `--write` is supplied

## Run

```bash
node scripts/run.js --target ./path/to/module --json
node scripts/run.js --target ./path/to/module --write
```
