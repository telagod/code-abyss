# Chart Visualization Capability Map

## Capability Surface

- `g2`: statistical charts, chart grammar, transforms, interactions, mark-level specs
- `s2`: pivot table and cross-analysis table development
- `render-api`: remote chart image rendering contract
- `icon`: icon search and SVG retrieval contract
- `infographic`: AntV infographic DSL authoring
- `narrative-t8`: T8 narrative text visualization authoring

## Selection Rules

- if the target is chart image or chart code -> start with `g2`
- if the target is multidimensional tabular analysis -> start with `s2`
- if the target is communication-oriented poster-like output -> use `infographic`
- if the target is prose-first insight report with semantic annotations -> use `narrative-t8`
- if the task needs symbol assets -> use `icon`

## Entry Strategy

- start from `chart-visualization-task-index.md` when the user goal is known but the exact library path is not
- move into `g2-task-playbook.md` or `s2-task-playbook.md` for implementation tasks
- move into `story-visualization-task-playbook.md` for communication-first outputs
- move into `chart-validation-workflow.md` when a G2 draft exists and validation timing matters

## Expert Modules

- `chart-visualization-g2-spec-guardrails`
- `chart-visualization-g2-chart-selection`
- `chart-visualization-g2-mark-and-transform-basics`
- `chart-visualization-g2-interaction-and-tooltips`
- `chart-visualization-s2-sheet-model-and-config`
- `chart-visualization-s2-framework-bindings`
- `chart-visualization-chart-image-api`
- `chart-visualization-icon-retrieval-api`
- `chart-visualization-infographic-dsl`
- `chart-visualization-narrative-t8`
- `chart-visualization-g2-components-and-layout`
- `chart-visualization-g2-data-scales-and-coordinates`
- `chart-visualization-g2-annotations-and-reference-marks`
- `chart-visualization-g2-shared-tooltip-and-navigation`
- `chart-visualization-s2-advanced-table-features`
- `chart-visualization-s2-customization-and-extensions`

## Import Depth Notes

Round 1 intentionally imports:

- high-signal guide docs for route and generation quality
- runnable baseline examples for S2
- API playbooks for chart/icon generation

Round 2 now adds:

- broad G2 category mirrors under `references/g2/*`
- broad S2 knowledge, example, and type mirrors under `references/s2/*`
- dedicated round-2 index docs for G2 and S2

Next expansion should focus on deterministic validation tools, not more uncontrolled surface growth.
