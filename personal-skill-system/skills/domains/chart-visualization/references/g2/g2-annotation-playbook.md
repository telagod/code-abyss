# G2 Annotation Playbook

## Goal

Route chart annotation work to the smallest correct G2 reference set.

## Use This For

- target lines and threshold lines
- highlighted value bands or time ranges
- image or text annotations layered on top of charts
- guide migration from older G2 patterns

## Common Tasks

### Target and threshold lines

- start with `marks/g2-mark-linex-liney.md`
- use `components/g2-comp-annotation.md` when the chart already needs a `view + children` composition

### Highlighted intervals and bands

- use `marks/g2-mark-range-rangey.md`
- prefer `rangeX` for time windows and `rangeY` for value bands
- use plain `range` only when both x and y bounds are truly rectangular and array-valued

### Text annotations

- use `marks/g2-mark-text.md`
- if the text should ride on chart data, prefer `encode.text`
- if the text is fixed copy, prefer `style.text` with explicit coordinates or a single inline data row

### Image annotations and icon marks

- use `marks/g2-mark-image.md`
- bind URLs through `encode.src`
- keep image size explicit through `size` or width and height

### Migration from old guide API

- if you see `chart.guide()` or separate overlay charts, replace that with `view + children`
- use `components/g2-comp-annotation.md` and `g2-chart-system-guide.md`

## Validation Rule

When a first-pass annotation spec exists, run `../../../tools/verify-chart-spec/SKILL.md` before reuse.
