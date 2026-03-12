import { useEffect, useState } from "react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

function TagGraph({ projects, onTagClick, selectedTags }) {
  const getTagStats = () => {
    const tagCounts = new Map();
    const tagConnections = new Map();
    
    projects.forEach((project) => {
      const allTags = [
        ...(project.project_info?.keywords || []),
        ...(project.project_info?.technologies_used || []),
        ...(project.project_info?.algorithms_models || []),
        ...(project.project_info?.datasets_used || [])
      ];
      
      // Count tag frequencies
      allTags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
      
      // Track tag co-occurrences
      for (let i = 0; i < allTags.length; i++) {
        for (let j = i + 1; j < allTags.length; j++) {
          const key = [allTags[i], allTags[j]].sort().join('|');
          tagConnections.set(key, (tagConnections.get(key) || 0) + 1);
        }
      }
    });
    
    // Get top tags (minimum 1 occurrence, max 20 tags)
    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    return { tagCounts: new Map(sortedTags), tagConnections };
  };
  
  if (projects.length === 0) return null;
  
  const { tagCounts } = getTagStats();
  const maxCount = Math.max(...tagCounts.values());
  
  return (
    <div className="mb-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">📊 Tag Cloud</h3>
      <div className="flex flex-wrap gap-2">
        {Array.from(tagCounts.entries()).map(([tag, count]) => {
          const size = Math.max(0.7, (count / maxCount) * 1.8);
          const isSelected = selectedTags.has(tag);
          return (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105 ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gradient-to-r from-blue-100 to-purple-100 text-gray-700 hover:from-blue-200 hover:to-purple-200'
              }`}
              style={{
                fontSize: `${size * 0.75}rem`,
                opacity: count === 1 ? 0.7 : 1
              }}
            >
              {tag} ({count})
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Click tags to filter • Size indicates frequency • Showing top {tagCounts.size} tags
      </p>
    </div>
  );
}

function SimilarProjects({ projectId }) {
  const [similar, setSimilar] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/similar-projects/${projectId}`)
      .then((r) => r.json())
      .then((data) => setSimilar(data.similar || []))
      .catch(() => setSimilar([]));
  }, [projectId]);

  if (similar.length === 0) return null;

  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900">Similar Projects</h4>
      <div className="mt-2 space-y-2">
        {similar.map((s) => (
          <div key={s._id} className="flex items-center justify-between rounded border border-orange-200 bg-orange-50 px-3 py-2">
            <div className="min-w-0 flex-1">
              <span className="text-sm font-medium text-orange-900 block truncate">{s.project_title}</span>
              {s.project_domain && (
                <span className="text-xs text-orange-600">{s.project_domain}</span>
              )}
            </div>
            <span className="ml-3 flex-shrink-0 text-xs font-mono font-semibold text-orange-700">{s.score}% match</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [projects, setProjects] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [expandedProject, setExpandedProject] = useState(null);
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please select a PDF file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/upload-project`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setMessage("Project uploaded and saved successfully.");
      setFile(null);
      document.getElementById("pdfFile").value = "";
      fetchProjects();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  };

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
      info.project_title || '',
      info.abstract || '',
      info.problem_statement || '',
      info.methods_approach || '',
      info.project_domain || '',
      ...(info.keywords || []),
      ...(info.technologies_used || []),
      ...(info.algorithms_models || []),
      ...(info.datasets_used || []),
      project.file_name || ''
    ].join(' ').toLowerCase();
  };

  const getFilteredProjects = () => {
    let filtered = projects;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((p) => 
        getSearchableText(p).includes(query)
      );
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
    <div className="min-h-screen bg-gray-50">
      {/* GitHub-style header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">IH</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">IdeaHub</h1>
            </div>
            <p className="text-sm text-gray-500">Project Report Extractor</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Upload Section */}
        <section className="mb-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📄 Upload Project Report</h2>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <input
                id="pdfFile"
                type="file"
                accept="application/pdf"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className="flex-1 block rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm file:mr-3 file:bg-blue-600 file:px-3 file:py-1.5 file:text-white file:rounded file:border-0 file:cursor-pointer file:font-medium hover:file:bg-blue-700"
              />
              <button
                type="submit"
                disabled={isUploading}
                className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 whitespace-nowrap"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>

          {message && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-sm text-green-800">✓ {message}</p>
            </div>
          )}
          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm text-red-800">✕ {error}</p>
            </div>
          )}
        </section>

        {/* Tag Graph Visualization */}
        <TagGraph 
          projects={projects}
          onTagClick={handleTagClick}
          selectedTags={selectedTags}
        />

        {/* Projects Section */}
        <section className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">📚 Extracted Projects</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {filteredProjects.length} of {projects.length} project{projects.length !== 1 ? 's' : ''}
                  {(searchQuery.trim() || selectedTags.size > 0) && ' (filtered)'}
                </p>
              </div>
              <button
                onClick={fetchProjects}
                disabled={isLoadingProjects}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              >
                ↻ Refresh
              </button>
            </div>
            
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search projects by title, abstract, technologies, keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 pl-10 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                {searchQuery.trim() && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Active Filters */}
            {(searchQuery.trim() || selectedTags.size > 0) && (
              <div className="flex items-center gap-2 flex-wrap mb-4 p-3 bg-blue-50 rounded-lg">
                <span className="text-xs font-medium text-blue-700">Active filters:</span>
                {searchQuery.trim() && (
                  <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                    "search: {searchQuery.length > 20 ? searchQuery.slice(0, 20) + '...' : searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 font-bold hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                )}
                {Array.from(selectedTags).map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {tag}
                    <button
                      onClick={() => handleTagClick(tag)}
                      className="ml-1 font-bold hover:text-blue-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTags(new Set());
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium ml-2"
                >
                  Clear all
                </button>
              </div>
            )}
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
            <div className="divide-y divide-gray-200">
              {filteredProjects.map((project) => (
                <div key={project._id} className="hover:bg-gray-50 transition">
                  <button
                    onClick={() => setExpandedProject(expandedProject === project._id ? null : project._id)}
                    className="w-full text-left px-6 py-4 flex items-start justify-between gap-4 hover:bg-gray-50"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-blue-600 hover:text-blue-700 break-words">
                        {project.project_info?.project_title || "Untitled Project"}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        📁 {project.file_name} · {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-gray-400 ml-2 flex-shrink-0">
                      {expandedProject === project._id ? '▼' : '▶'}
                    </span>
                  </button>

                  {expandedProject === project._id && (
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 space-y-4">
                      {/* Abstract */}
                      {project.project_info?.abstract && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">Abstract</h4>
                          <p className="text-sm text-gray-700 mt-2">{project.project_info.abstract}</p>
                        </div>
                      )}

                      {/* Problem Statement */}
                      {project.project_info?.problem_statement && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">Problem Statement</h4>
                          <p className="text-sm text-gray-700 mt-2">{project.project_info.problem_statement}</p>
                        </div>
                      )}

                      {/* Methods & Approach */}
                      {project.project_info?.methods_approach && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">Methods & Approach</h4>
                          <p className="text-sm text-gray-700 mt-2">{project.project_info.methods_approach}</p>
                        </div>
                      )}

                      {/* Project Domain */}
                      {project.project_info?.project_domain && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">Domain</h4>
                          <p className="text-sm text-gray-700 mt-2">{project.project_info.project_domain}</p>
                        </div>
                      )}

                      {/* Algorithms & Models */}
                      {project.project_info?.algorithms_models?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">Algorithms & Models</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project.project_info.algorithms_models.map((algo) => (
                              <button
                                key={`${project._id}-algo-${algo}`}
                                onClick={() => handleTagClick(algo)}
                                className={`inline-block text-xs px-2.5 py-1 rounded-full font-mono transition cursor-pointer ${
                                  isTagSelected(algo)
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                }`}
                              >
                                {algo}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Technologies */}
                      {project.project_info?.technologies_used?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">Technologies</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project.project_info.technologies_used.map((tech) => (
                              <button
                                key={`${project._id}-tech-${tech}`}
                                onClick={() => handleTagClick(tech)}
                                className={`inline-block text-xs px-2.5 py-1 rounded-full transition cursor-pointer ${
                                  isTagSelected(tech)
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
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
                          <h4 className="text-sm font-semibold text-gray-900">Datasets</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project.project_info.datasets_used.map((dataset) => (
                              <button
                                key={`${project._id}-dataset-${dataset}`}
                                onClick={() => handleTagClick(dataset)}
                                className={`inline-block text-xs px-2.5 py-1 rounded-full transition cursor-pointer ${
                                  isTagSelected(dataset)
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
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
                          <h4 className="text-sm font-semibold text-gray-900">Keywords</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {project.project_info.keywords.map((keyword) => (
                              <button
                                key={`${project._id}-keyword-${keyword}`}
                                onClick={() => handleTagClick(keyword)}
                                className={`inline-block text-xs px-2 py-1 rounded border transition cursor-pointer ${
                                  isTagSelected(keyword)
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                #{keyword}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* GitHub Repo */}
                      {project.project_info?.github_repo && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">Repository</h4>
                          <a
                            href={project.project_info.github_repo}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline mt-2 inline-block"
                          >
                            🔗 {project.project_info.github_repo}
                          </a>
                        </div>
                      )}

                      {/* Similar Projects */}
                      <SimilarProjects projectId={project._id} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;