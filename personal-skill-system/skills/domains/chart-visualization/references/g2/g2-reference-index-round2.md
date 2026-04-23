# G2 Reference Index (Round 2)

## Scope

Round 2 expands the `g2` surface from a curated starter set into a broad reference corpus.

Current structure:

- root `g2/`: curated entry docs already referenced by `SKILL.md`
- `animations/`: animate basics and keyframe usage
- `components/`: axis, legend, title, annotation, slider, scrollbar, tooltip
- `compositions/`: view, facet, space-layer, space-flex, geo and timing compositions
- `coordinates/`: cartesian, polar, theta, radial, transpose, parallel, helix, fisheye
- `data/`: fetch, fold, filter, log, slice, sort, sortBy, ema, kde, data format patterns
- `interactions/`: tooltip, legend filter, highlight, brush, slider, drilldown, fisheye
- `label-transform/`: overlap and overflow handling
- `marks/`: interval, line, area, pie, scatter, boxplot, sankey, treemap, radar, heatmap, wordcloud, and more
- `palette/`: category palettes
- `patterns/`: migration, performance, responsive behavior
- `scales/`: linear, band, time, log, ordinal, sequential, threshold, quantize
- `themes/`: builtin and custom theme references
- `transforms/`: stack, dodge, normalize, group, bin, sort, select, jitter, pack

## Reading Order

Use this sequence for most chart-code tasks:

1. `g2-chart-system-guide.md`
2. `g2-concept-chart-selection.md`
3. one mark file under `marks/` or root `g2-mark-*.md`
4. one transform, scale, or interaction file only if needed

## Good Entry Points

- time-series or comparison chart: `g2-mark-line-basic.md`, `g2-mark-interval-basic.md`
- stacked or grouped chart: `g2-transform-stacky.md`, `g2-transform-dodgex.md`
- chart composition: `g2-core-view-composition.md`, `compositions/g2-comp-space-layer.md`
- distribution chart: `marks/g2-mark-boxplot.md`, `marks/g2-mark-histogram.md`, `marks/g2-mark-violin.md`
- relation or flow chart: `marks/g2-mark-sankey.md`, `marks/g2-mark-chord.md`, `marks/g2-mark-tree.md`, `marks/g2-mark-treemap.md`
- interactivity: `g2-interaction-tooltip.md`, `g2-interaction-legend-filter.md`, `interactions/g2-interaction-brush.md`

## Constraint

Do not load the full G2 corpus by default. Pick the minimum mark and auxiliary surfaces that match the judgement problem.
