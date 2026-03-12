export default function TagGraph({ projects, onTagClick, selectedTags }) {
  const getTagStats = () => {
    const tagCounts = new Map();

    projects.forEach((project) => {
      const allTags = [
        ...(project.project_info?.keywords || []),
        ...(project.project_info?.technologies_used || []),
        ...(project.project_info?.algorithms_models || []),
        ...(project.project_info?.datasets_used || [])
      ];

      allTags.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const sortedTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 25);

    return { tagCounts: new Map(sortedTags) };
  };

  if (projects.length === 0) return null;

  const { tagCounts } = getTagStats();
  const maxCount = Math.max(...tagCounts.values());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 rounded-xl border border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-6 shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span className="text-2xl">🏷️</span> Technology Cloud
        </h3>
        <p className="text-sm text-gray-600 mt-1">Click any tag to filter projects</p>
      </div>
      <div className="flex flex-wrap gap-3 justify-start">
        {Array.from(tagCounts.entries()).map(([tag, count]) => {
          const size = Math.max(0.8, (count / maxCount) * 1.2);
          const isSelected = selectedTags.has(tag);
          return (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className={`px-4 py-2 rounded-full font-medium transition-all duration-200 transform hover:scale-110 ${
                isSelected
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-110"
                  : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:shadow-md"
              }`}
              style={{
                fontSize: `${size * 0.75}rem`
              }}
              title={`${count} project${count > 1 ? "s" : ""}`}
            >
              {tag}
              <span
                className={`ml-1 text-xs font-bold ${
                  isSelected ? "text-blue-100" : "text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
