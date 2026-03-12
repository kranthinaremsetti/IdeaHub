# IdeaHub Quick Reference Guide

## 🚀 Start Development (3 Terminals)

### Terminal 1: FastAPI Backend
```bash
cd ideahub-backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

### Terminal 2: Node Backend  
```bash
cd ideahub-node-backend
npm start
# Runs on http://localhost:5000
```

### Terminal 3: React Frontend
```bash
cd ideahub-frontend
npm run dev
# Opens http://localhost:5173
```

---

## 📂 Key Files & What They Do

### Frontend Components

| File | Purpose | Key Props/Features |
|------|---------|-------------------|
| `Header.jsx` | Navigation bar | uploadButton, navigation |
| `SearchBar.jsx` | Search & filters | searchQuery, selectedTags |
| `TagGraph.jsx` | Tag cloud | projects, onTagClick |
| `ProjectCard.jsx` | Project preview | project, expandable |
| `HomePage.jsx` | Main page | all projects, search |
| `UploadPage.jsx` | Upload form | file input, redirect |
| `ProjectDetailsPage.jsx` | Details view | project/:id, similar |
| `App.jsx` | Router | 3 routes |

### Backend Files

| File | Endpoint | Method |
|------|----------|--------|
| `projectController.js` | `/projects` | GET |
| `projectController.js` | `/projects/:id` | GET ⭐ |
| `projectController.js` | `/upload-project` | POST |
| `projectController.js` | `/similar-projects/:id` | GET |

---

## 🔗 API Endpoints Cheat Sheet

```bash
# Get all projects
curl http://127.0.0.1:5000/projects

# Get single project
curl http://127.0.0.1:5000/projects/PROJECT_ID

# Get similar projects
curl http://127.0.0.1:5000/similar-projects/PROJECT_ID

# Upload project
curl -X POST http://127.0.0.1:5000/upload-project \
  -F "file=@your_file.pdf"
```

---

## 🎨 Component Props Reference

### ProjectCard
```javascript
<ProjectCard
  project={projectObject}
  expandedProject={expandedProjectId}
  setExpandedProject={setExpandedProjectId}
  handleTagClick={handleTagClick}
  isTagSelected={isTagSelected}
/>
```

### SearchBar
```javascript
<SearchBar
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  selectedTags={selectedTags}
  setSelectedTags={setSelectedTags}
  onTagClick={handleTagClick}
/>
```

### TagGraph
```javascript
<TagGraph
  projects={projects}
  onTagClick={handleTagClick}
  selectedTags={selectedTags}
/>
```

---

## 📊 Navigation Map

```
Home (/)
├─ Click "📤 Upload" → Upload Page (/upload)
│  └─ Upload PDF → Success → Redirect to Home
│
├─ Click Project Card → View Details (/project/:id)
│  ├─ Click Tag → Back to Home (filtered)
│  ├─ Click Similar Project → Details (/project/:id)
│  └─ Click "Back" → Home
│
└─ Click Tag Cloud → Home (filtered)
   └─ See 3 columns of filtered projects
```

---

## 🔍 Common Tasks

### Add a New Route
```javascript
// In App.jsx
<Route path="/new-page" element={<NewComponent />} />
```

### Change API Base URL
```javascript
// In .env
VITE_API_BASE_URL=http://your-new-url:5000
```

### Debug API Calls
```javascript
// Check Network tab in DevTools (F12)
// Or add console logs:
console.log("API Response:", data);
```

### Test an Endpoint
```bash
# Visit Swagger UI
http://127.0.0.1:8000/docs

# Or use curl
curl http://127.0.0.1:5000/projects | jq .
```

### View MongoDB Data
```bash
mongosh
use ideahub
db.projectextractions.find()
```

---

## 🐛 Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| CORS Error | Check all servers running on correct ports |
| API Not Found | Verify Node backend is running on :5000 |
| Upload Fails | Check FastAPI is running on :8000 |
| Projects Won't Load | Check MongoDB is running |
| Search Not Working | Ensure projects are loaded first |
| No Tags Visible | Check project has project_info with tags |

---

## 📱 Responsive Breakpoints

- **Mobile:** < 768px (1 column)
- **Tablet:** 768px - 1024px (2 columns)
- **Desktop:** > 1024px (3 columns)

---

## 💾 State Management Pattern

### HomePage State
```javascript
const [projects, setProjects] = useState([]);           // API data
const [searchQuery, setSearchQuery] = useState("");      // User input
const [selectedTags, setSelectedTags] = useState(new Set()); // Filters
const [expandedProject, setExpandedProject] = useState(null); // UI
```

### UploadPage State
```javascript
const [file, setFile] = useState(null);                 // Selected file
const [isUploading, setIsUploading] = useState(false);  // Loading
const [message, setMessage] = useState("");              // Success
const [error, setError] = useState("");                 // Error
```

---

## 🎯 Common Code Patterns

### Fetch Data
```javascript
useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await fetch(URL);
      const data = await response.json();
      setData(data);
    } catch (err) {
      setError(err.message);
    }
  };
  fetchData();
}, []);
```

### Handle Click
```javascript
const handleClick = (item) => {
  if (selectedItems.has(item)) {
    selectedItems.delete(item);
  } else {
    selectedItems.add(item);
  }
  setSelectedItems(new Set(selectedItems));
};
```

### Navigate Programmatically
```javascript
const navigate = useNavigate();
navigate(`/project/${id}`);
```

---

## 🔐 Environment Variables

### Required Files
- `ideahub-frontend/.env`
- `ideahub-node-backend/.env`
- `ideahub-backend/.env`

### Don't Forget
- Never commit `.env` files
- Add to `.gitignore`
- Document in `SETUP_GUIDE.md`

---

## 📊 Project Data Structure

```javascript
{
  _id: ObjectId,
  file_name: "report.pdf",
  project_info: {
    project_title: "Project Name",
    abstract: "Description...",
    problem_statement: "Problem...",
    methods_approach: "Methods...",
    technologies_used: ["React", "Node.js"],
    algorithms_models: ["Random Forest", "SVM"],
    datasets_used: ["Dataset1", "Dataset2"],
    project_domain: "AI/ML",
    keywords: ["tag1", "tag2"],
    github_repo: "https://github.com/user/repo"
  },
  embedding: [0.123, 0.456, ...],  // Vector for similarity
  created_at: Date,
  updated_at: Date
}
```

---

## 🧪 Testing Checklist

- [ ] Home page loads
- [ ] Can search projects
- [ ] Can filter by tags
- [ ] Can click "View Details"
- [ ] Details page loads
- [ ] Can click back button
- [ ] Can click "Upload"
- [ ] Can upload file
- [ ] Gets success message
- [ ] Redirects to home
- [ ] New project appears
- [ ] No console errors
- [ ] Mobile view works

---

## 📚 Git Commands

```bash
# Check status
git status

# Stage changes
git add .

# Commit
git commit -m "feat: descriptive message"

# Push
git push origin main

# View branch
git branch -a
```

---

## 🚀 Deploy Checklist

- [ ] Build frontend: `npm run build`
- [ ] Test build: `npm run preview`
- [ ] Set production env vars
- [ ] Deploy frontend to Netlify/Vercel
- [ ] Deploy Node backend to Heroku/Railway
- [ ] Deploy FastAPI to Heroku/Railway
- [ ] Update MongoDB to Atlas
- [ ] Test all endpoints
- [ ] Monitor error logs

---

## 📞 Support Resources

- **Docs**: Read REFACTORING_SUMMARY.md
- **Architecture**: See ARCHITECTURE.md
- **Setup**: Follow SETUP_GUIDE.md
- **Code**: Check inline comments
- **Errors**: Check browser console (F12)
- **API**: Visit http://127.0.0.1:8000/docs

---

## ⚡ Performance Tips

- Enable Chrome DevTools Network tab to see API calls
- Use React DevTools to inspect component tree
- Check Bundle size with Vite analyzer
- Lazy load routes if they become large
- Memoize components that rerender frequently
- Cache API responses where appropriate

---

**Last Updated:** March 13, 2026  
**For Detailed Info:** See SETUP_GUIDE.md, ARCHITECTURE.md, REFACTORING_SUMMARY.md
