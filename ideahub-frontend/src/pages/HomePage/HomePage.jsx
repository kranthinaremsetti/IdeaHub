import { useEffect, useState } from "react";
import DomainFilter from "../../components/DomainFilter/DomainFilter";
import TagGraph from "../../components/TagGraph/TagGraph";
import ProjectCard from "../../components/ProjectCard/ProjectCard";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export default function HomePage({ searchQuery, setSearchQuery, selectedTags, setSelectedTags }) {
  const [projects, setProjects] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [error, setError] = useState("");
  const [expandedProject, setExpandedProject] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/projects`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load projects");
      }

      setProjects(data.projects || []);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const getSearchableText = (project) => {
    const info = project.project_info || {};
    return [
      info.project_title || "",
      info.abstract || "",
      info.problem_statement || "",
      info.methods_approach || "",
      info.project_domain || "",
      ...(info.keywords || []),
      ...(info.technologies_used || []),
      ...(info.algorithms_models || []),
      ...(info.datasets_used || []),
      project.file_name || ""
    ]
      .join(" ")
      .toLowerCase();
  };

  const getFilteredProjects = () => {
    let filtered = projects;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((p) => getSearchableText(p).includes(query));
    }

    // Apply domain filter
    if (selectedDomain) {
      filtered = filtered.filter((p) => p.project_info?.project_domain === selectedDomain);
    }

    // Apply tag filter
    if (selectedTags.size > 0) {
      filtered = filtered.filter((p) => {
        const allTags = [
          ...(p.project_info?.keywords || []),
          ...(p.project_info?.technologies_used || []),
          ...(p.project_info?.algorithms_models || []),
          ...(p.project_info?.datasets_used || [])
        ];
        return Array.from(selectedTags).some((tag) => allTags.includes(tag));
      });
    }

    return filtered;
  };

  const filteredProjects = getFilteredProjects();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50">
      {/* Domain Filter */}
      {projects.length > 0 && (
        <DomainFilter projects={projects} selectedDomain={selectedDomain} setSelectedDomain={setSelectedDomain} />
      )}

      {/* Tag Cloud */}
      {projects.length > 0 && (
        <TagGraph projects={projects} onTagClick={handleTagClick} selectedTags={selectedTags} />
      )}

      {/* Projects Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-3xl">📚</span> Projects
            <span className="text-base font-normal text-gray-600">({filteredProjects.length})</span>
          </h2>
          <button
            onClick={fetchProjects}
            disabled={isLoadingProjects}
            className="mt-3 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all disabled:opacity-60"
          >
            {isLoadingProjects ? "🔄 Refreshing..." : "🔄 Refresh"}
          </button>
        </div>

        {isLoadingProjects ? (
          <div className="px-6 py-8 text-center text-gray-500">Loading projects...</div>
        ) : filteredProjects.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-gray-500">
              {searchQuery.trim() || selectedTags.size > 0
                ? "No projects match your search criteria. Try different keywords or clear filters."
                : "No projects yet. Upload a PDF to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                expandedProject={expandedProject}
                setExpandedProject={setExpandedProject}
                handleTagClick={handleTagClick}
                isTagSelected={isTagSelected}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
