# services/llm_service.py
# ─────────────────────────────────────────────────────────────────────────────
# Handles all communication with the Google Gemini API.
# Sends the raw PDF text and receives structured JSON describing the project.
# ─────────────────────────────────────────────────────────────────────────────

import json
import re
import google.generativeai as genai

from config.settings import settings
from schemas.project_schema import ProjectInfo


# ── Configure the Gemini client once, at module import time ──────────────────
# The API key is read from the environment via the Settings singleton.
genai.configure(api_key=settings.GEMINI_API_KEY)

# Instantiate the generative model specified in settings (default: gemini-1.5-flash).
_model = genai.GenerativeModel(settings.GEMINI_MODEL)


# ── Prompt template ───────────────────────────────────────────────────────────
_SYSTEM_PROMPT = """\
You are an AI system that extracts structured information from student project reports.
Extract the required fields and return valid JSON.

Return ONLY a valid JSON object — no markdown fences, no extra commentary.

The JSON must follow this exact schema:
{
  "project_title": "<string>",
  "abstract": "<string>",
  "problem_statement": "<string>",
  "methods_approach": "<string>",
  "algorithms_models": ["<string>", ...],
  "technologies_used": ["<string>", ...],
  "datasets_used": ["<string>", ...],
  "project_domain": "<string>",
  "keywords": ["<string>", ...],
  "github_repo": "<string>"
}

If a field cannot be determined from the text, use an empty string "" or empty list [].
"""


def extract_project_info(text: str) -> ProjectInfo:
    """
    Send *text* (the full content of a student project report) to the Gemini
    API and return a validated :class:`ProjectInfo` Pydantic model.

    Parameters
    ----------
    text : str
        Plain-text content extracted from the uploaded PDF.

    Returns
    -------
    ProjectInfo
        Pydantic model populated with the fields extracted by the LLM.

    Raises
    ------
    ValueError
        If the LLM response cannot be parsed as valid JSON.
    """
    # Build the full prompt by appending the raw report text.
    full_prompt = f"{_SYSTEM_PROMPT}\n\n--- START OF REPORT ---\n{text}\n--- END OF REPORT ---"

    # Send the prompt to Gemini and capture the text response.
    response = _model.generate_content(full_prompt)
    raw_text: str = response.text.strip()

    # ── Sanitise the response ─────────────────────────────────────────────────
    # Gemini sometimes wraps JSON in ```json ... ``` code fences despite our
    # instructions. Strip them defensively.
    raw_text = _strip_code_fences(raw_text)

    # ── Parse and validate ────────────────────────────────────────────────────
    try:
        data: dict = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Gemini returned non-JSON content. Raw response:\n{raw_text}"
        ) from exc

    # Pydantic will validate types and fill in defaults for missing fields.
    return ProjectInfo(**data)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _strip_code_fences(text: str) -> str:
    """
    Remove Markdown code fences (```json ... ``` or ``` ... ```) from *text*
    if present, returning the inner content.
    """
    # Match an optional language tag after the opening fence.
    pattern = r"^```(?:json)?\s*\n?(.*?)\n?```$"
    match = re.match(pattern, text, re.DOTALL)
    if match:
        return match.group(1).strip()
    return text
