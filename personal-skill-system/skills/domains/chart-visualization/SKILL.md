---
schema-version: 2
name: chart-visualization
title: Chart Visualization Domain
description: Chart and table visualization knowledge for AntV G2/S2, infographic DSL, and T8 narrative text rendering. Use when the task asks for chart generation, pivot-table setup, infographic authoring, or narrative text visualization.
kind: domain
visibility: public
user-invocable: true
trigger-mode: [auto, manual]
trigger-keywords: [chart, chart visualization, data visualization, g2, antv g2, s2, pivot table, cross table, infographic, t8, narrative text visualization, 图表, 数据可视化, 图表生成, 透视表, 交叉表, 信息图, 叙事可视化]
negative-keywords: [ui layout, pure visual polish, ux copywriting, 纯视觉润色]
priority: 74
runtime: knowledge
executor: none
permissions: [Read]
risk-level: low
supported-hosts: [codex, claude, gemini]
status: beta
owner: self
last-reviewed: 2026-04-19
review-cycle-days: 30
tags: [domain, chart, visualization]
aliases: [data-visualization, 图表可视化]
---

# Chart Visualization Domain

## Use This When

- the task is chart generation or chart-type selection
- the task is S2 pivot or cross-table setup
- the task is infographic DSL authoring
- the task is T8 narrative text visualization

## Quick Judgement

- pick chart semantics first, styling second
- keep chart spec valid before adding interaction
- prefer runnable minimum spec over decorative noise
- route to tooling only when deterministic verification is required

## Read These References

- `references/chart-visualization-routing-and-scope.md`
  Read when deciding whether this task should stay in chart-visualization or route to frontend-design or development.
- `references/chart-visualization-task-index.md`
  Read first when you know the user outcome but need the smallest correct reference path.
- `references/chart-visualization-capability-map.md`
  Read when selecting G2 vs S2 vs infographic vs T8 and deciding import depth.
- `references/chart-validation-workflow.md`
  Read when a G2 chart draft exists and you need to decide whether to invoke deterministic spec validation.
- `references/g2/g2-task-playbook.md`
  Read when the task is G2 chart generation, debugging, or chart-type-specific code work.
- `references/g2/g2-annotation-playbook.md`
  Read when the task is threshold lines, range bands, text labels, image overlays, or guide migration.
- `references/g2/g2-tooltip-navigation-playbook.md`
  Read when the task is shared tooltip, chartIndex, slider, scrollbar, or hover navigation behavior.
- `references/g2/g2-reference-index-round2.md`
  Read when the G2 task needs deeper coverage across marks, components, scales, coordinates, or patterns.
- `references/s2/s2-task-playbook.md`
  Read when the task is S2 pivot-table setup, framework integration, or advanced table behavior.
- `references/s2/s2-validation-playbook.md`
  Read when an S2 config draft exists and you need to decide whether to invoke deterministic config validation.
- `references/s2/s2-reference-index-round2.md`
  Read when the S2 task needs broader knowledge, examples, or type surfaces.
- `references/story-visualization-task-playbook.md`
  Read when the task is infographic DSL, T8 narrative output, chart image API usage, or icon retrieval.
- `../../tools/verify-chart-spec/SKILL.md`
  Read when the task needs deterministic checking of G2 chart-spec anti-patterns.
- `references/provenance/antv-source-manifest-round2.md`
  Read when tracing upstream source, license, and the current import scope.

## Route onward

- deterministic G2 spec validation -> `verify-chart-spec`
- deterministic S2 config validation -> `verify-s2-config`
- UI layout and interaction polish heavy tasks -> `frontend-design`
- implementation-heavy chart embedding into app code -> `development`
- architecture and service boundary discussion -> `architecture`
