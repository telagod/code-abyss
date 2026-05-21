---
name: processing-docx
description: Processes Word document files (.docx). Creates, edits, annotates, tracks revisions, analyzes OOXML structure, and preserves formatting for contracts, policies, academic papers, and business documents. Use when working with .docx files or Word documents. Do NOT use for PDFs, spreadsheets, presentations, or plain text files.
user-invocable: false
allowed-tools: Bash, Read, Write, Edit, Glob
argument-hint: <file.docx | task>
---

# DOCX Processing

`.docx` is a ZIP archive of XML and resources. Different tasks have different tools and workflows.

## Workflow Decision

| Intent | Workflow | Reference |
|--------|----------|-----------|
| **Read/analyze text only** | pandoc → markdown | [raw-xml-access.md](references/raw-xml-access.md) |
| **Read structure, comments, media, formatting** | unpack → raw XML | [raw-xml-access.md](references/raw-xml-access.md) |
| **Create new document** | docx-js (JS/TS) | [docx-js.md](docx-js.md) |
| **Edit own document, simple changes** | Document library (Python) | [ooxml.md](ooxml.md) |
| **Edit someone else's document** | Redlining (tracked changes) | [redlining.md](references/redlining.md) |
| **Legal / academic / business / gov docs** | Redlining — REQUIRED | [redlining.md](references/redlining.md) |
| **Visual analysis** | soffice → PDF → pdftoppm | [raw-xml-access.md](references/raw-xml-access.md) |

## Text Extraction (Quick)

```bash
pandoc --track-changes=all path-to-file.docx -o output.md
# --track-changes=accept/reject/all
```

## Create New Document

1. **MANDATORY — READ ENTIRE FILE**: `docx-js.md` (~500 lines). NEVER set range limits.
2. Create JS/TS file using Document, Paragraph, TextRun components.
3. Export with `Packer.toBuffer()`.

## Edit Existing Document (Own, Simple)

1. **MANDATORY — READ ENTIRE FILE**: `ooxml.md` (~600 lines). NEVER set range limits.
2. `python ooxml/scripts/unpack.py <office_file> <output_dir>`
3. Run Python script using Document library.
4. `python ooxml/scripts/pack.py <input_dir> <office_file>`

## Edit Someone Else's Document → Redlining

See [redlining.md](references/redlining.md) for full 6-step workflow with batching strategy and RSID preservation.

## Code Style

- Write concise code, no verbose variable names, no unnecessary print statements.

## Dependencies

| Package | Install | Purpose |
|---------|---------|---------|
| pandoc | `apt install pandoc` | Text extraction |
| docx | `npm i -g docx` | Create new docs |
| LibreOffice | `apt install libreoffice` | PDF conversion |
| Poppler | `apt install poppler-utils` | `pdftoppm` for images |
| defusedxml | `pip install defusedxml` | Secure XML parsing |
