# routers/project_router.py
# ─────────────────────────────────────────────────────────────────────────────
# Defines all API endpoints related to project uploads and extraction.
# This router is registered in main.py with the prefix /api/v1.
# ─────────────────────────────────────────────────────────────────────────────

import shutil
import uuid
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from config.settings import settings
from schemas.project_schema import UploadResponse
from services.embedding_service import generate_embedding
from services.idea_analysis_service import generate_limitations_and_improvements
from services.llm_service import extract_project_info
from services.pdf_service import SUPPORTED_EXTENSIONS, extract_text_from_file

# ── Router definition ─────────────────────────────────────────────────────────
# Tags appear in the Swagger UI to group related endpoints.
router = APIRouter(
    prefix="/upload-project",
    tags=["Project Upload"],
)


@router.post(
    "",
    response_model=UploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload a project report (PDF or Markdown) and extract structured information",
    description=(
        "Accept a PDF or Markdown (.md) file, persist it to the uploads/ directory, "
        "extract the full text, send it to the Gemini LLM, and return structured "
        "project details including limitations and future improvements as JSON. "
        "Markdown files do not need to follow any fixed structure — Gemini will infer "
        "the fields from whatever content is present."
    ),
)
async def upload_project(
    file: UploadFile = File(
        ...,
        description="Student project report as a PDF or Markdown (.md) file",
    ),
) -> UploadResponse:
    """
    POST /upload-project

    Workflow
    --------
    1. Validate the file is a PDF or Markdown file (by extension).
    2. Save the file to the uploads/ directory with a unique name.
    3. Extract plain text using the appropriate extractor.
    4. Send the text to Gemini to extract structured project information.
    5. Send the extracted info back to Gemini to generate limitations &
       future improvements.
    6. Merge both results and return the combined JSON to the caller.
    """

    # ── Step 1 – Validate file type by extension ─────────────────────────────
    # We check the filename extension rather than content_type because browsers
    # commonly report .md files as text/plain or application/octet-stream.
    original_filename = file.filename or "upload"
    file_ext = Path(original_filename).suffix.lower()

    if file_ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported file type '{file_ext}'. "
                f"Accepted types: .pdf, .md, .markdown"
            ),
        )

    # ── Step 2 – Persist the file ─────────────────────────────────────────────
    # Use a UUID prefix to prevent filename collisions in the uploads/ folder.
    unique_filename = f"{uuid.uuid4().hex}_{original_filename}"
    destination: Path = settings.UPLOAD_DIR / unique_filename

    try:
        with destination.open("wb") as buffer:
            # shutil.copyfileobj streams the data in chunks, keeping memory
            # usage low even for large PDFs.
            shutil.copyfileobj(file.file, buffer)
    except OSError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not save the uploaded file: {exc}",
        ) from exc
    finally:
        # Always close the UploadFile handle to free resources.
        await file.close()

    # ── Step 3 – Extract text from the file (PDF or Markdown) ────────────────
    try:
        extracted_text: str = extract_text_from_file(destination)
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(exc),
        ) from exc

    if not extracted_text.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                "No readable text could be extracted from the PDF. "
                "The file may be scanned / image-only."
            ),
        )

    # ── Step 4 – Extract structured project information from the text ─────────
    try:
        project_info = extract_project_info(extracted_text)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"LLM parsing error: {exc}",
        ) from exc
    except Exception as exc:  # Generic catch-all for Gemini API errors
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini API error: {exc}",
        ) from exc

    # ── Step 5 – Generate limitations & future improvements ────────────────
    # Pass the freshly extracted project dict to the analysis service.
    # We use model_dump() so Pydantic serialises lists/strings correctly.
    try:
        analysis = generate_limitations_and_improvements(project_info.model_dump())
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Analysis LLM parsing error: {exc}",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Gemini analysis API error: {exc}",
        ) from exc

    # ── Step 6 – Merge extraction + analysis into the final response ─────────
    # model_copy(update=...) returns a new ProjectInfo instance with the
    # limitations and future_improvements fields populated, without mutating
    # the original object.
    enriched_info = project_info.model_copy(
        update={
            "limitations": analysis.limitations,
            "future_improvements": analysis.future_improvements,
        }
    )

    # ── Step 6 – Generate embedding for similarity search ────────────────────
    project_dict = enriched_info.model_dump()
    embedding = generate_embedding(project_dict)

    return UploadResponse(filename=original_filename, extracted_info=enriched_info, embedding=embedding)
