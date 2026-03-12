import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:5000";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

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

      // Redirect to homepage after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
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

          <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <span className="text-5xl">📤</span> Upload Project Report
          </h1>
          <p className="text-lg text-gray-600">
            Extract structured information from PDF project reports automatically
          </p>
        </div>

        {/* Upload Form */}
        <div className="rounded-xl border-2 border-gray-300 bg-white p-8 shadow-lg">
          <form onSubmit={handleUpload} className="space-y-6">
            {/* File Input */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Select PDF File
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-blue-400 transition-colors">
                <input
                  id="pdfFile"
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center pointer-events-none">
                  <div className="text-4xl mb-3">📄</div>
                  <p className="font-semibold text-gray-900">
                    {file ? file.name : "Click to select or drag and drop"}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">PDF files only (max 50MB)</p>
                </div>
              </div>
            </div>

            {/* File Info */}
            {file && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="font-semibold text-blue-900">{file.name}</p>
                    <p className="text-sm text-blue-700">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isUploading || !file}
                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold shadow-md hover:shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {isUploading ? "⏳ Processing..." : "📤 Upload Project"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Messages */}
          {message && (
            <div className="mt-6 px-6 py-4 rounded-lg bg-green-100 border-2 border-green-300 text-green-800 font-medium">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">✅</span>
                <div>
                  <p className="font-bold">Success!</p>
                  <p className="text-sm mt-1">{message}</p>
                  <p className="text-sm mt-2 text-green-700">Redirecting to projects...</p>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="mt-6 px-6 py-4 rounded-lg bg-red-100 border-2 border-red-300 text-red-800 font-medium">
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">❌</span>
                <div>
                  <p className="font-bold">Error!</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="font-bold text-gray-900 mb-2">Auto Detection</h3>
            <p className="text-sm text-gray-600">
              Automatically extracts project information from PDF reports
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold text-gray-900 mb-2">Structured Data</h3>
            <p className="text-sm text-gray-600">
              Organizes content into categories like tech stack, domain, datasets
            </p>
          </div>
          <div className="rounded-lg bg-white p-6 shadow-sm border border-gray-200">
            <div className="text-3xl mb-3">🔗</div>
            <h3 className="font-bold text-gray-900 mb-2">Easy Access</h3>
            <p className="text-sm text-gray-600">
              Search and filter projects by technology, keywords, and more
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
