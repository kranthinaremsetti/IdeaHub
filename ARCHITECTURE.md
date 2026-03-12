# IdeaHub Architecture Diagram

## Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        IdeaHub Frontend (React + Router)                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                      Header Component (Sticky)                  │   │
│  │  [ Logo ] [ IdeaHub ] [ 📤 Upload Project Button ]        │   │
│  └──────────────────────────┬──────────────────────────────────────┘   │
│                             │                                           │
│      ┌──────────────────────┼──────────────────────┐                   │
│      │                      │                      │                   │
│      ▼                      ▼                      ▼                   │
│  ┌──────────┐           ┌──────────┐          ┌──────────┐             │
│  │ HomePage │           │UploadPage│          │ProjectDetail          │
│  │  Route: /│           │Route:/up │          │Route:/pro │           │
│  │          │           │ load     │          │ject/:id   │           │
│  └──────────┘           └──────────┘          └──────────┘             │
│      │                      │                      │                   │
│      ├─ SearchBar           ├─ Upload Form         ├─ Back Button       │
│      ├─ TagGraph            ├─ File Input          ├─ Full Project Info │
│      ├─ ProjectCard Grid    ├─ Success Toast       ├─ All Tags          │
│      └─ No Project Message  └─ Auto Redirect       └─ Similar Projects  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
         │                      │                           │
         │ API Calls (Fetch)    │ API Calls (Fetch)        │
         ▼                      ▼                           ▼
┌────────────────────────────────────────────────────────────────────┐
│                  Node.js Backend (Express.js)                      │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  POST   /upload-project  ──► Process ──► FastAPI ──► MongoDB     │
│                                                                    │
│  GET    /projects        ──► Query MongoDB ──► Return all         │
│                                                                    │
│  GET    /projects/:id    ──► Query MongoDB ──► Return one         │
│         (⭐ NEW)                                                    │
│                                                                    │
│  GET    /similar-projects/:id  ──► Cosine Similarity ──► Results  │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────────────────┐
│                MongoDB Database                                    │
├────────────────────────────────────────────────────────────────────┤
│  Collection: projectextractions                                    │
│  ├─ _id                  (ObjectId)                               │
│  ├─ file_name            (String)                                 │
│  ├─ project_info         (Object)                                 │
│  │  ├─ project_title                                             │
│  │  ├─ abstract                                                  │
│  │  ├─ problem_statement                                         │
│  │  ├─ methods_approach                                          │
│  │  ├─ technologies_used (Array)                                 │
│  │  ├─ algorithms_models (Array)                                 │
│  │  ├─ datasets_used     (Array)                                 │
│  │  ├─ project_domain    (String)                                │
│  │  ├─ keywords          (Array)                                 │
│  │  └─ github_repo       (String)                                │
│  ├─ embedding           (Array of floats for similarity)          │
│  ├─ created_at          (Date)                                    │
│  └─ updated_at          (Date)                                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App (Router)
│
├── Header (All Routes)
│   └── Links: "/" and "/upload"
│
└── Routes
    ├── Route "/" → HomePage
    │   ├── SearchBar
    │   ├── TagGraph
    │   └── ProjectCard[] (Grid)
    │       └── (Each card can expand or navigate)
    │
    ├── Route "/upload" → UploadPage
    │   ├── FileInput
    │   ├── SubmitButton
    │   └── ResultToast
    │
    └── Route "/project/:id" → ProjectDetailsPage
        ├── BackButton
        ├── ProjectInfo
        ├── SimilarProjects
        │   └── ProjectCard (smaller)
        └── AllTags
```

## Data Flow

### Upload Flow
```
User Input (PDF)
     │
     ▼
UploadPage Form
     │
     ├─ Validation
     │
     ▼
POST /upload-project (Node Backend)
     │
     ├─ Forward to FastAPI
     │
     ▼
FastAPI Backend
     │
     ├─ Extract text (pdfplumber)
     ├─ Send to Gemini LLM
     ├─ Generate embedding
     │
     ▼
Return structured JSON
     │
     ▼
Node Backend saves to MongoDB
     │
     ▼
Return success to Frontend
     │
     ▼
Frontend shows toast
     │
     ▼
Auto-redirect to HomePage (2 seconds)
```

### Search/Filter Flow
```
HomePage Loads
     │
     ├─ GET /projects → Load all projects
     │
     ├─ GET /similar-projects/:id → (for each project)
     │
     ▼
Display in SearchBar + TagGraph + ProjectCard Grid
     │
User Interaction:
├─ Types in SearchBar → Filter projects locally
├─ Clicks tag → Add to selectedTags
├─ Clicks project card → Expand or navigate
│
▼
Display filtered results in real-time
```

### Project Details Flow
```
User clicks "View Details"
     │
     ├─ Navigate to /project/:id
     │
     ▼
ProjectDetailsPage loads
     │
     ├─ GET /projects/:id → Fetch full project
     │
     ├─ GET /similar-projects/:id → Fetch related projects
     │
     ▼
Display complete project information
     │
User can:
├─ Click tags to filter (local)
├─ Click similar project → Navigate to /project/:similar_id
├─ Click "Back" → Return to HomePage
```

## State Management

### HomePage
```
- projects: []                  (from API)
- filteredProjects: []          (computed from search + tags)
- selectedTags: Set()           (user-selected tags)
- searchQuery: ""               (user's search input)
- isLoadingProjects: false      (API status)
- expandedProject: null         (which card is expanded)
```

### UploadPage
```
- file: null                    (selected file)
- isUploading: false            (upload in progress)
- message: ""                   (success message)
- error: ""                     (error message)
```

### ProjectDetailsPage
```
- project: null                 (fetched project data)
- isLoading: true               (initial load)
- error: ""                     (fetch error)
- selectedTags: Set()           (for tag highlighting)
```

## API Endpoints Summary

| Method | Endpoint              | Frontend Route | Purpose |
|--------|----------------------|----------------|---------|
| POST   | /upload-project      | /upload        | Upload and process PDF |
| GET    | /projects            | /               | Fetch all projects |
| GET    | /projects/:id        | /project/:id    | Fetch single project ⭐ |
| GET    | /similar-projects/:id| /project/:id    | Find similar projects |

## Browser Routing

| Route           | Component              | Features |
|-----------------|------------------------|----------|
| `/`             | HomePage               | Search, browse, filter |
| `/upload`       | UploadPage             | Upload form, success toast |
| `/project/:id`  | ProjectDetailsPage     | Full details, similar projects |

## Performance Optimizations

- ✅ Component lazy loading with React Router
- ✅ Local filtering (no server calls for search/tags)
- ✅ Memoization on ProjectCard components
- ✅ Efficient state updates
- ✅ Minimal API calls (only on page load)

---

**Architecture Version:** 2.0 (Modular)  
**Last Updated:** March 13, 2026
