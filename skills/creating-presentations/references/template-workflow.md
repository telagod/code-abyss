# Template-Based Workflow

When creating a presentation that follows an existing template's design — duplicate and rearrange template slides before replacing placeholder content.

## Workflow

### 1. Extract template text + create thumbnail grid

```bash
python -m markitdown template.pptx > template-content.md
python scripts/thumbnail.py template.pptx
```

Read entire `template-content.md`. **NEVER set range limits.**

### 2. Analyze template, save inventory

**Visual analysis**: Review thumbnail grid(s) for layouts, design patterns, visual structure.

Save `template-inventory.md`:

```markdown
# Template Inventory Analysis
**Total Slides: [count]**
**IMPORTANT: Slides are 0-indexed (first = 0, last = count-1)**

## [Category Name]
- Slide 0: [Layout code] - Description/purpose
- Slide 1: [Layout code] - Description/purpose
- Slide 2: [Layout code] - Description/purpose
```

Every slide must be listed individually with its index.

### 3. Create outline based on inventory

- Choose intro/title for first slide (usually among first templates)
- Choose safe, text-based layouts for the rest

**CRITICAL — match layout to actual content**:

| Layout | Use ONLY when |
|--------|---------------|
| Single-column | Unified narrative or single topic |
| Two-column | Exactly 2 distinct items |
| Three-column | Exactly 3 distinct items |
| Image + text | You have actual images |
| Quote | Actual quotes from people (with attribution) — never for emphasis |

- Never use layouts with more placeholders than you have content
- 2 items → don't force into 3-column
- 4+ items → break into multiple slides or use a list

Count content pieces BEFORE selecting layout. Verify each placeholder will be filled with meaningful content.

Save `outline.md` with content + template mapping:

```python
# Template slides to use (0-based)
# WARNING: Verify indices are within range! Template with 73 slides has indices 0–72
template_mapping = [
    0,   # Title/Cover
    34,  # B1: Title and body
    34,  # B1 again (duplicate)
    50,  # E1: Quote
    54,  # F2: Closing + Text
]
```

### 4. Duplicate / reorder / delete using `rearrange.py`

```bash
python scripts/rearrange.py template.pptx working.pptx 0,34,34,50,52
```

The script handles duplicating, deleting unused, reordering automatically. Indices 0-based. Same index = duplicate.

### 5. Extract ALL text using `inventory.py`

```bash
python scripts/inventory.py working.pptx text-inventory.json
```

Read entire `text-inventory.json`. **NEVER set range limits.**

**Inventory JSON structure**:

```json
{
  "slide-0": {
    "shape-0": {
      "placeholder_type": "TITLE",
      "left": 1.5,
      "top": 2.0,
      "width": 7.5,
      "height": 1.2,
      "paragraphs": [
        {
          "text": "Paragraph text",
          "bullet": true,
          "level": 0,
          "alignment": "CENTER",
          "space_before": 10.0,
          "space_after": 6.0,
          "line_spacing": 22.4,
          "font_name": "Arial",
          "font_size": 14.0,
          "bold": true,
          "italic": false,
          "underline": false,
          "color": "FF0000"
        }
      ]
    }
  }
}
```

**Key features**:
- **Slides**: `slide-0`, `slide-1`, etc.
- **Shapes**: Ordered top-to-bottom, left-to-right as `shape-0`, `shape-1`, etc.
- **Placeholder types**: TITLE, CENTER_TITLE, SUBTITLE, BODY, OBJECT, or null
- `default_font_size` from layout placeholders (when available)
- SLIDE_NUMBER placeholders automatically excluded
- When `bullet: true`, `level` always included
- `space_before`, `space_after`, `line_spacing` in points (only when set)
- `color` for RGB ("FF0000"), `theme_color` for theme colors ("DARK_1")
- Only non-default values included

### 6. Generate replacement text

Based on inventory:

- **CRITICAL — verify shapes exist** before referencing
- **VALIDATION** — `replace.py` validates all shape refs against inventory
- **AUTOMATIC CLEARING** — ALL text shapes will be cleared unless you provide `"paragraphs"`
- Add `"paragraphs"` field to shapes needing content (not `"replacement_paragraphs"`)
- Use shape size to determine appropriate content length
- Include paragraph properties from original inventory — don't just provide text

**Formatting rules**:

| Element | Properties |
|---------|------------|
| Headers/titles | `"bold": true` |
| List items | `"bullet": true, "level": 0` (level REQUIRED when bullet true) |
| Centered text | `"alignment": "CENTER"` |
| Font overrides | `"font_size": 14.0`, `"font_name": "Lora"` |
| Colors | `"color": "FF0000"` (RGB) or `"theme_color": "DARK_1"` |

- When `bullet: true`, do NOT include bullet symbols (•, -, *) in text — added automatically
- Don't set `alignment` when `bullet: true` (bullets are auto left-aligned)
- Overlapping shapes — prefer shapes with larger `default_font_size` or more appropriate `placeholder_type`

Save to `replacement-text.json`. Different layouts have different shape counts — always check actual inventory.

**Example**:

```json
{
  "slide-0": {
    "shape-0": {
      "paragraphs": [
        {"text": "Title", "alignment": "CENTER", "bold": true},
        {"text": "Bullet item", "bullet": true, "level": 0},
        {"text": "Theme colored", "theme_color": "DARK_1"}
      ]
    }
    // shape-1, shape-2 cleared automatically
  }
}
```

### 7. Apply replacements

```bash
python scripts/replace.py working.pptx replacement-text.json output.pptx
```

The script:
- Extracts inventory of ALL text shapes via inventory.py
- Validates all shape refs against inventory
- Clears text from ALL shapes
- Applies new text to shapes with `"paragraphs"` defined
- Preserves formatting from JSON
- Handles bullets, alignment, fonts, colors automatically

**Validation errors example**:
```
ERROR: Invalid shapes in replacement JSON:
  - Shape 'shape-99' not found on 'slide-0'. Available: shape-0, shape-1, shape-4
  - Slide 'slide-999' not found in inventory
```

```
ERROR: Replacement text made overflow worse:
  - slide-0/shape-2: overflow worsened by 1.25" (was 0.00", now 1.25")
```
