# Redlining Workflow — Tracked Changes for Document Review

This workflow plans comprehensive tracked changes using markdown before implementing them in OOXML. For complete tracked changes, implement ALL changes systematically.

## Principle: Minimal, Precise Edits

When implementing tracked changes, only mark text that actually changes. Repeating unchanged text makes edits harder to review and appears unprofessional. Break replacements into: [unchanged text] + [deletion] + [insertion] + [unchanged text]. Preserve the original run's RSID for unchanged text by extracting the `<w:r>` element from the original and reusing it.

### Example — Changing "30 days" to "60 days"

```python
# BAD — Replaces entire sentence
'<w:del><w:r><w:delText>The term is 30 days.</w:delText></w:r></w:del><w:ins><w:r><w:t>The term is 60 days.</w:t></w:r></w:ins>'

# GOOD — Only marks what changed, preserves original <w:r> for unchanged text
'<w:r w:rsidR="00AB12CD"><w:t>The term is </w:t></w:r><w:del><w:r><w:delText>30</w:delText></w:r></w:del><w:ins><w:r><w:t>60</w:t></w:r></w:ins><w:r w:rsidR="00AB12CD"><w:t> days.</w:t></w:r>'
```

## Batching Strategy

Group related changes into batches of 3–10 changes. This makes debugging manageable while maintaining efficiency. Test each batch before moving to the next.

## Workflow

### 1. Convert document to markdown with tracked changes preserved

```bash
pandoc --track-changes=all path-to-file.docx -o current.md
```

### 2. Identify and group changes

**Location methods** (for finding changes in XML):
- Section/heading numbers (e.g., "Section 3.2", "Article IV")
- Paragraph identifiers if numbered
- Grep patterns with unique surrounding text
- Document structure (e.g., "first paragraph", "signature block")
- DO NOT use markdown line numbers — they don't map to XML structure

**Batch organization** (group 3–10 related changes per batch):
- By section: "Batch 1: Section 2 amendments", "Batch 2: Section 5 updates"
- By type: "Batch 1: Date corrections", "Batch 2: Party name changes"
- By complexity: Start with simple text replacements, then tackle complex structural changes
- Sequential: "Batch 1: Pages 1-3", "Batch 2: Pages 4-6"

### 3. Read documentation and unpack

- **MANDATORY — READ ENTIRE FILE**: Read `ooxml.md` (~600 lines) completely. NEVER set range limits. Pay special attention to "Document Library" and "Tracked Change Patterns" sections.
- **Unpack the document**: `python ooxml/scripts/unpack.py <file.docx> <dir>`
- **Note the suggested RSID**: The unpack script will suggest an RSID for tracked changes. Copy this RSID for step 4b.

### 4. Implement changes in batches

Group changes logically (by section, type, or proximity) and implement them together in a single script. Benefits:
- Debugging easier (smaller batch = isolate errors easily)
- Allows incremental progress
- Maintains efficiency (batch size of 3–10 works well)

**Suggested groupings**:
- By document section ("Section 3 changes", "Definitions", "Termination clause")
- By change type ("Date changes", "Party name updates", "Legal term replacements")
- By proximity ("Changes on pages 1-3", "Changes in first half")

For each batch:

**a. Map text to XML** — Grep for text in `word/document.xml` to verify how text splits across `<w:r>` elements.

**b. Create and run script** — Use `get_node` to find nodes, implement changes, then `doc.save()`. See **"Document Library"** in ooxml.md for patterns.

**Note**: Always grep `word/document.xml` immediately before writing a script to get current line numbers. Line numbers change after each script run.

### 5. Pack the document

```bash
python ooxml/scripts/pack.py unpacked reviewed-document.docx
```

### 6. Final verification

```bash
# Convert final to markdown
pandoc --track-changes=all reviewed-document.docx -o verification.md

# Verify ALL changes applied
grep "original phrase" verification.md  # Should NOT find
grep "replacement phrase" verification.md  # Should find
```

Check no unintended changes were introduced.
