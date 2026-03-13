# IdeaHub - Complete Project Documentation

A full-stack web application for uploading project reports (PDF/Markdown), extracting structured information using AI (Google Gemini), classifying projects by domain, and discovering related projects through similarity analysis.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [System Requirements](#system-requirements)
- [Quick Start Guide](#quick-start-guide)
  - [Python Backend Setup](#1-python-backend-setup)
  - [Node Backend Setup](#2-node-backend-setup)
  - [React Frontend Setup](#3-react-frontend-setup)
  - [Database Setup](#4-database-setup)
  - [Running Everything](#5-running-everything)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Features](#features)
- [Workflow](#workflow)
- [Database Schema](#database-schema)
- [Component Hierarchy](#component-hierarchy)
- [Troubleshooting](#troubleshooting)
- [Known Issues](#known-issues)

---

## Overview

IdeaHub is a project discovery and analysis platform that:
- **Accepts** project reports in PDF or Markdown format
- **Extracts** structured information (title, abstract, technologies, datasets, etc.)
- **Analyzes** projects using Google Gemini LLM
- **Classifies** projects into 4 domains: AI, ML, Quantum Computing, Full Stack Development
- **Discovers** similar projects using cosine similarity on embeddings
- **Displays** projects in an interactive React dashboard with filtering and search

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19.2.4, Vite 8.0.0, Tailwind CSS 3, React Router v7 | User interface & navigation |
| **Node Backend** | Express.js, Mongoose 8.10.1, Multer | API proxy, database ORM, file handling |
| **Python Backend** | FastAPI 0.115.0, pdfplumber 0.11.4 | PDF extraction, project info parsing |
| **LLM** | Google Gemini 2.0 Flash | Structured data extraction & analysis |
| **Database** | MongoDB 8.10+ | Project metadata & embeddings storage |

---

## Architecture

### Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        IdeaHub Frontend (React + Router)                │
│                              Port: 5173                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Header Component (Sticky)                  │   │
│  │  [ Logo ] [ IdeaHub ] [ 📤 Upload Project ]                    │   │
│  └──────────────────────────┬──────────────────────────────────────┘   │
│                             │                                           │
│      ┌──────────────────────┼──────────────────────┐                   │
│      │                      │                      │                   │
│      ▼                      ▼                      ▼                   │
│  ┌──────────┐           ┌──────────┐          ┌──────────────┐         │
│  │ HomePage │           │UploadPage│          │ProjectDetails│         │
│  │  Route: /│           │Route:/up │          │Route:/pro    │         │
│  │          │           │load      │          │ject/:id      │         │
│  └──────────┘           └──────────┘          └──────────────┘         │
│      │                      │                      │                   │
│      ├─ SearchBar           ├─ Upload Form         ├─ Back Button       │
│      ├─ TagGraph            ├─ File Input          ├─ Full Project Info │
│      ├─ ProjectCard Grid    ├─ Success Toast       ├─ Limitations       │
│      └─ Filters             └─ Auto Redirect       ├─ Future Improve.   │
│                                                    └─ Similar Projects  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
         │                      │                           │
         │ API Calls (Fetch)    │ API Calls (Fetch)        │
         ▼                      ▼                           ▼
┌────────────────────────────────────────────────────────────────────┐
│                  Node.js Backend (Express.js)                      │
│                           Port: 5000                               │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  POST   /upload-project          → FastAPI → MongoDB             │
│  GET    /projects                → Query MongoDB                 │
│  GET    /projects/:id            → Single project detail         │
│  GET    /similar-projects/:id    → Cosine similarity analysis    │
│  GET    /health                  → Health check                  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
         │
         ▼
    ┌─────────────────────────────────┐
    │    FastAPI Python Backend        │
    │         Port: 8000              │
    ├─────────────────────────────────┤
    │  POST /api/v1/upload-project   │
    │   • Extract PDF/Markdown text  │
    │   • Call Gemini LLM (1st pass) │
    │   • Parse structured info      │
    │   • Call Gemini LLM (2nd pass) │
    │   • Generate analysis          │
    │   • Return JSON to Node        │
    └─────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────────┐
│                MongoDB Database                                    │
│              (projectextractions collection)                       │
├────────────────────────────────────────────────────────────────────┤
│  ├─ _id, file_name, created_at, updated_at                        │
│  ├─ project_info (full extracted data)                            │
│  │  ├─ project_title, abstract, problem_statement                │
│  │  ├─ methods_approach, technologies_used[], algorithms_models[]│
│  │  ├─ datasets_used[], keywords[], project_domain               │
│  │  ├─ limitations[], future_improvements[]                       │
│  │  └─ github_repo                                                │
│  ├─ embedding (1536-dim vector for similarity)                    │
│  └─ raw_response (original Gemini response)                       │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## System Requirements

- **Node.js** v16+ (for frontend and Node backend)
- **Python** v3.9+ (for FastAPI backend)
- **MongoDB** v5.0+ (local or Atlas cloud)
- **Google Gemini API Key** (free tier available)
- **4GB RAM** minimum; **2GB free disk** for uploads

---

## Quick Start Guide

### 1. Python Backend Setup

```bash
# Navigate to backend
cd ideahub-backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# OR macOS/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Node Backend Setup

```bash
cd ideahub-node-backend
npm install
```

### 3. React Frontend Setup

```bash
cd ideahub-frontend
npm install
```

### 4. Database Setup

**Option A: Local MongoDB**

```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Windows (if installed via Chocolatey)
mongod

# Docker (recommended)
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Verify connection:
```bash
mongosh   # Should connect without errors
```

**Option B: MongoDB Atlas (Cloud)**

Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and get your connection string.

### 5. Running Everything

**Terminal 1: FastAPI Backend**

```bash
cd ideahub-backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Expected output:
```
Uvicorn running on http://127.0.0.1:8000
Swagger UI: http://127.0.0.1:8000/docs
```

**Terminal 2: Node Backend**

```bash
cd ideahub-node-backend
npm run dev
```

Expected output:
```
✓ MongoDB connected
✓ Server running on http://127.0.0.1:5000
```

**Terminal 3: React Frontend**

```bash
cd ideahub-frontend
npm run dev
```

Expected output:
```
  Local:   http://127.0.0.1:5173/
  Press q to quit
```

Open your browser to **http://127.0.0.1:5173**

---

## Environment Variables

### `ideahub-backend/.env`
```
GOOGLE_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
UPLOAD_DIR=./uploads
```

Get your free Gemini API key: [ai.google.dev](https://ai.google.dev)

### `ideahub-node-backend/.env`
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/ideahub
FASTAPI_BASE_URL=http://127.0.0.1:8000
NODE_ENV=development
```

For MongoDB Atlas, use:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ideahub?retryWrites=true&w=majority
```

### `ideahub-frontend/.env`
```
VITE_API_BASE_URL=http://127.0.0.1:5000
```

---

## API Endpoints

### Node Backend (Primary API)

#### Upload Project
```
POST /upload-project
Content-Type: multipart/form-data

Body:
  file: <PDF or Markdown file>

Response:
  200 OK
  {
    "message": "Project uploaded successfully",
    "record_id": "65f2a1b2c3d4e5f6g7h8i9j0",
    "project_info": {
      "project_title": "...",
      "abstract": "...",
      ...
    }
  }

Error:
  400 Bad Request
  {
    "error": "No file provided",
    "status": 400
  }
```

#### Get All Projects
```
GET /projects

Response:
  200 OK
  {
    "count": 4,
    "projects": [
      {
        "_id": "65f2a1b2c3d4e5f6g7h8i9j0",
        "file_name": "AI_Research_2024.pdf",
        "project_info": { ... },
        "created_at": "2024-03-13T10:30:00Z",
        "embedding": [...]
      },
      ...
    ]
  }
```

#### Get Project by ID
```
GET /projects/:id

Response:
  200 OK
  {
    "project": {
      "_id": "65f2a1b2c3d4e5f6g7h8i9j0",
      "file_name": "AI_Research_2024.pdf",
      "project_info": {
        "project_title": "Deep Learning for Medical Imaging",
        "abstract": "...",
        "problem_statement": "...",
        "methods_approach": "...",
        "technologies_used": ["Python", "TensorFlow", "PyTorch"],
        "algorithms_models": ["CNN", "ResNet"],
        "datasets_used": ["ImageNet", "CIFAR-10"],
        "keywords": ["deep-learning", "medical-imaging", "ai"],
        "project_domain": "AI",
        "limitations": ["Limited dataset size", "GPU memory constraints"],
        "future_improvements": ["Add attention mechanisms", "Implement federated learning"],
        "github_repo": "https://github.com/..."
      },
      "created_at": "2024-03-13T10:30:00Z"
    }
  }

Error:
  404 Not Found
  {
    "error": "Project not found",
    "status": 404
  }
```

#### Get Similar Projects
```
GET /similar-projects/:id

Response:
  200 OK
  {
    "similar_projects": [
      {
        "_id": "65f2a1b2c3d4e5f7g7h8i9j0",
        "file_name": "ML_Classification_2024.pdf",
        "project_info": { ... },
        "similarity_score": 0.87
      },
      {
        "similarity_score": 0.79,
        ...
      }
    ]
  }
```

#### Health Check
```
GET /health

Response:
  200 OK
  {
    "status": "ok",
    "message": "Node backend and MongoDB are healthy"
  }
```

---

## Project Structure

```
IdeaHub/
├── README.md                          # Comprehensive documentation (THIS FILE)
├── .git/                              # Git repository
│
├── ideahub-backend/                   # FastAPI Python Backend
│   ├── .venv/                         # Virtual environment
│   ├── main.py                        # Entry point
│   ├── requirements.txt               # Python dependencies
│   ├── .env                           # Environment variables (not in Git)
│   ├── config/
│   │   └── settings.py                # Settings singleton with Pydantic
│   ├── routers/
│   │   └── project_router.py          # POST /api/v1/upload-project endpoint
│   ├── schemas/
│   │   └── project_schema.py          # Pydantic models & domain enum
│   ├── services/
│   │   ├── pdf_service.py             # PDF & Markdown text extraction
│   │   ├── llm_service.py             # Gemini LLM extraction (1st call)
│   │   └── idea_analysis_service.py   # Gemini analysis (2nd call: limitations, improvements)
│   ├── uploads/                       # Uploaded PDF files (temp storage)
│   └── utils/
│       └── embedding.py               # Vector embedding generation
│
├── ideahub-node-backend/              # Express.js Node Backend
│   ├── node_modules/                  # Dependencies
│   ├── server.js                      # Entry point
│   ├── package.json                   # Dependencies & scripts
│   ├── .env                           # Environment variables (not in Git)
│   ├── src/
│   │   ├── models/
│   │   │   └── ProjectExtraction.js   # Mongoose schema (includes limitations & future_improvements)
│   │   ├── controllers/
│   │   │   └── projectController.js   # Route handlers (with fallback logic for legacy records)
│   │   └── routes/
│   │       └── projectRoutes.js       # Express routes
│   └── config/
│       └── database.js                # MongoDB connection
│
├── ideahub-frontend/                  # React + Vite Frontend
│   ├── node_modules/                  # Dependencies
│   ├── public/                        # Static assets
│   ├── src/
│   │   ├── main.jsx                   # React entry point
│   │   ├── App.jsx                    # Router configuration
│   │   ├── components/
│   │   │   ├── Header/
│   │   │   │   └── Header.jsx         # Navigation header
│   │   │   ├── SearchBar/
│   │   │   │   └── SearchBar.jsx      # Search & filter component
│   │   │   ├── TagGraph/
│   │   │   │   └── TagGraph.jsx       # Technology cloud visualization
│   │   │   └── ProjectCard/
│   │   │       └── ProjectCard.jsx    # Reusable project card
│   │   ├── pages/
│   │   │   ├── HomePage/
│   │   │   │   └── HomePage.jsx       # Main listing page (/)
│   │   │   ├── UploadPage/
│   │   │   │   └── UploadPage.jsx     # File upload page (/upload)
│   │   │   └── ProjectDetailsPage/
│   │   │       └── ProjectDetailsPage.jsx  # Full project view (/project/:id)
│   │   └── index.css                  # Global styles (Tailwind)
│   ├── .env                           # Environment variables
│   ├── vite.config.js                 # Vite configuration
│   └── package.json                   # Dependencies & scripts
│
└── ideahub-backend/uploads/           # Uploaded PDFs (auto-generated)
    ├── uuid_filename1.pdf
    ├── uuid_filename2.markdown
    └── ...
```

---

## Features

### ✅ Core Functionality
- **PDF & Markdown Upload**: Accept project reports in multiple formats
- **AI-Powered Extraction**: Extract 12+ structured fields using Google Gemini LLM
- **Domain Classification**: Auto-classify into AI, ML, Quantum Computing, or Full Stack
- **Project Analysis**: Generate limitations and future improvements via LLM
- **Similarity Search**: Find related projects using cosine similarity on embeddings
- **Full-Text Search**: Search projects by title, abstract, keywords
- **Dynamic Filtering**: Filter by domain, technologies, datasets, keywords
- **Tag Cloud**: Interactive technology cloud with click-to-filter
- **Responsive UI**: Mobile-friendly design with Tailwind CSS
- **Persistent Storage**: All data saved to MongoDB with embeddings

### 🔧 Extracted Fields
Each project stores:
- **Metadata**: Title, abstract, keywords, domain
- **Technical Details**: Technologies, algorithms, datasets, GitHub repo
- **Analysis**: Problem statement, methods/approach, limitations, future improvements

### 📊 Database Features
- MongoDB ODM via Mongoose
- Automatic timestamp tracking (created_at, updated_at)
- Vector embeddings for similarity search (1536 dimensions)
- Raw LLM response storage for audit trail
- Fallback logic for legacy records (auto-maps from raw_response)

---

## Workflow

### Upload & Processing Flow

1. **User Action** → Opens React frontend (http://127.0.0.1:5173)
2. **Upload File** → Selects PDF/Markdown and clicks "Upload Project"
3. **Frontend** → Sends multipart form-data to Node backend `/upload-project`
4. **Node Backend** → Receives file, forwards to FastAPI `/api/v1/upload-project`
5. **FastAPI** → Extracts text from PDF/Markdown using `pdfplumber` or regex
6. **First Gemini Call** → Parses structured info (title, abstract, technologies, domain, etc.)
7. **Second Gemini Call** → Analyzes limitations & future improvements
8. **Merge & Embed** → Combines both responses, generates vector embedding
9. **Return to Node** → FastAPI returns full `ProjectInfo` JSON
10. **Save to DB** → Node backend persists to MongoDB with embedding
11. **Response to Frontend** → Returns confirmation with record ID
12. **Auto-Redirect** → Frontend redirects to homepage
13. **Display** → Page refreshes and shows new project in grid

### Discovery Flow

1. **Browse Projects** → HomePage lists all projects with search/filter
2. **Click Project** → Routes to `/project/:id` for full details
3. **View Similar** → Sidebar shows 3-5 most similar projects
4. **Similarity** → Computed via cosine distance on embeddings
5. **Navigate** → Click similar project to view its details

---

## Database Schema

### ProjectExtractions Collection

```javascript
{
  _id: ObjectId,
  
  // File metadata
  file_name: String,
  created_at: Date,
  updated_at: Date,
  
  // Extracted and analyzed project information
  project_info: {
    project_title: String,
    abstract: String,
    problem_statement: String,
    methods_approach: String,
    technologies_used: [String],
    algorithms_models: [String],
    datasets_used: [String],
    keywords: [String],
    project_domain: String,  // Enum: AI | ML | Quantum | Full Stack
    github_repo: String,
    
    // Analysis fields (added via 2nd Gemini call)
    limitations: [String],
    future_improvements: [String]
  },
  
  // Vector embedding for similarity search
  embedding: [Number],  // 1536-dimensional array
  
  // Original LLM response (audit trail & fallback source)
  raw_response: {
    extracted_info: { ... },  // Raw Gemini output
    ...
  }
}
```

---

## Component Hierarchy

```
App (BrowserRouter)
│
├── Header (All Routes)
│   └── Links: "/" and "/upload"
│
└── Routes
    ├── Route "/" → HomePage
    │   ├── SearchBar
    │   │   ├── Search input
    │   │   ├── Filter badges
    │   │   └── Clear buttons
    │   ├── TagGraph
    │   │   └── Top 25 technologies (clickable)
    │   └── ProjectCard[] (Grid)
    │       ├── Project summary
    │       ├── Tech preview (2 tags)
    │       └── "View Details" button
    │
    ├── Route "/upload" → UploadPage
    │   ├── File input
    │   ├── Upload button
    │   ├── Success/Error toast
    │   └── Info cards
    │
    └── Route "/project/:id" → ProjectDetailsPage
        ├── Back button
        ├── Project header
        │   ├── Title, date, domain, filename
        │   └── Abstract
        ├── Details sections
        │   ├─ Problem statement
        │   ├─ Methods & approach
        │   ├─ Technologies (clickable → filter)
        │   ├─ Algorithms (clickable)
        │   ├─ Datasets (clickable)
        │   ├─ Keywords (hashtag style)
        │   ├─ Limitations (list)
        │   └─ Future improvements (list)
        ├── GitHub link
        └── Similar Projects sidebar
            └── ProjectCard (compact) per similar
```

---

## Troubleshooting

### FastAPI Backend Issues

**Error: `ModuleNotFoundError: No module named 'google'`**
```bash
# Solution: Reinstall dependencies
pip install -r requirements.txt
```

**Error: `GOOGLE_API_KEY not found in environment`**
```bash
# Solution: Create .env file with valid key
echo GOOGLE_API_KEY=your_key_here > ideahub-backend/.env
```

**Error: `Uvicorn not found`**
```bash
# Solution: Activate venv and install
source venv/bin/activate
pip install uvicorn FastAPI
```

**Error: `Port 8000 already in use`**
```bash
# Solution: Kill process on port 8000
# Windows:
netstat -ano | findstr ":8000" | findstr "LISTENING" | For /F "tokens=5" %a in ('findstr "."') do taskkill /PID %a /F
# macOS/Linux:
lsof -ti:8000 | xargs kill -9
```

### Node Backend Issues

**Error: `MongoDB connection failed`**
```bash
# Solution: ensure MongoDB is running
# Docker:
docker ps | grep mongodb  # Should show running container
# Or start it:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Error: `Cannot POST /upload-project`**
```bash
# Solution: Ensure Node backend is running on port 5000
npm run dev
# Verify: http://127.0.0.1:5000/health should return { status: "ok" }
```

**Error: `FASTAPI_BASE_URL not accessible`**
```bash
# Solution: Check FastAPI is running on port 8000
# http://127.0.0.1:8000/docs should be accessible
```

### React Frontend Issues

**Error: `Cannot GET http://127.0.0.1:5000/...`**
```bash
# Solution: Ensure Node backend is running
# Verify in browser console: http://127.0.0.1:5000/health
```

**Error: `CORS error when uploading`**
```bash
# Solution: Node backend CORS is enabled, verify Express middleware
# Check server.js line with app.use(cors());
```

**Error: `Vite port 5173 already in use`**
```bash
# Windows:
netstat -ano | findstr ":5173" | findstr "LISTENING" | For /F "tokens=5" %a in ('findstr "."') do taskkill /PID %a /F
# macOS/Linux:
lsof -ti:5173 | xargs kill -9
# Restart:
npm run dev
```

### General Debugging

**Check all services running:**
```bash
# FastAPI (port 8000)
curl http://127.0.0.1:8000/docs

# Node backend (port 5000)
curl http://127.0.0.1:5000/health

# React frontend (port 5173)
# Open http://127.0.0.1:5173 in browser

# MongoDB
mongosh
```

**View logs:**
```bash
# FastAPI: Terminal 1 shows live reload logs
# Node: Terminal 2 shows "GET /projects", "POST /upload-project", etc.
# Frontend: Browser console (F12 → Console tab)
# MongoDB: mongosh commands return query results
```

---

## Known Issues & Limitations

### Gemini API Quota
- **Issue**: `429 Resource exhausted` error after multiple uploads
- **Cause**: Gemini makes 2 API calls per upload; free tier quota is ~60 calls/day
- **Solution**: 
  - Wait for quota reset (resets daily at UTC midnight)
  - Upgrade to paid Gemini API plan
  - Implement retry logic with exponential backoff
  - Use demo data for testing (seed DB without uploads)

### Database Migrations
- **Old records** (uploaded before schema update) may not have `limitations` and `future_improvements` natively
- **Workaround**: Node controller includes fallback logic that maps from `raw_response.extracted_info`
- **Status**: All projects now display analysis fields correctly

### Frontend Error Handling
- **Issue**: If Node backend returns plain text instead of JSON, frontend shows generic error
- **Mitigation**: Added content-type header check with graceful fallback
- **Recommendation**: Always return JSON from API endpoints

### Large PDF Handling
- **Limitation**: Max file size ~10MB (Node Multer limit)
- **Workaround**: Split large PDFs or use Markdown format instead
- **Future**: Implement streaming upload for larger files

### Search Performance
- **Current**: Full-text search in memory on frontend
- **Limitation**: Slows down with 1000+ projects
- **Future**: Migrate to MongoDB full-text indexes

---

## Development Tips

### Adding New Project Fields

1. **Step 1**: Update FastAPI schema in `ideahub-backend/schemas/project_schema.py`
2. **Step 2**: Update Gemini prompt in `ideahub-backend/services/llm_service.py`
3. **Step 3**: Update Node schema in `ideahub-node-backend/src/models/ProjectExtraction.js`
4. **Step 4**: Update React display in `ideahub-frontend/src/pages/ProjectDetailsPage/ProjectDetailsPage.jsx`
5. **Step 5**: Test end-to-end upload and verify field appears

### Testing Gemini LLM Locally

```bash
# Test extraction prompt
python ideahub-backend/services/llm_service.py < sample_text.txt

# Or use interactive Python
cd ideahub-backend
source venv/bin/activate
python
>>> from config.settings import settings
>>> from services.llm_service import extract_project_info
>>> result = extract_project_info("Your project text here")
>>> print(result)
```

### Debug Mode

Set `NODE_ENV=development` in `.env` files for verbose logging:
```
# Node backend
NODE_ENV=development

# FastAPI backend
ENV=development
```

---

## Useful Commands

```bash
# Stop all processes
# Windows:
Get-Process node,python | Stop-Process -Force

# macOS/Linux:
pkill -f "node\|python"

# Clear MongoDB collection
mongosh
> db.projectextractions.deleteMany({})

# View all projects (prettified)
curl http://127.0.0.1:5000/projects | jq

# Check Gemini API quota
# https://console.cloud.google.com/projectselector2/apis/dashboard?supportedpurview=project

# Format code (if ESLint/Prettier configured)
# Frontend:
npm run format

# Backend:
black ideahub-backend/
```

---

## Support & Resources

- **FastAPI Docs**: http://127.0.0.1:8000/docs (Swagger UI)
- **MongoDB Docs**: https://docs.mongodb.com/
- **React Router**: https://reactrouter.com/
- **Gemini API**: https://ai.google.dev/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Express.js**: https://expressjs.com/
- **Mongoose**: https://mongoosejs.com/

---

## License & Attribution

Built as part of the MVGR Hackathon Project.

**Last Updated**: March 13, 2026