import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./components/Header/Header";
import HomePage from "./pages/HomePage/HomePage";
import UploadPage from "./pages/UploadPage/UploadPage";
import ProjectDetailsPage from "./pages/ProjectDetailsPage/ProjectDetailsPage";
import ProjectEvolutionPage from "./pages/ProjectEvolutionPage/ProjectEvolutionPage";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState(new Set());

  return (
    <BrowserRouter>
      <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <Routes>
        <Route path="/" element={<HomePage searchQuery={searchQuery} setSearchQuery={setSearchQuery} selectedTags={selectedTags} setSelectedTags={setSelectedTags} />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/project/:id" element={<ProjectDetailsPage />} />
        <Route path="/project/:id/evolution" element={<ProjectEvolutionPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
