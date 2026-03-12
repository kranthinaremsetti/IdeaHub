const mongoose = require("mongoose");

const ProjectInfoSchema = new mongoose.Schema(
  {
    project_title: { type: String, default: "" },
    abstract: { type: String, default: "" },
    problem_statement: { type: String, default: "" },
    methods_approach: { type: String, default: "" },
    algorithms_models: { type: [String], default: [] },
    technologies_used: { type: [String], default: [] },
    datasets_used: { type: [String], default: [] },
    project_domain: { type: String, default: "" },
    keywords: { type: [String], default: [] },
    github_repo: { type: String, default: "" }
  },
  { _id: false }
);

const ProjectExtractionSchema = new mongoose.Schema(
  {
    file_name: { type: String, required: true },
    fastapi_url: { type: String, required: true },
    project_info: { type: ProjectInfoSchema, required: true },
    raw_response: { type: mongoose.Schema.Types.Mixed, default: {} },
    embedding: { type: [Number], default: [] },
    created_at: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

module.exports = mongoose.model("ProjectExtraction", ProjectExtractionSchema);
