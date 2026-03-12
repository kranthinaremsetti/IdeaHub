import { Link } from "react-router-dom";

export default function Header({ searchQuery, setSearchQuery }) {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-300 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Branding */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-75 transition flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">IH</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IdeaHub</h1>
              <p className="text-xs text-gray-600">Project Intelligence Platform</p>
            </div>
          </Link>

          {/* Search Bar - Left side */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Search projects, tech, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-sm"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-gray-400"
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
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 transition"
                >
                  <svg
                    className="h-4 w-4"
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

          {/* Navigation & Actions - Right side */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link
              to="/upload"
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all whitespace-nowrap"
            >
              📤 Upload Project
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
