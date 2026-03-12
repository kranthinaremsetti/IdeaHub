export default function DomainFilter({ projects, selectedDomain, setSelectedDomain }) {
  // Extract unique domains
  const getAllDomains = () => {
    const domains = new Set();
    projects.forEach((project) => {
      if (project.project_info?.project_domain) {
        domains.add(project.project_info.project_domain);
      }
    });
    return Array.from(domains).sort();
  };

  const domains = getAllDomains();
  
  if (domains.length === 0) return null;

  // Count projects per domain
  const getDomainCount = (domain) => {
    return projects.filter((p) => p.project_info?.project_domain === domain).length;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 rounded-xl border border-gray-300 bg-gradient-to-br from-indigo-50 to-blue-50 p-6 shadow-md">
      <div>
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <span className="text-2xl">🎯</span> Project Domains
        </h3>
        <div className="flex flex-wrap gap-3 justify-start">
          {/* "All Domains" button */}
          <button
            onClick={() => setSelectedDomain(null)}
            className={`px-4 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105 ${
              selectedDomain === null
                ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg scale-105"
                : "bg-white text-gray-700 border-2 border-gray-300 hover:border-indigo-400 hover:shadow-md"
            }`}
            title="Show all projects"
          >
            All Domains
            <span className={`ml-2 text-xs font-bold ${selectedDomain === null ? "text-indigo-100" : "text-gray-500"}`}>
              {projects.length}
            </span>
          </button>

          {/* Domain buttons */}
          {domains.map((domain) => {
            const count = getDomainCount(domain);
            const isSelected = selectedDomain === domain;
            return (
              <button
                key={domain}
                onClick={() => setSelectedDomain(isSelected ? null : domain)}
                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-105 ${
                  isSelected
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg scale-105"
                    : "bg-white text-gray-700 border-2 border-gray-300 hover:border-indigo-400 hover:shadow-md"
                }`}
                title={`${count} project${count > 1 ? "s" : ""}`}
              >
                {domain}
                <span className={`ml-2 text-xs font-bold ${isSelected ? "text-indigo-100" : "text-gray-500"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
