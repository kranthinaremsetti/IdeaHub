const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");

// Ensure values are always clean strings.
const normalizeString = (value) => {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
};

// Ensure values are always string arrays.
const normalizeArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

// FastAPI UploadResponse shape: { filename: "...", extracted_info: { ... } }
const pickProjectPayload = (responseData) => {
  if (responseData && typeof responseData === "object") {
    if (responseData.extracted_info && typeof responseData.extracted_info === "object") {
      return responseData.extracted_info;
    }
  }

  return responseData;
};

const normalizeProjectInfo = (rawData) => {
  const data = (rawData && typeof rawData === "object") ? rawData : {};

  return {
    project_title: normalizeString(data.project_title),
    abstract: normalizeString(data.abstract),
    problem_statement: normalizeString(data.problem_statement),
    methods_approach: normalizeString(data.methods_approach),
    algorithms_models: normalizeArray(data.algorithms_models),
    technologies_used: normalizeArray(data.technologies_used),
    datasets_used: normalizeArray(data.datasets_used),
    project_domain: normalizeString(data.project_domain),
    keywords: normalizeArray(data.keywords),
    github_repo: normalizeString(data.github_repo)
  };
};

const callFastApiForExtraction = async (filePath, originalName) => {
  const baseUrl = (process.env.FASTAPI_BASE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
  // FastAPI router is mounted at /api/v1, router prefix is /upload-project
  const endpoint = `${baseUrl}/api/v1/upload-project`;

  const formData = new FormData();

  // Send the same file to your friend's FastAPI endpoint as multipart/form-data.
  formData.append("file", fs.createReadStream(filePath), originalName);

  const response = await axios.post(endpoint, formData, {
    headers: formData.getHeaders(),
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
    timeout: 120000
  });

  const payload = pickProjectPayload(response.data);
  const projectInfo = normalizeProjectInfo(payload);

  return {
    endpoint,
    projectInfo,
    rawResponse: response.data
  };
};

module.exports = {
  callFastApiForExtraction,
  normalizeProjectInfo
};
