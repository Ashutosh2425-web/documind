import pdfplumber

from docx import Document as DocxDocument


def extract_text_from_pdf(file_path):
    text_parts = []

    with pdfplumber.open(file_path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            page_text = page.extract_text()

            if page_text and page_text.strip():
                text_parts.append(
                    f"[PAGE {page_number}]\n{page_text.strip()}"
                )

    return "\n\n".join(text_parts)


def extract_text_from_docx(file_path):
    doc = DocxDocument(file_path)

    paragraphs = [
        para.text.strip()
        for para in doc.paragraphs
        if para.text.strip()
    ]

    return "\n\n".join(paragraphs)


def extract_text_from_txt(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        return f.read()


def extract_text(file_path):
    if file_path.lower().endswith('.pdf'):
        return extract_text_from_pdf(file_path)

    elif file_path.lower().endswith('.docx'):
        return extract_text_from_docx(file_path)

    elif file_path.lower().endswith('.txt'):
        return extract_text_from_txt(file_path)

    else:
        raise ValueError("Unsupported file type")