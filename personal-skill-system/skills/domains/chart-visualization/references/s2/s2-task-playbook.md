# S2 Task Playbook

## Goal

Route the user into the smallest S2 surface that answers the actual table problem.

## Common Tasks

### Pick the right sheet model

- start with `01-sheet-types.md`
- if the user is still unsure about S2 terminology or internals -> `00-overview.md`

### Build the table structure

- data shape, `rows`, `columns`, `values` -> `06-data-config.md`
- exact type contract -> `type/s2-data-config.md`
- baseline runnable setup -> `pivot-sheet-basic.md` or `table-sheet-basic.md`

### Framework integration

- React or Vue bindings -> `02-framework-bindings.md`
- React component props and usage -> `react-component-usage.md`, `type/sheet-component.md`

### Table behavior

- events and interaction -> `05-events-interaction.md`
- pagination -> `knowledge/10-pagination.md`
- tooltip -> `knowledge/12-tooltip.md`
- totals, copy/export, frozen headers -> `knowledge/08-totals.md`, `knowledge/09-copy-export.md`, `knowledge/13-frozen.md`

### Customization

- custom cell rendering -> `examples/custom-cell-render.md`
- theme and style -> `knowledge/03-theme-style.md`, `examples/custom-theme.md`, `type/s2-theme.md`
- icons and richer visuals -> `knowledge/14-icon.md`, `examples/custom-cell-render.md`

## Reading Rule

For most S2 tasks, one baseline doc plus one focused behavior doc is enough.
Do not load the full knowledge tree unless the problem spans model, rendering, and framework integration at the same time.
