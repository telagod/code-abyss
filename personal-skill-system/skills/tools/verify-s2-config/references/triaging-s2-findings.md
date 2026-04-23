# Triaging S2 Findings

## High-Confidence Findings

- `<SheetComponent />` without `dataCfg`
- `<SheetComponent />` without `options`
- `fields.rows` / `fields.columns` / `fields.values` configured as scalar instead of array
- `sheetType="table"` with inline `dataCfg.fields` missing `columns`
- imperative sheet creation without visible `render()` or `destroy()`

## Medium-Confidence Findings

- `showPagination` without nearby `pagination`
- pivot-like field mapping missing `values`

## Review Rule

If the project uses wrappers that inject `dataCfg`, `options`, or lifecycle cleanup elsewhere, validate the finding against the wrapper before changing code.
