# G2 Tooltip And Navigation Playbook

## Goal

Handle shared hover, chart navigation, and dashboard-style chart exploration without loading the whole G2 corpus.

## Use This For

- shared tooltip across multi-series charts
- chartIndex cursor line
- slider and scrollbar navigation
- slider wheel and scrollbar filter interactions
- tooltip render, css, and crosshair customization

## Common Tasks

### Shared tooltip

- start with `components/g2-comp-tooltip-config.md`
- for interaction semantics, add `g2-interaction-tooltip.md`
- for multi-series overlays, ensure `shared: true` is configured in the interaction layer

### ChartIndex and linked hover

- use `interactions/g2-interaction-chart-index.md`
- pair it with shared tooltip when the user wants same-x comparison

### Slider and scrollbar navigation

- slider component -> `components/g2-comp-slider.md`
- scrollbar component -> `components/g2-comp-scrollbar.md`
- wheel zoom -> `interactions/g2-interaction-slider-wheel.md`
- scrollbar-driven filtering -> `interactions/g2-interaction-scrollbar-filter.md`

## Constraint

- tooltip content belongs on the mark `tooltip` field
- tooltip behavior such as `shared`, `crosshairs`, or `css` belongs in the interaction layer
- slider and scrollbar options should stay axis-keyed under `x` or `y`

## Validation Rule

Run `../../../tools/verify-chart-spec/SKILL.md` when navigation or shared hover behavior has already been drafted in code.
