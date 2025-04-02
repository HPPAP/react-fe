import React, { useState, useEffect } from "react";
import "../App.css";
import "./Results.scss";
import Verification from "./Verification.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"; // Import axios

function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popup, set_popup] = useState(null);

  // Fetch search results using page IDs passed from Search component
  useEffect(() => {
    const fetchResults = async () => {
      try {
        // Get page_ids from location state
        const pageIds = location.state?.pageIds || [];
        
        if (pageIds.length === 0) {
          console.log("No page IDs found in location state");
          setLoading(false);
          return;
        }
        
        const response = await axios({
          method: "post",
          url: `${import.meta.env.VITE_BE_URL}/api/results`,
          headers: {
            'Content-Type': 'application/json',
          },
          data: { page_ids: pageIds }
        });

        if (response.data && response.data.results) {
          setPanels(response.data.results);
        } else {
          console.log("No results found in response");
        }
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [location.state]);

  const handlePanelClick = (i) => {
    set_popup(i);
    console.log(i);
  };

  // If we're still loading, show a loading message
  if (loading) {
    return <div className="loading">Loading results...</div>;
  }

  return (
    <div className="results-page">
      {popup !== null ? (
        <Verification
          i={popup}
          panels={panels}
          next={() => set_popup((prev) => prev + 1)}
          cooper={() => set_popup(null)}
        />
      ) : (
        <>
          <h1>Search Results</h1>

          <div className="results-container">
            <div className="results-content">
              <div className="panels-grid">
                {panels.length === 0 ? (
                  <div className="no-results">No results found. Try a different search.</div>
                ) : (
                  panels.map((panelText, index) => (
                    <div
                      key={index}
                      className="result-panel"
                      onClick={() => handlePanelClick(index)}
                      style={{ cursor: "pointer" }}
                    >
                      <p>
                        {index + 1}. Volume Title: {panelText.volume_title || "Unknown"} | Page
                        Number: {}
                        {panelText.page_number || "Unknown"}
                      </p>
                    </div>
                  ))
                )}
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
        </>
      )}
    </div>
  );
}

export default Results;
