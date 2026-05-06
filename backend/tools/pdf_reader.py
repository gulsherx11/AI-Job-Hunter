import fitz
import os

def read_resume(pdf_path: str) -> str:
    print(f"📄 Reading resume from: {pdf_path}")

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"Resume not found at: {pdf_path}")

    doc = fitz.open(pdf_path)
    full_text = ""

    for page in doc:
        full_text += page.get_text()

    doc.close()
    print(f"✅ Resume read ({len(full_text)} characters)")
    return full_text.strip()