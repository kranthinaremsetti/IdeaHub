# services/pdf_service.py
# ─────────────────────────────────────────────────────────────────────────────
# Responsible for reading uploaded files (PDF or Markdown) and returning their
# plain-text content so that it can be forwarded to the LLM.
# ─────────────────────────────────────────────────────────────────────────────

import re
import pdfplumber
from pathlib import Path

# Supported file extensions and their human-readable labels
SUPPORTED_EXTENSIONS = {".pdf", ".md", ".markdown"}


def extract_text_from_file(file_path: str | Path) -> str:
    """
    Dispatch to the correct extractor based on the file extension.

    Parameters
    ----------
    file_path : str | Path
        Path to the uploaded file (PDF or Markdown).

    Returns
    -------
    str
        Plain-text content of the file.

    Raises
    ------
    ValueError
        If the file extension is not supported.
    FileNotFoundError
        If the file does not exist at the given path.
    """
    file_path = Path(file_path)
    ext = file_path.suffix.lower()

    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext in (".md", ".markdown"):
        return extract_text_from_markdown(file_path)
    else:
        raise ValueError(
            f"Unsupported file type '{ext}'. Accepted types: PDF, Markdown (.md)."
        )


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


def extract_text_from_markdown(file_path: str | Path) -> str:
    """
    Read a Markdown file and return its content as clean plain text.

    Markdown syntax (headers, bold, italic, code fences, HTML tags, link
    brackets) is stripped so the LLM receives pure prose rather than
    formatting noise.  The file may follow any structure — the Gemini model
    is explicitly instructed to infer fields from unstructured content.

    Parameters
    ----------
    file_path : str | Path
        Path to the .md / .markdown file on disk.

    Returns
    -------
    str
        Clean plain-text content of the Markdown file.

    Raises
    ------
    FileNotFoundError
        If the file does not exist at the given path.
    """
    file_path = Path(file_path)

    if not file_path.exists():
        raise FileNotFoundError(f"Markdown file not found at path: {file_path}")

    raw = file_path.read_text(encoding="utf-8", errors="replace")
    return _clean_markdown(raw)


# ── Markdown Cleaning Helper ──────────────────────────────────────────────────

def _clean_markdown(text: str) -> str:
    """
    Strip common Markdown syntax tokens and return readable plain text.

    The cleaning is intentionally lightweight — enough to remove structural
    noise (fences, headers, links) while preserving all semantic content that
    the LLM needs to infer project fields.
    """
    # Remove fenced code blocks (``` ... ```) — keep the code text itself
    text = re.sub(r"```[a-zA-Z]*\n?(.*?)```", r"\1", text, flags=re.DOTALL)

    # Remove inline code backticks
    text = re.sub(r"`([^`]+)`", r"\1", text)

    # Remove HTML tags
    text = re.sub(r"<[^>]+>", "", text)

    # Convert markdown links [text](url) → text
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)

    # Remove image syntax ![alt](url)
    text = re.sub(r"!\[[^\]]*\]\([^)]+\)", "", text)

    # Remove ATX headers (## Title → Title)
    text = re.sub(r"^#{1,6}\s+", "", text, flags=re.MULTILINE)

    # Remove bold / italic markers
    text = re.sub(r"\*{1,3}([^*]+)\*{1,3}", r"\1", text)
    text = re.sub(r"_{1,3}([^_]+)_{1,3}", r"\1", text)

    # Remove blockquote markers
    text = re.sub(r"^>\s+", "", text, flags=re.MULTILINE)

    # Remove horizontal rules
    text = re.sub(r"^[-*_]{3,}\s*$", "", text, flags=re.MULTILINE)

    # Normalise multiple blank lines into a single blank line
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()

