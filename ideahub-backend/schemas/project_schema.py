# schemas/project_schema.py
# ─────────────────────────────────────────────────────────────────────────────
# Pydantic models that define the exact shape of the data flowing through
# the API – both for request validation and response serialisation.
# ─────────────────────────────────────────────────────────────────────────────

from pydantic import BaseModel, Field
from typing import List


class ProjectAnalysis(BaseModel):
    """
    Generated analysis of a student project.
    Produced by idea_analysis_service after the initial extraction step.
    """

    limitations: List[str] = Field(
        default_factory=list,
        description="Realistic technical or scope limitations of the project.",
    )
    future_improvements: List[str] = Field(
        default_factory=list,
        description="Suggested future research directions or enhancements.",
    )


class ProjectInfo(BaseModel):
    """
    Structured representation of a student project extracted by the LLM.
    Every field maps 1-to-1 to the JSON keys the LLM is instructed to return.
    """

    project_title: str = Field(
        default="",
        description="Full title of the project as stated in the report.",
    )
    abstract: str = Field(
        default="",
        description="Abstract or executive summary of the project.",
    )
    problem_statement: str = Field(
        default="",
        description="The problem the project aims to solve.",
    )
    methods_approach: str = Field(
        default="",
        description="Methodology or approach used to solve the problem.",
    )
    algorithms_models: List[str] = Field(
        default_factory=list,
        description="List of algorithms or ML/DL models used.",
    )
    technologies_used: List[str] = Field(
        default_factory=list,
        description="Programming languages, frameworks, tools, libraries, etc.",
    )
    datasets_used: List[str] = Field(
        default_factory=list,
        description="Datasets referenced or used in the project.",
    )
    project_domain: str = Field(
        default="",
        description="High-level domain, e.g. 'Computer Vision', 'NLP', 'IoT'.",
    )
    keywords: List[str] = Field(
        default_factory=list,
        description="Key terms or tags that describe the project.",
    )
    github_repo: str = Field(
        default="",
        description="GitHub repository URL if mentioned in the report.",
    )

    # ── Analysis fields (populated after the initial extraction pass) ─────────
    limitations: List[str] = Field(
        default_factory=list,
        description="Realistic technical or scope limitations of the project.",
    )
    future_improvements: List[str] = Field(
        default_factory=list,
        description="Suggested future research directions or enhancements.",
    )


class UploadResponse(BaseModel):
    """Response wrapper returned by the POST /upload-project endpoint."""

    filename: str = Field(description="Original name of the uploaded PDF file.")
    extracted_info: ProjectInfo = Field(
        description=(
            "Structured project information extracted by the LLM, "
            "including limitations and future improvements."
        )
    )
    embedding: List[float] = Field(
        default_factory=list,
        description="384-dimensional sentence-transformers embedding for similarity search.",
    )
