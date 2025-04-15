import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ApiTest from "./ApiTest";
import Search from "./components/Search";
import Results from "./components/Results";
import Projects from "./components/Projects";
import "./App.css";

import ProjectLayout from "./project/Layout.jsx";
import ProjectSettings from "./project/Settings.jsx";
import ProjectEdit from "./project/Edit.jsx";
import ProjectView from "./project/View.jsx";

function HomePage() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>PROXIMUS</h1>
        <nav>
          <a href="/search">
            <button className="search-button">Search</button>
          </a>
          <a href="/results">
            <button className="results-button">Results</button>
          </a>
          <a href="/projects">
            <button className="projects-button">Projects</button>
          </a>
        </nav>
      </header>
      <ApiTest />
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<Results />} />

        <Route path="search" element={<Search />} />

        <Route path="project/:id" element={<ProjectLayout />}>
          <Route index element={<ProjectView />} />
          <Route path="edit" element={<ProjectEdit />} />
          <Route path="settings" element={<ProjectSettings />} />
        </Route>

        <Route path="/projects" element={<Projects />} />
      </Routes>
    </Router>
  );
}

export default App;
