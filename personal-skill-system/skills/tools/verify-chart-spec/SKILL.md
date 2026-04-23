---
schema-version: 2
name: verify-chart-spec
title: Verify Chart Spec Tool
description: Heuristic validation for G2 chart code and chart spec misuse patterns such as v4 chained API, invalid transform shape, missing container, and hallucinated mark types. Use when the task is explicit chart-spec validation.
kind: tool
visibility: public
user-invocable: true
trigger-mode: [manual]
trigger-keywords: [verify-chart-spec, chart spec check, g2 spec validation, chart validation, 图表规范校验, 图表校验, g2 校验, G2规范检查]
negative-keywords: []
priority: 89
runtime: scripted
executor: node
permissions: [Read, Grep, Bash]
risk-level: low
supported-hosts: [codex, claude, gemini]
status: beta
owner: self
last-reviewed: 2026-04-19
review-cycle-days: 30
tags: [tool, chart, visualization]
aliases: [chart-spec-audit, g2-spec-check, 图表规范审计]
---

# Verify Chart Spec Tool

## Read These References

- `references/heuristic-chart-scan-boundaries.md`
  Read when deciding what this lightweight validator can prove and what still needs human review.
- `references/triaging-chart-findings.md`
  Read when a finding appears and you need to decide whether it is a real G2 misuse, a benign helper pattern, or a false positive.

## Checks

- missing `container` in `new Chart(...)`
- V4 chained API or deprecated `source()` / `position()` / `createView()` usage
- multiple `chart.options(...)` calls in the same chart variable
- `transform` configured as object instead of array
- data transforms such as `fold` or `fetch` misplaced under top-level `transform`
- invalid `coordinate: { type: 'transpose' }`
- range encoding written as `y: ['start', 'end']`
- singular `label: {}` usage instead of `labels: []`
- invalid palette names such as `coolwarm` or `jet`
- white or near-white `style.fill` values that may disappear on light backgrounds
- explicit `animate` config that should be checked against actual task requirements
- overspecified default scale types such as `linear`, `band`, or `point`
- `coordinate.transform` configured as object instead of array
- top-level `legend.position` or `axis.position` style misuse
- `labelTransform`-style keys that may not match G2 label transform placement
- AntV render API payload missing required `type` or `source`
- `legendFilter` enabled while legend is hidden
- `scrollbarFilter` or `sliderWheel` enabled without matching scrollbar or slider components
- `slider` / `scrollbar` configured with wrong top-level shape instead of axis-keyed config
- `interaction.tooltip.items` content configured in the wrong layer
- deprecated `guide()` API instead of annotation marks
- deprecated `chart.data()` API instead of `chart.options({ data })`
- tooltip config misplaced under `style`
- `labels[].transform` configured as object instead of array
- slider property misuse such as `handleFill` instead of `handleIconFill`
- scrollbar property misuse such as raw `fill` or style wrapper objects
- tooltip fields that do not match nearby inline data keys
- image mark old-style config such as `style.img` or function-based fixed `encode.x/y`
- image mark using `url` data without nearby `encode.src`
- `range` mark using `x1/y1` instead of array-valued `x/y`
- `rangeX` / `rangeY` missing explicit encode mapping
- `lineX` / `lineY` / `rangeX` / `rangeY` encode fields not matching nearby inline data
- `lineX` / `lineY` missing required encode channels
- `labels[].text` configured as numeric constant
- `text` mark missing text source or referencing a missing text field
- `text` mark missing its own data or parent view data
- `chartIndex` enabled without nearby `tooltip.shared = true`
- tooltip `crosshairs` or `css` configured outside interaction tooltip config
- `image` mark using `btoa(...)` as src payload
- `image` mark omitting size or width/height control
- `image` mark missing `encode.src`
- composition containers such as `view` or `spaceLayer` missing `children[]`
- nested `view` containers or nested `children[]` composition in unsupported positions
- hallucinated mark types such as `ruleX`, `ruleY`, `regionX`, `regionY`, `venn`
- `d3.*` usage inside user chart code
- missing `render()` after chart construction

## Run

```bash
node scripts/run.js --target ./src
node scripts/run.js --target ./src --json
node scripts/run.js --target ./charts/example.ts --json
```
