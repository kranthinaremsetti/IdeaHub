const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./src/config/db");
const projectRoutes = require("./src/routes/projectRoutes");

dotenv.config();

const app = express();

// Enable CORS so a local frontend can call this API.
app.use(cors());

// Parse incoming JSON payloads.
app.use(express.json());

// Quick health endpoint for local checks.
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    message: "IdeaHub Node backend is running"
  });
});

// Register project routes.
app.use("/", projectRoutes);

// Centralized error handler for upload, FastAPI, and DB errors.
app.use((err, req, res, next) => {
  if (err.message === "Only PDF files are allowed.") {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large. Max size is 10MB." });
  }

  const statusCode = err.response?.status || err.statusCode || 500;
  const message = err.response?.data?.detail || err.message || "Internal server error";

  return res.status(statusCode).json({ error: message });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://127.0.0.1:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
