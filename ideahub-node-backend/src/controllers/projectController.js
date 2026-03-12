const ProjectExtraction = require("../models/ProjectExtraction");
const { callFastApiForExtraction } = require("../services/fastapiService");

const uploadProjectReport = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "PDF file is required in 'file' field." });
    }

    const { endpoint, projectInfo, rawResponse } = await callFastApiForExtraction(
      req.file.path,
      req.file.originalname
    );

    // Persist your friend's extraction response in MongoDB.
    const savedRecord = await ProjectExtraction.create({
      file_name: req.file.filename,
      fastapi_url: endpoint,
      project_info: projectInfo,
      raw_response: rawResponse,
      embedding: rawResponse.embedding || []
    });

    return res.status(200).json({
      message: "Project information extracted and stored successfully.",
      record_id: savedRecord._id,
      project_info: savedRecord.project_info
    });
  } catch (error) {
    return next(error);
  }
};

const getProjects = async (req, res, next) => {
  try {
    // Newest first so the latest upload appears at the top in the UI.
    const projects = await ProjectExtraction.find({})
      .sort({ created_at: -1 })
      .lean();

    return res.status(200).json({
      count: projects.length,
      projects
    });
  } catch (error) {
    return next(error);
  }
};

const getSimilarProjects = async (req, res, next) => {
  try {
    const target = await ProjectExtraction.findById(req.params.id).lean();

    if (!target || !target.embedding?.length) {
      return res.status(200).json({ similar: [] });
    }

    // Load all other projects that have a stored embedding.
    const others = await ProjectExtraction.find({
      _id: { $ne: target._id },
      "embedding.0": { $exists: true }
    }).lean();

    if (others.length === 0) {
      return res.status(200).json({ similar: [] });
    }

    // Dot product of two normalised vectors equals cosine similarity.
    const dotProduct = (a, b) => a.reduce((sum, val, i) => sum + val * b[i], 0);

    const scored = others
      .map((p) => ({ project: p, score: dotProduct(target.embedding, p.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return res.status(200).json({
      similar: scored.map(({ project, score }) => ({
        _id: project._id,
        project_title: project.project_info?.project_title || "Untitled",
        project_domain: project.project_info?.project_domain || "",
        technologies_used: project.project_info?.technologies_used || [],
        score: Math.round(score * 100)
      }))
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  uploadProjectReport,
  getProjects,
  getSimilarProjects
};
