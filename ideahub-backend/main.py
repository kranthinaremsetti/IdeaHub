# main.py
# ─────────────────────────────────────────────────────────────────────────────
# Application entry-point.
# Creates the FastAPI app, configures middleware, and mounts all routers.
#
# Run locally:
#   uvicorn main:app --reload
#
# Swagger UI (interactive docs):
#   http://127.0.0.1:8000/docs
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers.project_router import router as project_router

# ── Application metadata ──────────────────────────────────────────────────────
app = FastAPI(
    title="IdeaHub API",
    description=(
        "Upload student project PDFs and receive structured project information "
        "extracted by the Gemini LLM."
    ),
    version="1.0.0",
    docs_url="/docs",       # Swagger UI
    redoc_url="/redoc",     # ReDoc UI
)

# ── CORS middleware ───────────────────────────────────────────────────────────
# Allow all origins for local development. Tighten this in production by
# replacing ["*"] with the exact front-end origin(s).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Router registration ───────────────────────────────────────────────────────
# All project-related endpoints live under /api/v1/upload-project
app.include_router(project_router, prefix="/api/v1")


# ── Health-check endpoint ─────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root() -> dict:
    """Simple liveness probe – confirms the API is running."""
    return {"status": "ok", "service": "IdeaHub API"}
