import React from 'react'
import '../App.css'
import './Results.scss'

function Results() {
  // Create an array of 20 panel numbers
  const panels = Array.from({ length: 20 }, (_, i) => `Panel ${i + 1}`);

  return (
    <div className="results-page">
      <h1>Search Results</h1>
    
      
      <div className="results-container">
        <div className="results-content">
          <div className="panels-grid">
            {panels.map((panelText, index) => (
              <div key={index} className="result-panel">
                {panelText}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="button-row">
        <a href="/">
          <button className="back-button">Home</button>
        </a>
        <div className="right-buttons">
          <a href="/search">
            <button className="search-btn">Back to Search</button>
          </a>
        </div>
      </div>
    </div>
  )
}

export default Results
