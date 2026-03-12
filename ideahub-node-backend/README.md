# IdeaHub Node Backend

Simple local Node.js backend for IdeaHub.

It does 3 things:
1. Accepts a project report PDF from frontend.
2. Forwards the PDF to your friend's FastAPI endpoint (`/upload-project`).
3. Stores the returned structured JSON in MongoDB.

## Folder Structure

```text
ideahub-node-backend/
  server.js
  package.json
  .env.example
  uploads/
  src/
    config/
      db.js
    controllers/
      projectController.js
    models/
      ProjectExtraction.js
    routes/
      projectRoutes.js
    services/
      fastapiService.js
```

## Setup (Local)

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example` and update values:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ideahub
FASTAPI_BASE_URL=http://127.0.0.1:8000
```

3. Start the backend:

```bash
npm run dev
```

## API

### Health Check

- `GET /health`

### Upload Project Report

- `POST /upload-project`
- Form-data field name: `file`
- File type: PDF only

Example `curl`:

```bash
curl -X POST http://127.0.0.1:5000/upload-project \
  -F "file=@D:/path/to/report.pdf"
```

Response format:

```json
{
  "message": "Project information extracted and stored successfully.",
  "record_id": "...",
  "project_info": {
    "project_title": "",
    "abstract": "",
    "problem_statement": "",
    "methods_approach": "",
    "algorithms_models": [],
    "technologies_used": [],
    "datasets_used": [],
    "project_domain": "",
    "keywords": [],
    "github_repo": ""
  }
}
```
