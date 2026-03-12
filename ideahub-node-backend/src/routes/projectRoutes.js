const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const { uploadProjectReport, getProjects, getSimilarProjects } = require("../controllers/projectController");

const router = express.Router();

const uploadsPath = path.join(__dirname, "../../uploads");

// Ensure uploads folder exists for local development.
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsPath);
  },
  filename: (req, file, cb) => {
    const cleanOriginalName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${cleanOriginalName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed."));
    }

    return cb(null, true);
  }
});

// Main endpoint used by the frontend.
router.post("/upload-project", upload.single("file"), uploadProjectReport);

// Fetch saved projects for the frontend project section.
router.get("/projects", getProjects);

// Find semantically similar projects by embedding cosine similarity.
router.get("/similar-projects/:id", getSimilarProjects);

module.exports = router;
