# IdeaHub Frontend Refactoring - Architecture Update

## Overview

The IdeaHub frontend has been refactored from a monolithic single-page React application to a modular, multi-page application with proper component separation and routing.

## Key Changes

### 1. **Routing Implementation**
- ✅ Installed `react-router-dom` for client-side routing
- ✅ Implemented three main routes:
  - `/` - Home page with project list
  - `/upload` - Dedicated upload page
  - `/project/:id` - Individual project details page

### 2. **Component Architecture**

New folder structure created:

```
src/
├── components/
│   ├── Header/
│   │   └── Header.jsx              # Navigation bar with upload button
│   ├── SearchBar/
│   │   └── SearchBar.jsx           # Search & filter functionality
│   ├── ProjectCard/
│   │   └── ProjectCard.jsx         # Reusable project card component
│   └── TagGraph/
│       └── TagGraph.jsx            # Technology tag cloud
│
├── pages/
│   ├── HomePage/
│   │   └── HomePage.jsx            # Main projects list view
│   ├── UploadPage/
│   │   └── UploadPage.jsx          # PDF upload form page
│   └── ProjectDetailsPage/
│       └── ProjectDetailsPage.jsx  # Full project details view
│
├── App.jsx                         # Main router component
├── main.jsx
└── index.css
```

### 3. **Component Descriptions**

#### **Header.jsx**
- Navigation bar (sticky/fixed)
- Logo and branding
- "Upload Project" button that links to `/upload`
- Clickable logo links back to home

#### **SearchBar.jsx**
- Reusable search and filter component
- Search input with clear functionality
- Active filter badges with remove tooltips
- "Clear all" button for resetting filters
- Mobile responsive

#### **TagGraph.jsx**
- Technology cloud visualization
- Top 25 tags with dynamic sizing
- Click to filter by tag
- Visual indication of selected tags

#### **ProjectCard.jsx**
- Displays project summary with:
  - Title, date, and filename
  - Abstract preview
  - Domain/technology preview tags
  - "View Details" button
  - Expandable section for full details
  - Similar projects section

#### **HomePage.jsx**
- Main landing page
- Displays all projects in a responsive grid
- Search and filter functionality
- Project refresh button
- Empty state handling

#### **UploadPage.jsx**
- Dedicated PDF upload form
- Drag-and-drop file input (visual)
- File info display
- Error/success toast messages
- Auto-redirect to home after successful upload
- Info cards about the platform features

#### **ProjectDetailsPage.jsx**
- Full project information display
- Sections for:
  - Title, date, domain, filename
  - Abstract
  - Problem statement
  - Methods & approach
  - Technologies & algorithms (clickable for filtering)
  - Datasets & keywords (clickable for filtering)
  - GitHub repository link
  - Similar projects recommendations
- Back to projects button

#### **App.jsx**
- Main router component
- Sets up BrowserRouter
- Renders Header on all pages
- Displays appropriate page based on current route

## Backend Updates

### New Endpoint Added

**GET `/projects/:id`** - Fetch a single project by ID

**Controller:** `getProjectById()` in `projectController.js`
**Response:**
```json
{
  "project": {
    "_id": "...",
    "file_name": "...",
    "fastapi_url": "...",
    "project_info": { ... },
    "raw_response": { ... },
    "embedding": [ ... ],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

### Existing Endpoints (Already Implemented)

- `POST /upload-project` - Upload and extract project
- `GET /projects` - Get all projects
- `GET /similar-projects/:id` - Get similar projects

## User Flow

### Upload Workflow
1. User clicks "📤 Upload Project" in header
2. Navigates to `/upload` page
3. Selects PDF and uploads
4. Success message displayed with auto-redirect
5. User redirected to home page after 2 seconds
6. New project appears in the project list

### Browse/Search Workflow
1. User lands on homepage (`/`)
2. Sees technology cloud and project grid
3. Can:
   - Search by title, keywords, technology
   - Click tags in cloud to filter
   - View project previews
4. Expand cards to see more details within the grid

### Project Details Workflow
1. User clicks "👁️ View Details" on any project card
2. Navigates to `/project/:id` page
3. Sees full project information
4. Can click tags/technologies to explore related projects
5. Views similar projects at the bottom
6. Clicks "Back to Projects" to return home

## Technical Benefits

✅ **Component Reusability** - Shared components (SearchBar, ProjectCard) can be used across pages
✅ **Separation of Concerns** - Each page has its own logic and UI
✅ **Easier Maintenance** - Code is organized in logical folders
✅ **Better Performance** - Only relevant components load on each route
✅ **Scalability** - Easy to add new pages or components
✅ **Improved UX** - Dedicated upload page reduces clutter on home
✅ **Route-based Navigation** - Users can bookmark and share direct links

## Dependencies

```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^6.0.0",  // ← NEW
  "vite": "^5.0.0",
  "tailwindcss": "^3.0.0"
}
```

## Running the Application

### Frontend
```bash
cd ideahub-frontend
npm install
npm run dev
```

### Node Backend
```bash
cd ideahub-node-backend
npm install
npm start
```

### Python Backend
```bash
cd ideahub-backend
python -m venv venv
source venv/Scripts/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

## Environment Variables

Frontend (`.env`):
```
VITE_API_BASE_URL=http://127.0.0.1:5000
```

Node Backend (`.env`):
```
FASTAPI_BASE_URL=http://127.0.0.1:8000
MONGODB_URI=mongodb://localhost:27017/ideahub
PORT=5000
```

Python Backend (`.env`):
```
GOOGLE_API_KEY=your_gemini_api_key
```

## Future Enhancements

- Add project edit/delete functionality
- Implement user accounts & authentication
- Add bookmarking/favorites feature
- Export projects as PDF or JSON
- Real-time collaboration features
- Advanced filtering and sorting options
- Project categories and custom tagging
- Analytics dashboard

---

**Refactoring Date:** March 13, 2026  
**Frontend Version:** 2.0 (Modular Architecture)  
**Status:** ✅ Complete
