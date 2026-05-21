# XLSX Recipes — pandas / openpyxl

## CRITICAL: Use Formulas, Not Hardcoded Values

**Always use Excel formulas instead of calculating in Python and hardcoding results.** This keeps the spreadsheet dynamic and updateable.

### ❌ WRONG — Hardcoding calculated values

```python
total = df['Sales'].sum()
sheet['B10'] = total  # Hardcodes 5000

growth = (df.iloc[-1]['Revenue'] - df.iloc[0]['Revenue']) / df.iloc[0]['Revenue']
sheet['C5'] = growth  # Hardcodes 0.15

avg = sum(values) / len(values)
sheet['D20'] = avg  # Hardcodes 42.5
```

### ✅ CORRECT — Excel formulas

```python
sheet['B10'] = '=SUM(B2:B9)'
sheet['C5'] = '=(C4-C2)/C2'
sheet['D20'] = '=AVERAGE(D2:D19)'
```

Applies to all calculations — totals, percentages, ratios, differences.

## Read & Analyze (pandas)

```python
import pandas as pd

df = pd.read_excel('file.xlsx')                          # first sheet
all_sheets = pd.read_excel('file.xlsx', sheet_name=None)  # dict of all

df.head()      # preview
df.info()      # column info
df.describe()  # statistics

df.to_excel('output.xlsx', index=False)
```

## Create (openpyxl)

```python
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment

wb = Workbook()
sheet = wb.active

sheet['A1'] = 'Hello'
sheet['B1'] = 'World'
sheet.append(['Row', 'of', 'data'])
sheet['B2'] = '=SUM(A1:A10)'

sheet['A1'].font = Font(bold=True, color='FF0000')
sheet['A1'].fill = PatternFill('solid', start_color='FFFF00')
sheet['A1'].alignment = Alignment(horizontal='center')
sheet.column_dimensions['A'].width = 20

wb.save('output.xlsx')
```

## Edit (openpyxl, preserves formulas/formatting)

```python
from openpyxl import load_workbook

wb = load_workbook('existing.xlsx')
sheet = wb.active  # or wb['SheetName']

for sheet_name in wb.sheetnames:
    sheet = wb[sheet_name]
    print(f"Sheet: {sheet_name}")

sheet['A1'] = 'New Value'
sheet.insert_rows(2)
sheet.delete_cols(3)

new_sheet = wb.create_sheet('NewSheet')
new_sheet['A1'] = 'Data'

wb.save('modified.xlsx')
```

## Recalculate Formulas (MANDATORY if using formulas)

openpyxl writes formulas as strings without calculating values. Use `recalc.py`:

```bash
python recalc.py output.xlsx [timeout_seconds]
python recalc.py output.xlsx 30  # 30s timeout
```

The script:
- Auto-sets up LibreOffice macro on first run
- Recalculates all formulas in all sheets
- Scans for `#REF!`, `#DIV/0!`, etc.
- Returns JSON with error locations

### Interpreting output

```json
{
  "status": "success",       // or "errors_found"
  "total_errors": 0,
  "total_formulas": 42,
  "error_summary": {          // only if errors
    "#REF!": {
      "count": 2,
      "locations": ["Sheet1!B5", "Sheet1!C10"]
    }
  }
}
```

## Formula Verification Checklist

### Essential

- [ ] Test 2–3 sample references before full model
- [ ] Column mapping: Excel column 64 = `BL` (not `BK`)
- [ ] Row offset: Excel rows are 1-indexed (DataFrame row 5 = Excel row 6)

### Common Pitfalls

- [ ] NaN handling: use `pd.notna()`
- [ ] Far-right columns: FY data often in columns 50+
- [ ] Multiple matches: search all, not just first
- [ ] Division by zero: check denominators (#DIV/0!)
- [ ] Wrong refs: verify cells exist (#REF!)
- [ ] Cross-sheet refs: `Sheet1!A1` format

### Testing Strategy

- [ ] Test on 2–3 cells before applying broadly
- [ ] Verify all referenced cells exist
- [ ] Test edge cases: zero, negative, very large values

## Library Selection

| Library | Use for |
|---------|---------|
| **pandas** | Data analysis, bulk operations, simple data export |
| **openpyxl** | Complex formatting, formulas, Excel-specific features |

### openpyxl tips

- Cell indices 1-based (`row=1, column=1` = A1)
- Read calculated values: `load_workbook('file.xlsx', data_only=True)`
- **Warning**: `data_only=True` + save → formulas permanently replaced by values
- Large files: `read_only=True` or `write_only=True`

### pandas tips

- Specify dtypes: `pd.read_excel('file.xlsx', dtype={'id': str})`
- Read specific columns: `pd.read_excel('file.xlsx', usecols=['A', 'C', 'E'])`
- Parse dates: `pd.read_excel('file.xlsx', parse_dates=['date_column'])`
