# schemas/project_schema.py
# ─────────────────────────────────────────────────────────────────────────────
# Pydantic models that define the exact shape of the data flowing through
# the API – both for request validation and response serialisation.
# ─────────────────────────────────────────────────────────────────────────────

from enum import Enum

from pydantic import BaseModel, Field
from typing import List


class ProjectDomain(str, Enum):
    """
    The four fixed domains a project can be classified into.
    Using str+Enum means FastAPI serialises the value (the string) not the key.
    """
    ARTIFICIAL_INTELLIGENCE = "Artificial Intelligence"
    MACHINE_LEARNING = "Machine Learning"
    QUANTUM_COMPUTING = "Quantum Computing"
    FULL_STACK_DEVELOPMENT = "Full Stack Development"


# ── Keyword → Domain fallback mapping ────────────────────────────────────────
# Used when Gemini returns a non-standard domain string.  The first match wins.
_DOMAIN_KEYWORDS: list[tuple[list[str], ProjectDomain]] = [
    (
        ["tensorflow", "pytorch", "keras", "cnn", "rnn", "lstm", "nlp",
         "natural language", "neural network", "deep learning", "scikit",
         "random forest", "gradient boost", "xgboost", "classification",
         "regression", "clustering", "machine learning", "ml model"],
        ProjectDomain.MACHINE_LEARNING,
    ),
    (
        ["qiskit", "quantum circuit", "qubit", "quantum gate", "quantum",
         "superposition", "entanglement", "quantum computing"],
        ProjectDomain.QUANTUM_COMPUTING,
    ),
    (
        ["react", "node.js", "nodejs", "vue", "angular", "express",
         "mongodb", "postgresql", "mysql", "rest api", "graphql",
         "full stack", "fullstack", "frontend", "backend", "web app",
         "django", "flask", "spring boot", "next.js"],
        ProjectDomain.FULL_STACK_DEVELOPMENT,
    ),
    (
        ["llm", "large language model", "gpt", "gemini", "ai agent",
         "intelligent system", "artificial intelligence", "knowledge graph",
         "expert system", "computer vision", "object detection", "yolo",
         "reinforcement learning", "autonomous", "chatbot", "nlp pipeline"],
        ProjectDomain.ARTIFICIAL_INTELLIGENCE,
    ),
]


def resolve_domain(raw: str) -> ProjectDomain:
    """
    Map *raw* (whatever Gemini returned) to a valid :class:`ProjectDomain`.

    1. Try an exact match against the enum values (case-insensitive).
    2. Try a substring match against the enum values.
    3. Scan ``raw`` for technology/algorithm keywords and pick the best domain.
    4. Fall back to Artificial Intelligence if nothing matches.
    """
    normalised = raw.strip().lower()

    # 1 – exact match
    for member in ProjectDomain:
        if normalised == member.value.lower():
            return member

    # 2 – substring match (e.g. "AI" → "Artificial Intelligence")
    for member in ProjectDomain:
        if member.value.lower() in normalised or normalised in member.value.lower():
            return member

    # 3 – keyword scan over the raw string
    for keywords, domain in _DOMAIN_KEYWORDS:
        for kw in keywords:
            if kw in normalised:
                return domain

    # 4 – default
    return ProjectDomain.ARTIFICIAL_INTELLIGENCE


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
    project_domain: ProjectDomain = Field(
        default=ProjectDomain.ARTIFICIAL_INTELLIGENCE,
        description="One of the four fixed domains: Artificial Intelligence, Machine Learning, Quantum Computing, Full Stack Development.",
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
