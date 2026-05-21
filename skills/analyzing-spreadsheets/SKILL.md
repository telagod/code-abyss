---
name: analyzing-spreadsheets
description: Processes Excel spreadsheet files (.xlsx, .xlsm, .csv). Creates workbooks, builds formulas, preserves formatting, analyzes tabular data, and validates financial models with zero-formula-error delivery. Use when working with spreadsheet files or tabular data analysis. Do NOT use for Word documents, PDFs, presentations, or database pipelines.
user-invocable: false
allowed-tools: Bash, Read, Write, Edit, Glob
argument-hint: <file.xlsx | task>
---

# XLSX Processing

Create, edit, analyze `.xlsx` files. LibreOffice required for formula recalculation via `recalc.py`.

## Iron Rule

**Zero formula errors at delivery.** All formulas must compute — no `#REF!`, `#DIV/0!`, `#VALUE!`, `#N/A`, `#NAME?`. Always run `recalc.py` after writing formulas.

## Decision Matrix

| Task | Tool | Reference |
|------|------|-----------|
| Data analysis, bulk ops, simple export | pandas | [recipes.md](references/recipes.md) |
| Formulas, formatting, Excel features | openpyxl | [recipes.md](references/recipes.md) |
| Financial model standards | — | [financial-model.md](references/financial-model.md) |
| Recalculate formulas | `recalc.py` | [recipes.md](references/recipes.md) |

## Common Workflow

1. **Choose tool**: pandas for data, openpyxl for formulas/formatting
2. **Create/Load** workbook
3. **Modify** data, formulas, formatting
4. **Save**
5. **Recalculate** (MANDATORY if formulas): `python recalc.py output.xlsx`
6. **Verify & fix errors** — check JSON output, fix `#REF!` / `#DIV/0!` / `#VALUE!` / `#NAME?`

## Hard Constraints

- **Use formulas, not hardcoded values** — calculations stay dynamic. See [recipes.md](references/recipes.md#critical-use-formulas-not-hardcoded-values).
- **Preserve existing templates** — match existing format/style EXACTLY when updating; user template overrides defaults.
- **Financial models** — follow color/format conventions in [financial-model.md](references/financial-model.md).

## Code Style

- Concise Python, no unnecessary comments or print statements.
- Excel files: comment cells with complex formulas, document hardcode sources.
