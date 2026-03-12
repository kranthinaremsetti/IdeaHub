export default function SearchBar({
  searchQuery,
  setSearchQuery,
  selectedTags,
  setSelectedTags,
  onTagClick
}) {
  const handleClearAll = () => {
    setSearchQuery("");
    setSelectedTags(new Set());
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 rounded-xl border border-gray-300 bg-white p-6 shadow-md">
      <div className="space-y-4">
        {/* Search Bar */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">
            🔍 Search Projects
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Search by title, technology, keywords, domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-5 py-3 pl-12 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            />
            <svg
              className="absolute left-4 top-3.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            {searchQuery.trim() && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Active Filters */}
        {(searchQuery.trim() || selectedTags.size > 0) && (
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-2 flex-wrap mb-3">
              <span className="text-xs font-bold text-blue-900 bg-blue-200 px-3 py-1 rounded-full">
                Filters Active
              </span>
              {searchQuery.trim() && (
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-600 text-white text-xs font-semibold">
                  🔍 "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="font-bold hover:text-blue-100"
                  >
                    ×
                  </button>
                </span>
              )}
              {Array.from(selectedTags).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-200 text-blue-900 text-xs font-semibold"
                >
                  {tag}
                  <button
                    onClick={() => onTagClick(tag)}
                    className="font-bold hover:text-blue-700"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={handleClearAll}
                className="ml-auto text-xs font-bold text-blue-600 hover:text-blue-800 underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
