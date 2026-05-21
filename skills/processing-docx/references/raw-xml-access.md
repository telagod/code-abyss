# Raw XML Access for DOCX

Use raw XML access for: comments, complex formatting, document structure, embedded media, and metadata.

## Unpacking a File

```bash
python ooxml/scripts/unpack.py <office_file> <output_directory>
```

## Key File Structures

| Path | Purpose |
|------|---------|
| `word/document.xml` | Main document contents |
| `word/comments.xml` | Comments referenced in document.xml |
| `word/media/` | Embedded images and media files |

Tracked changes use:
- `<w:ins>` — insertions
- `<w:del>` — deletions

## Converting Documents to Images

Two-step process to visually analyze Word docs:

### 1. Convert DOCX to PDF

```bash
soffice --headless --convert-to pdf document.docx
```

### 2. Convert PDF pages to JPEG

```bash
pdftoppm -jpeg -r 150 document.pdf page
```

Creates `page-1.jpg`, `page-2.jpg`, etc.

**Options**:
- `-r 150` — DPI (adjust for quality/size)
- `-jpeg` — output JPEG (or `-png`)
- `-f N` — first page (e.g., `-f 2`)
- `-l N` — last page (e.g., `-l 5`)
- `page` — output prefix

### Example: Specific range

```bash
pdftoppm -jpeg -r 150 -f 2 -l 5 document.pdf page  # Pages 2–5 only
```
