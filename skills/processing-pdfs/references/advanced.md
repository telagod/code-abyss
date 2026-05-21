# PDF Advanced — OCR / Watermark / Encryption / Images

## OCR Scanned PDFs

```bash
pip install pytesseract pdf2image
```

```python
import pytesseract
from pdf2image import convert_from_path

images = convert_from_path('scanned.pdf')
text = ""
for i, image in enumerate(images):
    text += f"Page {i+1}:\n" + pytesseract.image_to_string(image) + "\n\n"
print(text)
```

## Add Watermark

```python
from pypdf import PdfReader, PdfWriter

watermark = PdfReader("watermark.pdf").pages[0]
reader = PdfReader("document.pdf")
writer = PdfWriter()
for page in reader.pages:
    page.merge_page(watermark)
    writer.add_page(page)
with open("watermarked.pdf", "wb") as output:
    writer.write(output)
```

## Extract Images

```bash
# poppler-utils
pdfimages -j input.pdf output_prefix
# → output_prefix-000.jpg, output_prefix-001.jpg, ...
```

## Password Protection

```python
from pypdf import PdfReader, PdfWriter

reader = PdfReader("input.pdf")
writer = PdfWriter()
for page in reader.pages:
    writer.add_page(page)
writer.encrypt("userpassword", "ownerpassword")
with open("encrypted.pdf", "wb") as output:
    writer.write(output)
```
