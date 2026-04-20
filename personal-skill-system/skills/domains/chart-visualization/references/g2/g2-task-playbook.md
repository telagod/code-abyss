# G2 Task Playbook

## Goal

Map common chart requests to the minimum G2 references needed to produce valid code quickly.

## Common Tasks

### Time-series and trend

- start with `g2-mark-line-basic.md`
- add `g2-mark-area-basic.md` for cumulative or filled trend
- add `scales/g2-scale-time.md` when date parsing or temporal scale behavior matters

### Comparison charts

- start with `g2-mark-interval-basic.md`
- add `g2-transform-dodgex.md` for grouped comparison
- add `g2-transform-stacky.md` for stacked comparison

### Correlation and distribution

- scatter or bubble -> `g2-mark-point-scatter.md`, `marks/g2-mark-point-bubble.md`
- histogram -> `marks/g2-mark-histogram.md`
- boxplot or violin -> `marks/g2-mark-boxplot.md`, `marks/g2-mark-violin.md`

### Hierarchy, flow, and dense matrix

- treemap -> `marks/g2-mark-treemap.md`
- sankey -> `marks/g2-mark-sankey.md`
- chord -> `marks/g2-mark-chord.md`
- tree -> `marks/g2-mark-tree.md`
- heatmap -> `marks/g2-mark-heatmap.md`

### Composition and layout

- multi-mark overlay -> `g2-core-view-composition.md`
- advanced composition -> `g2-reference-index-round2.md`, then `compositions/*`
- annotation or guides -> `components/g2-comp-annotation.md`

### Data and remote source shape

- if data is inline and simple, stay in mark docs
- if data fetch, transform, or remote source is involved -> `data/g2-data-fetch.md`, `data/*`

## Debugging Rule

If generated code smells wrong before the chart type is even settled, go back to `g2-chart-system-guide.md`.
If the code already looks close but edge behavior is wrong, use `g2-reference-index-round2.md` to pick one deeper surface only.
If a first-pass G2 draft exists, run `../../../tools/verify-chart-spec/SKILL.md` before treating that draft as reusable.
