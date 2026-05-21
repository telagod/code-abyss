# Thumbnail & Image Conversion

## Thumbnail Grids

```bash
python scripts/thumbnail.py template.pptx [output_prefix]
```

**Features**:
- Creates `thumbnails.jpg` (or `thumbnails-1.jpg`, etc. for large decks)
- Default: 5 columns, max 30 slides per grid (5×6)
- Custom prefix: `python scripts/thumbnail.py template.pptx my-grid`
  - Prefix can include path: `workspace/my-grid`
- `--cols 4` to adjust columns (range 3–6)
- Grid limits: 3 cols = 12 slides/grid, 4 = 20, 5 = 30, 6 = 42
- Slides are zero-indexed

**Use cases**:
- Template analysis (understand layouts/patterns)
- Content review (visual overview)
- Navigation reference
- Quality check

**Examples**:
```bash
python scripts/thumbnail.py presentation.pptx
python scripts/thumbnail.py template.pptx analysis --cols 4
```

## Convert Slides to Images

Two-step for visual analysis:

### 1. PPTX → PDF

```bash
soffice --headless --convert-to pdf template.pptx
```

### 2. PDF → JPEG

```bash
pdftoppm -jpeg -r 150 template.pdf slide
# → slide-1.jpg, slide-2.jpg, ...
```

**Options**:
- `-r 150` — DPI
- `-jpeg` — output JPEG (or `-png`)
- `-f N` — first page (`-f 2`)
- `-l N` — last page (`-l 5`)
- `slide` — output prefix

### Example: range

```bash
pdftoppm -jpeg -r 150 -f 2 -l 5 template.pdf slide  # Pages 2–5
```

## Raw XML Access

For comments, speaker notes, animations, design elements:

```bash
python ooxml/scripts/unpack.py <office_file> <output_dir>
```

**Key file structures**:

| Path | Contents |
|------|----------|
| `ppt/presentation.xml` | Main metadata, slide refs |
| `ppt/slides/slide{N}.xml` | Individual slide contents |
| `ppt/notesSlides/notesSlide{N}.xml` | Speaker notes |
| `ppt/comments/modernComment_*.xml` | Comments |
| `ppt/slideLayouts/` | Layout templates |
| `ppt/slideMasters/` | Master templates |
| `ppt/theme/` | Theme and styling |
| `ppt/media/` | Images and media |

### Typography & Color Extraction (for emulating designs)

1. **Read theme**: `ppt/theme/theme1.xml` — colors `<a:clrScheme>`, fonts `<a:fontScheme>`
2. **Sample slide**: `ppt/slides/slide1.xml` — actual font usage `<a:rPr>`, colors
3. **Search patterns**: grep for `<a:solidFill>`, `<a:srgbClr>`, font refs across all XML
