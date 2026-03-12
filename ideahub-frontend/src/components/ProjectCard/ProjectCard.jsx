import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

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
    <div className="border-t border-gray-200 pt-4">
      <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
        <span className="text-lg">🔗</span> Similar Projects
      </h4>
      <div className="space-y-2">
        {similar.map((s) => (
          <button
            key={s._id}
            onClick={() => navigate(`/project/${s._id}`)}
            className="w-full flex items-start justify-between rounded-lg border border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 px-4 py-3 hover:shadow-md transition-shadow text-left"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-orange-900">{s.project_title}</p>
              {s.project_domain && (
                <p className="text-xs text-orange-700 mt-1">{s.project_domain}</p>
              )}
            </div>
            <span className="ml-4 flex-shrink-0 px-3 py-1 rounded-full bg-orange-200 text-orange-900 text-xs font-bold">
              {s.score}%
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProjectCard({
  project,
  expandedProject,
  setExpandedProject,
  handleTagClick,
  isTagSelected
}) {
  const navigate = useNavigate();

  return (
    <div className="group relative bg-white rounded-xl border-2 border-gray-200 hover:border-blue-400 p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Card Header */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition mb-2 line-clamp-2">
          {project.project_info?.project_title || "Untitled Project"}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
          <span>📅</span>
          <span>{new Date(project.created_at).toLocaleDateString()}</span>
          <span>•</span>
          <span className="truncate">{project.file_name}</span>
        </div>
      </div>

      {/* Abstract */}
      {project.project_info?.abstract && (
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">
          {project.project_info.abstract}
        </p>
      )}

      {/* Domain & Problem */}
      <div className="mb-4 space-y-2">
        {project.project_info?.project_domain && (
          <div className="flex items-start gap-2">
            <span className="text-xs font-bold text-gray-600 flex-shrink-0">📍</span>
            <span className="text-xs text-gray-600">{project.project_info.project_domain}</span>
          </div>
        )}
      </div>

      {/* Technologies & Tags Preview */}
      <div className="mb-4 flex flex-wrap gap-2 flex-grow">
        {project.project_info?.technologies_used?.slice(0, 2).map((tech) => (
          <button
            key={`${project._id}-tech-${tech}`}
            onClick={() => handleTagClick(tech)}
            className="px-2 py-1 text-xs font-semibold rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition cursor-pointer"
          >
            {tech}
          </button>
        ))}
        {(project.project_info?.technologies_used?.length || 0) > 2 && (
          <span className="px-2 py-1 text-xs font-semibold text-gray-600">
            +{(project.project_info?.technologies_used?.length || 0) - 2} tech
          </span>
        )}
        {project.project_info?.algorithms_models?.slice(0, 1).map((algo) => (
          <button
            key={`${project._id}-algo-${algo}`}
            onClick={() => handleTagClick(algo)}
            className="px-2 py-1 text-xs font-mono rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition cursor-pointer"
          >
            {algo}
          </button>
        ))}
      </div>

      {/* Footer Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200 mt-auto">
        <button
          onClick={() => navigate(`/project/${project._id}`)}
          className="flex-1 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 font-semibold text-sm transition"
        >
          👁️ View Details
        </button>
      </div>

      {/* Expanded Details */}
      {expandedProject === project._id && (
        <div className="mt-4 pt-4 border-t border-gray-200 space-y-4 text-sm">
          {/* Problem Statement */}
          {project.project_info?.problem_statement && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-1">Problem</h4>
              <p className="text-xs text-gray-700 line-clamp-2">
                {project.project_info.problem_statement}
              </p>
            </div>
          )}

          {/* Methods */}
          {project.project_info?.methods_approach && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-1">Approach</h4>
              <p className="text-xs text-gray-700 line-clamp-2">
                {project.project_info.methods_approach}
              </p>
            </div>
          )}

          {/* All Algorithms & Models */}
          {project.project_info?.algorithms_models?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-1">Models</h4>
              <div className="flex flex-wrap gap-1.5">
                {project.project_info.algorithms_models.map((algo) => (
                  <button
                    key={`${project._id}-full-algo-${algo}`}
                    onClick={() => handleTagClick(algo)}
                    className={`text-xs px-2 py-0.5 rounded font-mono transition ${
                      isTagSelected(algo)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                    }`}
                  >
                    {algo}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* All Technologies */}
          {project.project_info?.technologies_used?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-1">Stack</h4>
              <div className="flex flex-wrap gap-1.5">
                {project.project_info.technologies_used.map((tech) => (
                  <button
                    key={`${project._id}-full-tech-${tech}`}
                    onClick={() => handleTagClick(tech)}
                    className={`text-xs px-2 py-0.5 rounded transition ${
                      isTagSelected(tech)
                        ? "bg-blue-600 text-white"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Datasets */}
          {project.project_info?.datasets_used?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-1">Data</h4>
              <div className="flex flex-wrap gap-1.5">
                {project.project_info.datasets_used.map((dataset) => (
                  <button
                    key={`${project._id}-dataset-${dataset}`}
                    onClick={() => handleTagClick(dataset)}
                    className={`text-xs px-2 py-0.5 rounded transition ${
                      isTagSelected(dataset)
                        ? "bg-blue-600 text-white"
                        : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                    }`}
                  >
                    {dataset}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {project.project_info?.keywords?.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-gray-900 mb-1">Keywords</h4>
              <div className="flex flex-wrap gap-1.5">
                {project.project_info.keywords.slice(0, 4).map((keyword) => (
                  <button
                    key={`${project._id}-keyword-${keyword}`}
                    onClick={() => handleTagClick(keyword)}
                    className={`text-xs px-1.5 py-0.5 rounded border transition ${
                      isTagSelected(keyword)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    #{keyword.slice(0, 10)}
                  </button>
                ))}
                {(project.project_info?.keywords?.length || 0) > 4 && (
                  <span className="text-xs text-gray-600">
                    +{(project.project_info?.keywords?.length || 0) - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* GitHub Repo */}
          {project.project_info?.github_repo && (
            <div>
              <a
                href={project.project_info.github_repo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline block truncate"
              >
                🔗 Repository
              </a>
            </div>
          )}

          {/* Similar Projects */}
          <SimilarProjects projectId={project._id} />
        </div>
      )}
    </div>
  );
}
