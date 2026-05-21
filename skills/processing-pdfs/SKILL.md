---
name: processing-pdfs
description: Processes PDF files. Extracts text and tables, fills forms, merges and splits documents, batch-processes files, converts to images, and generates PDFs programmatically. Use when working with .pdf files. Do NOT use for Word documents, spreadsheets, or presentations.
user-invocable: false
allowed-tools: Bash, Read, Write, Edit, Glob
argument-hint: <file.pdf | task>
---

# PDF Processing

Essential PDF operations using Python libraries and CLI tools.

## Decision Matrix

| Task | Best Tool | Reference |
|------|-----------|-----------|
| Merge / split / metadata / rotate | pypdf | [recipes.md](references/recipes.md) |
| Extract text (layout preserved) | pdfplumber | [recipes.md](references/recipes.md) |
| Extract tables | pdfplumber | [recipes.md](references/recipes.md) |
| Create new PDF | reportlab | [recipes.md](references/recipes.md) |
| Batch CLI ops | qpdf / pdftk | [recipes.md](references/recipes.md) |
| OCR scanned PDFs | pytesseract + pdf2image | [advanced.md](references/advanced.md) |
| Add watermark / extract images / encrypt | pypdf / pdfimages | [advanced.md](references/advanced.md) |
| Fill PDF forms | pdf-lib / pypdf | [FORMS.md](FORMS.md) |
| Advanced pypdfium2 / pdf-lib JS | — | [REFERENCE.md](REFERENCE.md) |

## Quick Start

```python
from pypdf import PdfReader
reader = PdfReader("document.pdf")
print(f"Pages: {len(reader.pages)}")
text = "".join(page.extract_text() for page in reader.pages)
```

## Workflow

1. **Identify task** — text extraction? table? creation? form? Pick row from matrix above.
2. **Load reference** — recipes.md covers 90% of tasks; advanced.md for OCR / encrypt; FORMS.md for forms.
3. **Implement** — copy-adapt recipe; verify output.
4. **Validate** — open in a viewer or grep extracted text.

## Library Selection

| Library | Use for |
|---------|---------|
| pypdf | Merge, split, metadata, encryption, rotation |
| pdfplumber | Text extraction with layout, tables |
| reportlab | Generate PDFs programmatically |
| pdf2image + pytesseract | OCR scanned documents |
| qpdf / pdftk (CLI) | Batch ops, no Python needed |
