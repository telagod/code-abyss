# Financial Model Standards

When building financial models, follow these conventions unless the user or existing template specifies otherwise.

## Color Coding (Industry Standard)

| Text Color | RGB | Purpose |
|------------|-----|---------|
| **Blue** | 0,0,255 | Hardcoded inputs, scenario numbers users will change |
| **Black** | 0,0,0 | ALL formulas and calculations |
| **Green** | 0,128,0 | Links pulling from other worksheets within same workbook |
| **Red** | 255,0,0 | External links to other files |

| Background | RGB | Purpose |
|------------|-----|---------|
| **Yellow** | 255,255,0 | Key assumptions needing attention, cells that need to be updated |

## Number Formatting Rules

| Type | Format | Example |
|------|--------|---------|
| **Years** | Text string | `"2024"` (not `2,024`) |
| **Currency** | `$#,##0` | Always specify units in headers: `Revenue ($mm)` |
| **Zeros** | Display as `-` | `$#,##0;($#,##0);-` (positive;negative;zero) |
| **Percentages** | `0.0%` | One decimal default |
| **Multiples** | `0.0x` | For EV/EBITDA, P/E valuation multiples |
| **Negatives** | Parentheses | `(123)` not `-123` |

## Formula Construction

### Assumptions Placement

- Place ALL assumptions (growth rates, margins, multiples) in separate assumption cells
- Use cell references, not hardcoded values
- Example: `=B5*(1+$B$6)` not `=B5*1.05`

### Error Prevention

- Verify all cell references are correct
- Check off-by-one errors in ranges
- Ensure consistent formulas across all projection periods
- Test edge cases (zero, negative, large values)
- No unintended circular references

### Hardcode Documentation

Add cell comments or notes beside (if end of table). Format:
```
Source: [System/Document], [Date], [Specific Reference], [URL if applicable]
```

**Examples**:
- `Source: Company 10-K, FY2024, Page 45, Revenue Note, [SEC EDGAR URL]`
- `Source: Company 10-Q, Q2 2025, Exhibit 99.1, [SEC EDGAR URL]`
- `Source: Bloomberg Terminal, 8/15/2025, AAPL US Equity`
- `Source: FactSet, 8/20/2025, Consensus Estimates Screen`

## Universal Rules (All Excel Files)

### Zero Formula Errors

Every model MUST be delivered with ZERO formula errors: `#REF!`, `#DIV/0!`, `#VALUE!`, `#N/A`, `#NAME?`.

### Preserve Existing Templates

When updating templates:
- Study and EXACTLY match existing format, style, conventions
- Never impose standardized formatting on files with established patterns
- Existing template conventions ALWAYS override these guidelines
