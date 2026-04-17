---
schema-version: 2
name: gen-docs
title: 文档生成工具
description: 为新模块或新能力生成基础说明文档骨架，产出 README、DESIGN 或 usage outline。
kind: tool
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [gen-docs, 文档生成, create docs]
negative-keywords: []
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
