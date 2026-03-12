import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

function SimilarProjects({ projectId }) {
  const [similar, setSimilar] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE_URL}/similar-projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => setSimilar(data.similar || []))
      .catch(() => setSimilar([]));
  }, [projectId]);

  if (similar.length === 0) return null;

  return (
    <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="text-2xl">🔗</span> Similar Projects
      </h2>
      <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        {similar.map((s) => (
          <button
            key={s._id}
            onClick={() => navigate(`/project/${s._id}`)}
            className="text-left rounded-lg border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 p-4 hover:shadow-md hover:border-orange-400 transition-all"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-orange-900 line-clamp-2">{s.project_title}</p>
                {s.project_domain && (
                  <p className="text-sm text-orange-700 mt-1">{s.project_domain}</p>
                )}
              </div>
              <span className="flex-shrink-0 px-3 py-1 rounded-full bg-orange-200 text-orange-900 text-sm font-bold whitespace-nowrap">
                {s.score}%
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

export default function ProjectDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTags, setSelectedTags] = useState(new Set());

  useEffect(() => {
    fetch(`${API_BASE_URL}/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.project) {
          setProject(data.project);
        } else {
          setError("Project not found");
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [id]);

  const handleTagClick = (tag) => {
    const newTags = new Set(selectedTags);
    if (newTags.has(tag)) {
      newTags.delete(tag);
    } else {
      newTags.add(tag);
    }
    setSelectedTags(newTags);
  };

  const isTagSelected = (tag) => selectedTags.has(tag);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-gray-600 text-lg">Loading project details...</p>
        </div>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Projects
          </button>
          <div className="rounded-xl bg-white border-2 border-red-300 p-8 text-center shadow-md">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-900 mb-2">Project Not Found</h2>
            <p className="text-red-700 mb-6">{error || "The project you're looking for doesn't exist."}</p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Return to Projects
            </button>
          </div>
        </div>
      </main>
    );
  }

  const info = project.project_info || {};

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Projects
        </button>

        {/* Title Section */}
        <div className="mb-8 rounded-xl bg-white border-2 border-gray-200 p-6 shadow-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {info.project_title || "Untitled Project"}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <span>📅</span>
              <span>{new Date(project.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>📁</span>
              <span>{project.file_name}</span>
            </div>
            {info.project_domain && (
              <div className="flex items-center gap-1">
                <span>📍</span>
                <span>{info.project_domain}</span>
              </div>
            )}
          </div>
        </div>

        {/* Abstract */}
        {info.abstract && (
          <section className="mb-8 rounded-xl bg-blue-50 border-2 border-blue-200 p-6 shadow-md">
            <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span> Abstract
            </h2>
            <p className="text-blue-900 leading-relaxed">{info.abstract}</p>
          </section>
        )}

        {/* Problem Statement */}
        {info.problem_statement && (
          <section className="mb-8 rounded-xl bg-orange-50 border-2 border-orange-200 p-6 shadow-md">
            <h2 className="text-2xl font-bold text-orange-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span> Problem Statement
            </h2>
            <p className="text-orange-900 leading-relaxed">{info.problem_statement}</p>
          </section>
        )}

        {/* Methods & Approach */}
        {info.methods_approach && (
          <section className="mb-8 rounded-xl bg-green-50 border-2 border-green-200 p-6 shadow-md">
            <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔬</span> Methods & Approach
            </h2>
            <p className="text-green-900 leading-relaxed">{info.methods_approach}</p>
          </section>
        )}

        {/* Technologies */}
        {info.technologies_used?.length > 0 && (
          <section className="mb-8 rounded-xl bg-white border-2 border-gray-200 p-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚙️</span> Technologies ({info.technologies_used.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {info.technologies_used.map((tech) => (
                <button
                  key={tech}
                  onClick={() => handleTagClick(tech)}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                    isTagSelected(tech)
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  }`}
                >
                  {tech}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Algorithms & Models */}
        {info.algorithms_models?.length > 0 && (
          <section className="mb-8 rounded-xl bg-white border-2 border-gray-200 p-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🤖</span> Algorithms & Models ({info.algorithms_models.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {info.algorithms_models.map((algo) => (
                <button
                  key={algo}
                  onClick={() => handleTagClick(algo)}
                  className={`px-3 py-2 rounded-lg font-mono font-semibold text-sm transition ${
                    isTagSelected(algo)
                      ? "bg-gray-800 text-white shadow-md"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                >
                  {algo}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Datasets */}
        {info.datasets_used?.length > 0 && (
          <section className="mb-8 rounded-xl bg-white border-2 border-gray-200 p-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">📊</span> Datasets ({info.datasets_used.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {info.datasets_used.map((dataset) => (
                <button
                  key={dataset}
                  onClick={() => handleTagClick(dataset)}
                  className={`px-3 py-2 rounded-lg font-semibold text-sm transition ${
                    isTagSelected(dataset)
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                  }`}
                >
                  {dataset}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Keywords */}
        {info.keywords?.length > 0 && (
          <section className="mb-8 rounded-xl bg-white border-2 border-gray-200 p-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🏷️</span> Keywords ({info.keywords.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {info.keywords.map((keyword) => (
                <button
                  key={keyword}
                  onClick={() => handleTagClick(keyword)}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold border-2 transition ${
                    isTagSelected(keyword)
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-50 text-gray-700 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  #{keyword}
                </button>
              ))}
            </div>
          </section>
        )}

        {/* GitHub Repository */}
        {info.github_repo && (
          <section className="mb-8 rounded-xl bg-white border-2 border-gray-200 p-6 shadow-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔗</span> Repository
            </h2>
            <a
              href={info.github_repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 . .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.016 12.016 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              View on GitHub
            </a>
          </section>
        )}

        {/* View Evolution */}
        <section className="mb-8 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-purple-900 mb-2 flex items-center gap-2">
                <span className="text-2xl">🌳</span> Project Evolution
              </h2>
              <p className="text-purple-700">Visualize how this project relates to similar projects and technologies</p>
            </div>
            <button
              onClick={() => navigate(`/project/${id}/evolution`)}
              className="px-6 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition whitespace-nowrap"
            >
              View Evolution Graph
            </button>
          </div>
        </section>

        {/* Limitations */}
        {info.limitations?.length > 0 && (
          <section className="mb-8 rounded-xl bg-red-50 border-2 border-red-200 p-6 shadow-md">
            <h2 className="text-2xl font-bold text-red-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">⚠️</span> Limitations
            </h2>
            <ul className="space-y-3">
              {info.limitations.map((limitation, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-red-500 font-bold">•</span>
                  <span className="text-red-900">{limitation}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Future Improvements */}
        {info.future_improvements?.length > 0 && (
          <section className="mb-8 rounded-xl bg-green-50 border-2 border-green-200 p-6 shadow-md">
            <h2 className="text-2xl font-bold text-green-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🚀</span> Future Improvements
            </h2>
            <ul className="space-y-3">
              {info.future_improvements.map((improvement, idx) => (
                <li key={idx} className="flex gap-3">
                  <span className="text-green-500 font-bold">→</span>
                  <span className="text-green-900">{improvement}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Similar Projects */}
        <SimilarProjects projectId={id} />
      </div>
    </main>
  );
}
