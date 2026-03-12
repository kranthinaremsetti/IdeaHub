# IdeaHub Full Stack

A complete local system for uploading project report PDFs, extracting structured info via LLM, and viewing saved projects.

## Architecture

| Component | Tech | Port | Purpose |
|-----------|------|------|---------|
| **FastAPI Backend** | Python, Gemini LLM | 8000 | PDF text extraction, LLM analysis |
| **Node Backend** | Express.js, MongoDB | 5000 | Proxy to FastAPI, MongoDB persistence |
| **React Frontend** | React + Tailwind | 5173 | Upload form + project list UI |

## Quick Start

### 1. FastAPI Backend

```bash
cd ideahub-backend
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000
```

Access Swagger UI at: http://127.0.0.1:8000/docs

### 2. Node Backend (in a new terminal)

```bash
cd ideahub-node-backend
npm install  # (already done)
# Create .env from .env.example and add your values
npm run dev
# Or:
node server.js
```

Server runs at: http://127.0.0.1:5000

### 3. React Frontend (in a new terminal)

```bash
cd ideahub-frontend
npm install  # (already done)
npm run dev
```

Frontend runs at: http://localhost:5173

## Workflow

1. Open React frontend in browser (http://localhost:5173)
2. Select a PDF report file and click "Upload Project PDF"
3. Frontend submits to Node backend `/upload-project` endpoint
4. Node backend forwards PDF to FastAPI `/api/v1/upload-project`
5. FastAPI extracts text, sends to Gemini LLM, returns structured JSON
6. Node backend normalizes response and saves to MongoDB
7. Frontend receives confirmation and auto-refreshes project list
8. All saved projects appear in the "Saved Projects" section

## Environment Setup

### ideahub-backend/.env
```
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
```

### ideahub-node-backend/.env
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ideahub
FASTAPI_BASE_URL=http://127.0.0.1:8000
```

### ideahub-frontend/.env (optional, defaults to 127.0.0.1:5000)
```
VITE_API_BASE_URL=http://127.0.0.1:5000
```

## API Endpoints

### Node Backend

- **POST /upload-project** — Upload PDF, extract info, save to DB
  - Form-data field: `file`
  - Returns: `{ message, record_id, project_info }`

- **GET /projects** — Fetch all saved projects
  - Returns: `{ count, projects: [...] }`

- **GET /health** — Health check
  - Returns: `{ status: "ok", message: "..." }`

## Database

MongoDB collections:
- `projectextractions` — stores file metadata, extracted project info, and raw LLM response

## Tech Stack

- **Frontend:** React 19, Tailwind CSS 3, Vite, Fetch API
- **Node Backend:** Express.js, Multer (file upload), Mongoose (MongoDB ODM), Axios
- **Python Backend:** FastAPI, pdfplumber, google-generativeai
- **Database:** MongoDB (local)
- **LLM:** Google Gemini

## Notes

- Keep all three servers running in separate terminals for local development.
- Frontend and Node backend can run on the same machine without CORS issues (CORS enabled on Node).
- MongoDB must be running locally on default port 27017.
- PDF file size limit: 10MB (Node backend).
