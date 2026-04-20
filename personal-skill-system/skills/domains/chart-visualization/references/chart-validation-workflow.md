# Chart Validation Workflow

## Use This Workflow

Use `verify-chart-spec` after a first-pass G2 chart draft exists and before you treat that draft as reusable or production-ready.

## Recommended Sequence

1. choose the chart shape through `chart-visualization-task-index.md`
2. draft the G2 chart using `g2-task-playbook.md`
3. run `verify-chart-spec`
4. fix error-level findings
5. manually render or execute the chart for runtime and visual confirmation

## When To Call The Tool

- generated code came from an LLM and may contain v4 syntax drift
- the chart mixes transforms, coordinates, labels, and composition
- the chart draft uses advanced types such as heatmap, treemap, sankey, or layered view composition
- the chart will be reused as a template or shared example

## What It Catches Well

- v4 API drift such as `source()` or `createView()`
- invalid `palette`, `transform`, `label`, and range-encoding shapes
- suspicious composition patterns around `view` and `children[]`
- coordinate and component config drift such as `coordinate.transform` object form or top-level `axis/legend` position misuse
- render API payload omissions such as missing `type` or `source`
- component and interaction dependency mistakes such as hidden legends with `legendFilter`, or `sliderWheel` without `slider`
- legacy and placement mistakes such as `guide()` usage, tooltip-in-style, or `labels[].transform` object form
- content-shape mistakes such as tooltip field drift, old image annotation config, or mark encode fields that do not match nearby inline data
- tooltip behavior placement mistakes such as crosshairs or css written outside interaction tooltip config
- text annotation mistakes such as missing data source or missing text source
- visibility and maintainability risks such as white fill or unnecessary default scale type declarations

## When Not To Call It

- the task is pure S2 table guidance
- the task is infographic DSL or T8 narrative authoring
- no G2 chart spec exists yet
