import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ApiTest from './ApiTest'
import Search from './components/Search'
import Results from './components/Results'
import './App.css'

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
        <Route path="/search" element={<Search />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  )
}

export default App
