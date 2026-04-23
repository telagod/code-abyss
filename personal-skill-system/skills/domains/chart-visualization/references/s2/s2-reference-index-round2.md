# S2 Reference Index (Round 2)

## Scope

Round 2 expands the `s2` surface from baseline onboarding material into a broader table-analysis corpus.

Current structure:

- root `s2/`: curated entry docs and baseline examples
- `knowledge/`: overview, sheet types, framework bindings, theme, custom cell, events, data config, sort, totals, export, pagination, tooltip, frozen, icon, SSR, react components
- `examples/`: custom-cell, theme, layout, interaction, pivot-sheet and table-sheet examples
- `type/`: `S2DataConfig`, `S2Event`, `S2Theme`, `SheetComponent` props

## Reading Order

Use this sequence for most S2 tasks:

1. `s2-routing-and-cookbook.md`
2. `00-overview.md`
3. `01-sheet-types.md`
4. one focused `knowledge/` or `type/` file matching the problem
5. one example file when runnable shape matters

## Good Entry Points

- choose sheet kind: `01-sheet-types.md`
- React/Vue integration: `02-framework-bindings.md`, `react-component-usage.md`
- data layout issues: `06-data-config.md`, `type/s2-data-config.md`
- option surface: `s2-options.md`, `knowledge/03-theme-style.md`
- advanced interactions: `05-events-interaction.md`, `knowledge/12-tooltip.md`, `knowledge/13-frozen.md`
- custom rendering: `examples/custom-cell-render.md`

## Constraint

Prefer the smallest S2 surface that solves the issue. Most problems only need sheet type, data config, one options file, and one example.
