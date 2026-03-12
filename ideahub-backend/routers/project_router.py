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
from services.pdf_service import extract_text_from_pdf

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
    summary="Upload a student project PDF and extract structured information",
    description=(
        "Accept a PDF file, persist it to the uploads/ directory, extract "
        "the full text with pdfplumber, send the text to the Gemini LLM, and "
        "return structured project details including limitations and future "
        "improvements as JSON."
    ),
)
async def upload_project(
    file: UploadFile = File(..., description="Student project report in PDF format"),
) -> UploadResponse:
    """
    POST /upload-project

    Workflow
    --------
    1. Validate that the uploaded file is a PDF.
    2. Save the file to the uploads/ directory with a unique name.
    3. Extract plain text from the PDF using pdfplumber.
    4. Send the text to Gemini to extract structured project information.
    5. Send the extracted info back to Gemini to generate limitations &
       future improvements.
    6. Merge both results and return the combined JSON to the caller.
    """

    # ── Step 1 – Validate file type ───────────────────────────────────────────
    if file.content_type != "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Only PDF files are accepted. Got: {file.content_type}",
        )

    # ── Step 2 – Persist the file ─────────────────────────────────────────────
    # Use a UUID prefix to prevent filename collisions in the uploads/ folder.
    original_filename = file.filename or "upload.pdf"
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

    # ── Step 3 – Extract text from the PDF ───────────────────────────────────
    try:
        extracted_text: str = extract_text_from_pdf(destination)
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
