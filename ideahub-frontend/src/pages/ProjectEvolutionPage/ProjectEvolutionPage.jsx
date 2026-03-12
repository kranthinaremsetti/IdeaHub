import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ProjectEvolutionGraph from "../../components/ProjectEvolution/ProjectEvolutionGraph";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export default function ProjectEvolutionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/projects/${id}`);
        const data = await response.json();
        if (data.project) {
          setProject(data.project);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/project/${id}`)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Details
            </button>
            <div className="border-l border-gray-300 pl-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🌐</span> Project Evolution
              </h1>
              {project && (
                <p className="text-sm text-gray-600 mt-1">
                  {project.project_info?.project_title || "Untitled"} & Related Work
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex-1">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl mb-2">⏳</div>
              <p className="text-gray-600">Loading evolution graph...</p>
            </div>
          </div>
        ) : (
          <ProjectEvolutionGraph projectId={id} />
        )}
      </div>

      {/* Info Panel */}
      <div className="bg-white border-t border-gray-200 shadow-lg p-4">
        <div className="max-w-7xl mx-auto">
          <details className="cursor-pointer">
            <summary className="font-semibold text-gray-900 flex items-center gap-2 hover:text-blue-600">
              <span>ℹ️</span> About Project Evolution View
            </summary>
            <div className="mt-3 text-sm text-gray-700 space-y-2 ml-6">
              <p>
                <strong>Central Blue Node:</strong> Your selected project, the focal point of evolution.
              </p>
              <p>
                <strong>Yellow Nodes:</strong> Key technologies used in your project - the building blocks of your work.
              </p>
              <p>
                <strong>Surrounding Colored Nodes:</strong> Related projects based on similarity:
                <br />
                🟢 <strong>Green:</strong> Highly related (70%+ similarity) | 🟠 <strong>Orange:</strong> Moderately related | 🔴 <strong>Red:</strong> Related but different
              </p>
              <p>
                <strong>Lines & Percentages:</strong> Shows connection strength and similarity score between projects.
              </p>
              <p className="pt-2">
                💡 <strong>Interactive Features:</strong> Drag nodes to rearrange • Scroll to zoom • Pan by holding space + dragging
              </p>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
