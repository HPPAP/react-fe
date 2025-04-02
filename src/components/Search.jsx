import React, { useState, useEffect } from "react";
import axios from "axios";
import "../App.css";
import "./Search.scss";
import { useNavigate } from "react-router-dom";

function Search() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Add state for each field's tags and current input
  const [fields, setFields] = useState({
    pageNumber: { tags: [], currentInput: "" },
    volume: { tags: [], currentInput: "" },
    topics: { tags: [], currentInput: "" },
    keywords: { tags: [], currentInput: "" },
    year: { tags: [], currentInput: "" },
  });
  // Add state for loading and error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Add state for available years
  const [availableYears, setAvailableYears] = useState({ years: [], ranges: [] });
  // Add state for filtered years
  const [filteredYears, setFilteredYears] = useState({ years: [], ranges: [] });

  const [testResponse, setTestResponse] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [resultCount, setResultCount] = useState(0);
  
  const navigate = useNavigate();

  // Fetch available years when component mounts
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BE_URL}/api/years`);
        if (response.data) {
          setAvailableYears(response.data);
        }
      } catch (err) {
        console.error("Error fetching years:", err);
      }
    };

    fetchYears();
  }, []);

  // Filter years based on user input
  const filterYears = (input) => {
    if (!input) {
      // If input is empty, show all years
      setFilteredYears(availableYears);
      return;
    }

    const yearInput = input.trim();
    const inputYear = parseInt(yearInput, 10);
    
    // Filter individual years
    const filteredIndividualYears = availableYears.years.filter(year => {
      const yearStr = year.toString();
      return yearStr.startsWith(yearInput);
    });

    // Filter ranges
    const filteredRanges = availableYears.ranges.filter(range => {
      // Check if the range starts with the input
      if (range.startsWith(yearInput)) {
        return true;
      }

      // Check if the input year falls within the range
      if (inputYear && !isNaN(inputYear)) {
        // Parse range like "1781-85" or "1781-1785"
        const rangeMatch = range.match(/(\d{4})[-\/](\d{2}|\d{4})/);
        if (rangeMatch) {
          const startYear = parseInt(rangeMatch[1], 10);
          const endSuffix = rangeMatch[2];
          let endYear;
          
          if (endSuffix.length === 2) {
            // Handle shortened form like "1781-85"
            endYear = parseInt(startYear.toString().substring(0, 2) + endSuffix, 10);
          } else {
            // Handle full form like "1781-1785"
            endYear = parseInt(endSuffix, 10);
          }
          
          return inputYear >= startYear && inputYear <= endYear;
        }
      }
      
      return false;
    });

    setFilteredYears({
      years: filteredIndividualYears,
      ranges: filteredRanges
    });
  };

  useEffect(() => {
    // Initialize filtered years with all available years
    setFilteredYears(availableYears);
  }, [availableYears]);

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent new line
      const value = fields[field].currentInput.trim();
      if (value) {
        setFields((prev) => ({
          ...prev,
          [field]: {
            tags: [...prev[field].tags, value],
            currentInput: "",
          },
        }));
      }
    }
  };

  // Modify handleInputChange for the year field to filter years
  const handleInputChange = (e, field) => {
    const value = e.target.value;
    
    setFields((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        currentInput: value,
      },
    }));
    
    // Filter years when changing the year input
    if (field === 'year') {
      filterYears(value);
    }
  };

  const removeTag = (field, tagIndex) => {
    setFields((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        tags: prev[field].tags.filter((_, index) => index !== tagIndex),
      },
    }));
  };

  // Update getSearchData function to properly handle year ranges
  const getSearchData = () => {
    // If the year tag is a range (like "1640-42"), we need to parse it
    let yearValue = fields.year.tags.length > 0 ? fields.year.tags[0] : null;
    
    return {
      pageNumber: fields.pageNumber.tags,
      volume: fields.volume.tags,
      topics: fields.topics.tags,
      keywords: fields.keywords.tags,
      year: yearValue 
    };
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
  
    // Create the search data object
    const searchData = getSearchData();
    
    // Log what we're sending to the backend
    console.log("Sending search data to backend:", searchData);

    try {
      const response = await axios({
        method: "post",
        url: `${import.meta.env.VITE_BE_URL}/api/search`,
        headers: {
          "Content-Type": "application/json",
        },
        data: searchData
      });

      console.log("Full response from backend:", response.data);
      
      // Get results with proper null checks
      const results = response.data?.results?.results || [];
      const count = response.data?.results?.count || 0;
      
      setSearchResults(results);
      setResultCount(count);
      
      // Only proceed with navigation if we have results
      if (results && results.length > 0) {
        // Extract page IDs from search results
        const pageIds = results.map(result => result._id);
        
        // Navigate to Results page with the page IDs
        navigate('/results', { state: { pageIds } });
      }
    } catch (err) {
      setError("Failed to perform search. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestClick = async () => {
    try {
      const response = await axios({
        method: "post",
        url: `${import.meta.env.VITE_BE_URL}/api/test-post`,
        data: {
          message: "Hello from the Test button!",
        },
      })
        .then((data) => {
          console.log(data);
          setTestResponse(data.data.results);
          return data.data.message;
        })
        .catch((error) => console.log(error));

      setTestResponse(response);
    } catch (err) {
      console.error("Test POST error:", err);
      setTestResponse({ error: err.message });
    }
  };

  // Function to handle year selection from dropdown
  const handleYearSelect = (selectedYear) => {
    setFields((prev) => ({
      ...prev,
      year: {
        tags: [selectedYear], // Replace any existing year with the selected one
        currentInput: "",
      },
    }));
    setIsDropdownOpen(false);
  };

  return (
    <div className="search-page">
      {/* Main Fields */}
      <div className="search-fields">
        {/* Year */}
        <div className="field-block">
          <label className="field-label">Year</label>
          <div className="input-container">
            <div className="tags-container">
              {fields.year.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button onClick={() => removeTag("year", index)}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <div className="year-input-wrapper">
              <textarea
                placeholder="Enter year (e.g. 1985)..."
                value={fields.year.currentInput}
                onChange={(e) => {
                  // Validate year input to only allow numbers and ranges
                  const value = e.target.value.replace(/[^0-9\-\/]/g, '');
                  handleInputChange({ target: { value } }, "year");
                }}
                onClick={() => setIsDropdownOpen(true)}
                onKeyDown={(e) => handleKeyDown(e, "year")}
              />
              {isDropdownOpen && (filteredYears.ranges.length > 0 || filteredYears.years.length > 0) && (
                <div className="year-dropdown">
                  <div className="year-dropdown-columns">
                    {/* Year Ranges Column */}
                    <div className="dropdown-column">
                      <h4>Year Ranges</h4>
                      <div className="dropdown-items">
                        {filteredYears.ranges.length > 0 ? (
                          filteredYears.ranges.map((range, index) => (
                            <div 
                              key={`range-${index}`} 
                              className="dropdown-item"
                              onClick={() => handleYearSelect(range)}
                            >
                              {range}
                            </div>
                          ))
                        ) : (
                          <div className="year-option-empty">No matching ranges</div>
                        )}
                      </div>
                    </div>

                    {/* Individual Years Column */}
                    <div className="dropdown-column">
                      <h4>Individual Years</h4>
                      <div className="dropdown-items">
                        {filteredYears.years.length > 0 ? (
                          filteredYears.years.map((year, index) => (
                            <div 
                              key={`year-${index}`} 
                              className="dropdown-item"
                              onClick={() => handleYearSelect(year.toString())}
                            >
                              {year}
                            </div>
                          ))
                        ) : (
                          <div className="year-option-empty">No matching years</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Topics */}
        <div className="field-block">
          <label htmlFor="topics-input" className="field-label">
            Topics
          </label>
          <div className="input-container">
            <div className="tags-container">
              {fields.topics.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button onClick={() => removeTag("topics", index)}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <textarea
              id="topics-input"
              placeholder="Press Enter to add..."
              value={fields.topics.currentInput}
              onChange={(e) => handleInputChange(e, "topics")}
              onKeyDown={(e) => handleKeyDown(e, "topics")}
            />
          </div>
        </div>

        {/* Keywords */}
        <div className="field-block">
          <label htmlFor="keywords-input" className="field-label">
            Keywords
          </label>
          <div className="input-container">
            <div className="tags-container">
              {fields.keywords.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button onClick={() => removeTag("keywords", index)}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <textarea
              id="keywords-input"
              placeholder="Press Enter to add..."
              value={fields.keywords.currentInput}
              onChange={(e) => handleInputChange(e, "keywords")}
              onKeyDown={(e) => handleKeyDown(e, "keywords")}
            />
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="button-row">
        <div className="right-buttons">
          <button
            type="button"
            className="search-btn"
            onClick={handleSearch}
            disabled={isLoading}
          >
            Search
          </button>
        </div>
      </div>

      {/* Optionally, display a loading indicator */}
      {isLoading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
      
      {/* Display search results */}
      {searchResults && searchResults.length > 0 && (
        <div className="search-results">
          <h2>Search Results ({resultCount} total)</h2>
          <ul>
            {searchResults.map((result, index) => (
              <li key={index}>
                {/* Adjust this based on your actual result structure */}
                {JSON.stringify(result)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Search;