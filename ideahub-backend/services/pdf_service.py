# services/pdf_service.py
# ─────────────────────────────────────────────────────────────────────────────
# Responsible for reading an uploaded PDF file and returning its plain-text
# content so that it can be forwarded to the LLM.
# ─────────────────────────────────────────────────────────────────────────────

import pdfplumber
from pathlib import Path


def extract_text_from_pdf(file_path: str | Path) -> str:
    """
    Open a PDF at *file_path* using pdfplumber, iterate over every page,
    and concatenate all extracted text into a single string.

    Parameters
    ----------
    file_path : str | Path
        Absolute (or relative) path to the PDF file on disk.

    Returns
    -------
    str
        Combined plain-text content of all pages, separated by newlines.
        Returns an empty string if no text could be extracted.

    Raises
    ------
    FileNotFoundError
        If the file does not exist at the given path.
    """
    file_path = Path(file_path)

    if not file_path.exists():
        raise FileNotFoundError(f"PDF not found at path: {file_path}")

    extracted_pages: list[str] = []

    # pdfplumber.open() returns a context manager that closes the file handle
    # automatically when the block exits.
    with pdfplumber.open(file_path) as pdf:
        for page_number, page in enumerate(pdf.pages, start=1):
            # extract_text() returns None when a page has no selectable text
            # (e.g. scanned images without OCR). We guard against that here.
            page_text = page.extract_text()
            if page_text:
                extracted_pages.append(page_text)

    # Join every page's text with a blank-line separator for readability.
    return "\n\n".join(extracted_pages)
