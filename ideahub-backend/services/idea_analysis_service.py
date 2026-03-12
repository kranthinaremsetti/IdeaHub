# services/idea_analysis_service.py
# ─────────────────────────────────────────────────────────────────────────────
# Analyses an already-extracted ProjectInfo object and uses the Gemini API to
# generate a list of technical limitations and suggested future improvements.
#
# This service is intentionally separate from llm_service.py so that each
# Gemini interaction has a single, clearly-scoped responsibility.
# ─────────────────────────────────────────────────────────────────────────────

import json
import re

import google.generativeai as genai

from config.settings import settings
from schemas.project_schema import ProjectAnalysis

# ── Re-use the same configured Gemini model instance ─────────────────────────
# genai.configure() was already called in llm_service.py when the app started,
# but calling it again here is harmless – it simply refreshes the key.
genai.configure(api_key=settings.GEMINI_API_KEY)

_model = genai.GenerativeModel(settings.GEMINI_MODEL)


# ── Prompt template ───────────────────────────────────────────────────────────
_ANALYSIS_PROMPT_TEMPLATE = """\
You are an AI research assistant analyzing a student project.

Based on the project details provided, identify realistic technical limitations \
and suggest future improvements or research directions.

Return ONLY valid JSON in this exact format — no markdown fences, no commentary:
{{
  "limitations": ["<string>", ...],
  "future_improvements": ["<string>", ...]
}}

Project data:
{project_data}
"""


def generate_limitations_and_improvements(project_data: dict) -> "ProjectAnalysis":
    """
    Send *project_data* (a dict representing an extracted :class:`ProjectInfo`)
    to the Gemini API and return a :class:`ProjectAnalysis` Pydantic model
    containing ``limitations`` and ``future_improvements``.

    Parameters
    ----------
    project_data : dict
        The extracted project information, typically obtained by calling
        ``project_info.model_dump()``.

    Returns
    -------
    ProjectAnalysis
        Validated Pydantic model with ``limitations`` and
        ``future_improvements`` lists.

    Raises
    ------
    ValueError
        If the Gemini response cannot be parsed as valid JSON.
    """
    # ── Build the prompt ──────────────────────────────────────────────────────
    # Pretty-print the project dict so the model has clean, readable context.
    project_json_str = json.dumps(project_data, indent=2)
    prompt = _ANALYSIS_PROMPT_TEMPLATE.format(project_data=project_json_str)

    # ── Call Gemini ───────────────────────────────────────────────────────────
    response = _model.generate_content(prompt)
    raw_text: str = response.text.strip()

    # ── Sanitise: strip accidental markdown code fences ───────────────────────
    raw_text = _strip_code_fences(raw_text)

    # ── Parse and validate ────────────────────────────────────────────────────
    try:
        data: dict = json.loads(raw_text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Gemini returned non-JSON content for analysis. "
            f"Raw response:\n{raw_text}"
        ) from exc

    # Pydantic coerces types and fills defaults for missing keys.
    return ProjectAnalysis(**data)


# ── Helper ────────────────────────────────────────────────────────────────────

def _strip_code_fences(text: str) -> str:
    """Remove ``` or ```json fences that Gemini occasionally adds."""
    pattern = r"^```(?:json)?\s*\n?(.*?)\n?```$"
    match = re.match(pattern, text, re.DOTALL)
    return match.group(1).strip() if match else text
