---
name: creating-presentations
description: Processes PowerPoint presentation files (.pptx). Creates slides, rewrites templates, converts HTML to presentations, validates thumbnails, swaps layouts, and performs deep OOXML editing. Use when working with presentation files or slide decks. Do NOT use for Word documents, spreadsheets, or PDF files.
user-invocable: false
allowed-tools: Bash, Read, Write, Edit, Glob
argument-hint: <file.pptx | task>
---

# PPTX Processing

`.pptx` is a ZIP archive of XML and resources. Choose workflow by intent.

## Workflow Decision

| Intent | Workflow | Reference |
|--------|----------|-----------|
| **Read text** | markitdown → markdown | [thumbnails-and-conversion.md](references/thumbnails-and-conversion.md) |
| **Analyze layout / comments / theme** | unpack → raw XML | [thumbnails-and-conversion.md](references/thumbnails-and-conversion.md) |
| **Create new from scratch** | html2pptx | [html2pptx.md](html2pptx.md) + [design-patterns.md](references/design-patterns.md) |
| **Create using template** | rearrange + inventory + replace | [template-workflow.md](references/template-workflow.md) |
| **Edit existing slides** | unpack → OOXML → pack | [ooxml.md](ooxml.md) |
| **Visual review** | thumbnail grids | [thumbnails-and-conversion.md](references/thumbnails-and-conversion.md) |

## Iron Rules

- **Color choice is design** — see [palettes.md](references/palettes.md), state your approach BEFORE code.
- **Web-safe fonts only** — Arial, Helvetica, Times New Roman, Georgia, Courier New, Verdana, Tahoma, Trebuchet MS, Impact.
- **Layout matches content count** — 2 items → 2 columns; 3 → 3; never force.
- **Validate visually** — always generate thumbnails after creation, inspect for cutoff/overlap/contrast.

## Create New (without template) — html2pptx

1. **MANDATORY — READ ENTIRE FILE**: `html2pptx.md`. NEVER set range limits.
2. Create HTML per slide (e.g., 720pt × 405pt for 16:9)
   - Use `<p>`, `<h1>`–`<h6>`, `<ul>`, `<ol>`
   - `class="placeholder"` for chart/table areas (gray bg for visibility)
   - **CRITICAL**: Rasterize gradients & icons as PNG via Sharp first, then reference in HTML
   - Use full-slide or two-column layout for charts/tables — never vertical stack
3. Run `scripts/html2pptx.js` to convert
   - `html2pptx()` per HTML file
   - Charts/tables via PptxGenJS API on placeholders
   - `pptx.writeFile()` to save
4. **Visual validation** — `python scripts/thumbnail.py output.pptx workspace/thumbnails --cols 4`
   - Inspect for: text cutoff, overlap, positioning, contrast
   - Adjust HTML margins/spacing/colors, regenerate, repeat

## Create with Template

See [template-workflow.md](references/template-workflow.md) for full 7-step workflow (extract → inventory → outline → rearrange → inventory text → generate replacements → apply).

## Edit Existing Presentation

1. **MANDATORY — READ ENTIRE FILE**: `ooxml.md` (~500 lines). NEVER set range limits.
2. `python ooxml/scripts/unpack.py <file> <dir>`
3. Edit XML (primarily `ppt/slides/slide{N}.xml`)
4. **CRITICAL** — validate after each edit: `python ooxml/scripts/validate.py <dir> --original <file>`
5. `python ooxml/scripts/pack.py <dir> <file>`

## Code Style

Concise code, no verbose names, no unnecessary print statements.

## Dependencies

| Package | Install | Purpose |
|---------|---------|---------|
| markitdown | `pip install "markitdown[pptx]"` | Text extraction |
| pptxgenjs | `npm i -g pptxgenjs` | Create via html2pptx |
| playwright | `npm i -g playwright` | HTML rendering |
| react-icons | `npm i -g react-icons react react-dom` | Icons |
| sharp | `npm i -g sharp` | SVG rasterization |
| LibreOffice | `apt install libreoffice` | PDF conversion |
| Poppler | `apt install poppler-utils` | `pdftoppm` |
| defusedxml | `pip install defusedxml` | Secure XML |
