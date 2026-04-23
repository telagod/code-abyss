# S2 Validation Playbook

## Goal

Decide when an S2 task should move from knowledge guidance into deterministic config validation.

## Use This For

- `SheetComponent` prop validation
- `dataCfg.fields` shape checks
- pagination wiring
- imperative `PivotSheet` or `TableSheet` lifecycle cleanup

## When To Call The Tool

- a first-pass S2 component or config object already exists
- the task is about props, `dataCfg`, `options`, or React/Vue wrapper shape
- the table code will be reused as template or component example

## Tool

- deterministic S2 config validation -> `../../../tools/verify-s2-config/SKILL.md`

## Reading Order

1. `s2-task-playbook.md`
2. `06-data-config.md` or `02-framework-bindings.md`
3. `s2-reference-index-round2.md`
4. `verify-s2-config`
