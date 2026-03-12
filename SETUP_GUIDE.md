# IdeaHub Setup & Deployment Guide

## System Requirements

- **Node.js** (v16+) - for frontend and backend
- **Python** (v3.9+) - for FastAPI backend
- **MongoDB** - for database (local or Atlas)
- **Google Gemini API Key** - for LLM processing

## Quick Start (Development)

### 1. Environment Setup

#### Python Backend (FastAPI)
```bash
cd ideahub-backend
python -m venv venv

# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create `.env` file in `ideahub-backend/`:
```
GOOGLE_API_KEY=your_gemini_api_key_here
```

#### Node Backend (Express)
```bash
cd ideahub-node-backend
npm install
```

Create `.env` file in `ideahub-node-backend/`:
```
FASTAPI_BASE_URL=http://127.0.0.1:8000
MONGODB_URI=mongodb://localhost:27017/ideahub
PORT=5000
NODE_ENV=development
```

#### React Frontend
```bash
cd ideahub-frontend
npm install
```

Create `.env` file in `ideahub-frontend/`:
```
VITE_API_BASE_URL=http://127.0.0.1:5000
```

### 2. Start MongoDB (Local)

```bash
# macOS:
brew services start mongodb-community

# Windows (if installed via Chocolatey):
mongod

# Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Verify connection:
```bash
mongosh
# Should connect successfully
```

### 3. Start the Backends

#### Terminal 1: FastAPI Backend
```bash
cd ideahub-backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Expected output:
```
Uvicorn running on http://127.0.0.1:8000
Swagger UI available at http://127.0.0.1:8000/docs
```

#### Terminal 2: Node Backend
```bash
cd ideahub-node-backend
npm start
```

Expected output:
```
✓ MongoDB connected
✓ Server running on port 5000
```

### 4. Start the Frontend

#### Terminal 3: React Frontend
```bash
cd ideahub-frontend
npm run dev
```

Expected output:
```
  VITE v... ready in ... ms

  ➜  Local:   http://localhost:5173/
  ➜  Press h to show help
```

### 5. Access the Application

- **Frontend**: http://localhost:5173
- **Node Backend API**: http://localhost:5000
- **FastAPI Docs**: http://localhost:8000/docs
- **MongoDB**: mongodb://localhost:27017

---

## Directory Structure

```
IdeaHub/
├── ideahub-backend/                    # FastAPI (Python)
│   ├── main.py
│   ├── routers/
│   │   └── project_router.py
│   ├── services/
│   │   ├── pdf_service.py
│   │   ├── llm_service.py
│   │   ├── embedding_service.py
│   │   └── idea_analysis_service.py
│   ├── schemas/
│   │   └── project_schema.py
│   ├── config/
│   │   └── settings.py
│   ├── uploads/                        # PDF storage
│   ├── requirements.txt
│   ├── .env
│   └── README.md
│
├── ideahub-node-backend/              # Express.js (Node)
│   ├── server.js
│   ├── src/
│   │   ├── routes/
│   │   │   └── projectRoutes.js       # ⭐ Updated with new endpoint
│   │   ├── controllers/
│   │   │   └── projectController.js   # ⭐ New getProjectById function
│   │   ├── models/
│   │   │   └── ProjectExtraction.js
│   │   ├── services/
│   │   │   └── fastapiService.js
│   │   └── config/
│   │       └── db.js
│   ├── uploads/                        # Temp file storage
│   ├── .env
│   ├── package.json
│   └── README.md
│
├── ideahub-frontend/                   # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header/
│   │   │   │   └── Header.jsx
│   │   │   ├── SearchBar/
│   │   │   │   └── SearchBar.jsx
│   │   │   ├── ProjectCard/
│   │   │   │   └── ProjectCard.jsx
│   │   │   └── TagGraph/
│   │   │       └── TagGraph.jsx
│   │   ├── pages/
│   │   │   ├── HomePage/
│   │   │   │   └── HomePage.jsx
│   │   │   ├── UploadPage/
│   │   │   │   └── UploadPage.jsx
│   │   │   └── ProjectDetailsPage/
│   │   │       └── ProjectDetailsPage.jsx
│   │   ├── App.jsx                    # ⭐ Router setup
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── README.md
│
├── REFACTORING_SUMMARY.md              # ⭐ New documentation
├── ARCHITECTURE.md                     # ⭐ New documentation
└── README_FULL_STACK.md
```

---

## Testing the Application

### 1. Test Health Endpoints

```bash
# FastAPI health
curl http://127.0.0.1:8000/

# Node Backend health
curl http://127.0.0.1:5000/health
```

### 2. Test Upload Flow

```bash
curl -X POST http://127.0.0.1:5000/upload-project \
  -F "file=@/path/to/project_report.pdf"
```

### 3. Test Get Projects

```bash
# Get all projects
curl http://127.0.0.1:5000/projects

# Get single project (replace with actual ID)
curl http://127.0.0.1:5000/projects/PROJECT_ID_HERE

# Get similar projects
curl http://127.0.0.1:5000/similar-projects/PROJECT_ID_HERE
```

### 4. Manual Frontend Testing

1. Open http://localhost:5173
2. Click "📤 Upload Project" button
3. Select a sample PDF file
4. Click "Upload Project"
5. Wait for success message and redirect
6. Verify project appears in project list
7. Click "View Details" on any project
8. Verify all project information loads
9. Click on a tag to filter back on home page

---

## Production Deployment

### Frontend (Netlify/Vercel)

```bash
cd ideahub-frontend
npm run build
# Deploy 'dist' folder
```

Environment variables:
```
VITE_API_BASE_URL=https://api.yourdomain.com
```

### Node Backend (Heroku/Railway)

```bash
# Ensure Procfile exists:
# web: npm start

# Push to Heroku:
git push heroku main
```

Environment variables:
```
FASTAPI_BASE_URL=https://fastapi.yourdomain.com
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ideahub
PORT=5000
NODE_ENV=production
```

### FastAPI Backend (Heroku/Railway)

```bash
# Ensure Procfile exists:
# web: uvicorn main:app --host 0.0.0.0 --port $PORT

git push heroku main
```

Environment variables:
```
GOOGLE_API_KEY=your_gemini_api_key
```

### MongoDB (Atlas)

1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/ideahub`
4. Add IP whitelist
5. Use connection string in `.env` files

---

## Troubleshooting

### Issue: CORS Errors
**Solution:** Ensure all servers are running and VITE_API_BASE_URL is correct

### Issue: MongoDB Connection Failed
**Solution:** 
```bash
# Check if MongoDB is running
mongosh
# Should connect without errors
```

### Issue: File Upload Fails
**Solution:**
- Ensure Node backend is running
- Check FastAPI is accessible at configured URL
- Check /uploads directory exists and is writable

### Issue: Search/Tags Not Working
**Solution:**
- Ensure projects are loaded (check browser console)
- Verify API responses contain project_info with tags

### Issue: PDF Parsing Fails
**Solution:**
- Try a different PDF file
- Ensure PDF is not corrupted
- Check FastAPI logs for detailed errors
- Visit http://127.0.0.1:8000/docs for API testing

---

## Development Tips

### Hot Reload
All three applications support hot reload:
- Frontend: Automatic with Vite
- Node Backend: Use `nodemon` for auto-restart
- FastAPI: `--reload` flag enables auto-reload

### Database Inspection

```bash
# Connect to MongoDB
mongosh

# View databases
show databases

# Use ideahub database
use ideahub

# View collections
show collections

# View all projects
db.projectextractions.find()

# View single project
db.projectextractions.findOne({ _id: ObjectId("...") })
```

### API Testing with Swagger

- **FastAPI**: http://127.0.0.1:8000/docs
- Try endpoints directly in the Swagger UI
- Useful for testing before frontend integration

### Browser DevTools

1. Open DevTools (F12)
2. Check Console for JavaScript errors
3. Check Network tab for API calls
4. Monitor response status codes and payloads
5. Check Application > Local Storage for any cache issues

---

## Git Workflow

```bash
# Stage refactored code
git add .

# Commit with descriptive message
git commit -m "feat: refactor frontend to modular architecture with routing"

# Push to repository
git push origin main
```

---

## Performance Optimization Checklist

- [ ] Frontend: Enable code splitting
- [ ] Frontend: Implement lazy loading for routes
- [ ] Node Backend: Add caching layer
- [ ] FastAPI: Cache embeddings
- [ ] MongoDB: Create indexes on frequently queried fields
- [ ] Setup CDN for static assets
- [ ] Enable gzip compression
- [ ] Monitor API response times

---

## Security Checklist

- [ ] Validate file uploads (size, type)
- [ ] Sanitize user input
- [ ] Use HTTPS in production
- [ ] Secure API keys in environment variables
- [ ] Implement rate limiting
- [ ] Add CORS restrictions in production
- [ ] Use MongoDB authentication
- [ ] Add request validation schemas

---

**Last Updated:** March 13, 2026  
**Setup Version:** 2.0
