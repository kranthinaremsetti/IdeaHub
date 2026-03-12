# services/embedding_service.py
# Generates a 384-dimensional text embedding for a project using a local
# sentence-transformers model. No API key required — the model (~90 MB)
# is downloaded once on first use and then runs fully offline.

from sentence_transformers import SentenceTransformer

# all-MiniLM-L6-v2: fast, lightweight, good similarity quality.
_model = SentenceTransformer("all-MiniLM-L6-v2")


def _build_project_text(project_data: dict) -> str:
    """Concatenate the most meaningful project fields into a single string."""
    parts = [
        project_data.get("project_title", ""),
        project_data.get("abstract", ""),
        project_data.get("problem_statement", ""),
        project_data.get("project_domain", ""),
        " ".join(project_data.get("keywords", [])),
        " ".join(project_data.get("technologies_used", [])),
        " ".join(project_data.get("algorithms_models", [])),
    ]
    return " ".join(p for p in parts if p.strip())


def generate_embedding(project_data: dict) -> list:
    """
    Return a 384-dimensional float list representing the project content.

    Parameters
    ----------
    project_data : dict
        Dict of extracted project fields (from ProjectInfo.model_dump()).

    Returns
    -------
    list[float]
        Normalised embedding vector, or empty list if no text could be built.
    """
    text = _build_project_text(project_data)
    if not text.strip():
        return []
    # normalize_embeddings=True means dot product == cosine similarity.
    vector = _model.encode(text, normalize_embeddings=True)
    return vector.tolist()
