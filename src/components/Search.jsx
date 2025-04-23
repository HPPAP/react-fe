// src/components/Search.jsx

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../App.css";
import "./Search.scss";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@mui/material";

function Search() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [fields, setFields] = useState({
    pageNumber: { tags: [], currentInput: "" },
    volume: { tags: [], currentInput: "" },
    topics: { tags: [], currentInput: "" },
    keywords: { tags: [], currentInput: "" },
    year: { tags: [], currentInput: "" },
  });
  const [availableYears, setAvailableYears] = useState({
    years: [],
    ranges: [],
  });
  const [filteredYears, setFilteredYears] = useState({ years: [], ranges: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [resultCount, setResultCount] = useState(0);

  const dropdownRef = useRef(null);
  const textareaRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  // Fetch available years
  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BE_URL}/api/years`)
      .then((res) => setAvailableYears(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Initialize filtered years
  useEffect(() => {
    setFilteredYears(availableYears);
  }, [availableYears]);

  // Filter years/ranges
  const filterYears = (input) => {
    if (!input) {
      setFilteredYears(availableYears);
      return;
    }
    const yearInput = input.trim();
    const n = parseInt(yearInput, 10);
    const years = availableYears.years.filter((y) =>
      y.toString().startsWith(yearInput)
    );
    const ranges = availableYears.ranges.filter((r) => {
      if (r.startsWith(yearInput)) return true;
      const m = r.match(/(\d{4})-(\d{2}|\d{4})/);
      if (m && !isNaN(n)) {
        const start = parseInt(m[1], 10);
        const end = parseInt(
          m[2].length === 2 ? m[1].slice(0, 2) + m[2] : m[2],
          10
        );
        return n >= start && n <= end;
      }
      return false;
    });
    setFilteredYears({ years, ranges });
  };

  const handleKeyDown = (e, field) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = fields[field].currentInput.trim();
      if (val) {
        setFields((prev) => ({
          ...prev,
          [field]: {
            tags: [...prev[field].tags, val],
            currentInput: "",
          },
        }));
      }
    }
  };

  const handleInputChange = (e, field) => {
    const val = e.target.value;
    setFields((prev) => ({
      ...prev,
      [field]: { ...prev[field], currentInput: val },
    }));
    if (field === "year") filterYears(val);
  };

  const removeTag = (field, idx) => {
    setFields((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        tags: prev[field].tags.filter((_, i) => i !== idx),
      },
    }));
  };

  const getSearchData = () => ({
    pageNumber: fields.pageNumber.tags,
    volume: fields.volume.tags,
    topics: fields.topics.tags,
    keywords: fields.keywords.tags,
    year: fields.year.tags[0] || null,
  });

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BE_URL}/api/search`,
        {
          pageNumber: fields.pageNumber.tags,
          volume: fields.volume.tags,
          topics: fields.topics.tags,
          keywords: fields.keywords.tags,
          year: fields.year.tags[0],
        }
      );

      if (response.data && response.data.results) {
        navigate("/results", {
          state: {
            pageIds: response.data.results.results.map((r) => r._id),
            projectId: id,
            keywords: fields.keywords.tags,
          },
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setError("Search failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-page" style={{ marginLeft: "1rem" }}>
      {/* Home button */}
      <Button
        variant="contained"
        component={Link}
        to="/Projects"
        sx={{
          mb: 2,
          backgroundColor: "#45b6fe",
          color: "white",
          "&:hover": { backgroundColor: "#369cd1" },
        }}
      >
        Home
      </Button>

      {id && <div>Route ID: {id}</div>}

      <div className="search-fields">
        {/* Year Field */}
        <div className="field-block">
          <label className="field-label">Year</label>
          <div className="input-container" style={{ position: "relative" }}>
            <div className="tags-container">
              {fields.year.tags.map((tag, i) => (
                <span key={i} className="tag">
                  {tag}
                  <button onClick={() => removeTag("year", i)}>&times;</button>
                </span>
              ))}
            </div>
            <textarea
              ref={textareaRef}
              placeholder="Enter year (e.g. 1985)…"
              value={fields.year.currentInput}
              onChange={(e) => handleInputChange(e, "year")}
              onClick={() => setIsDropdownOpen(true)}
              onKeyDown={(e) => handleKeyDown(e, "year")}
            />
            {isDropdownOpen && (
              <div
                className="database-dropdown"
                ref={dropdownRef}
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  width: "350px",
                  margin: 0,
                  padding: 0,
                  zIndex: 10,
                }}
              >
                <div
                  className="dropdown-content"
                  style={{
                    display: "flex",
                    gap: "1rem",
                    maxHeight: "160px",
                    overflowY: "auto",
                    margin: 0,
                    padding: "0.5rem",
                  }}
                >
                  <div className="dropdown-column" style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, padding: "0 0 4px 0" }}>Ranges</h4>
                    {filteredYears.ranges.length > 0 ? (
                      filteredYears.ranges.map((range) => (
                        <div
                          key={range}
                          className="dropdown-item"
                          onClick={() => {
                            setFields((prev) => ({
                              ...prev,
                              year: { tags: [range], currentInput: "" },
                            }));
                            setIsDropdownOpen(false);
                          }}
                        >
                          {range}
                        </div>
                      ))
                    ) : (
                      <div className="year-option-empty">No ranges</div>
                    )}
                  </div>
                  <div className="dropdown-column" style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, padding: "0 0 4px 0" }}>Years</h4>
                    {filteredYears.years.length > 0 ? (
                      filteredYears.years.map((yr) => (
                        <div
                          key={yr}
                          className="dropdown-item"
                          onClick={() => {
                            setFields((prev) => ({
                              ...prev,
                              year: { tags: [yr.toString()], currentInput: "" },
                            }));
                            setIsDropdownOpen(false);
                          }}
                        >
                          {yr}
                        </div>
                      ))
                    ) : (
                      <div className="year-option-empty">No years</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Topics Field */}
        <div className="field-block">
          <label htmlFor="topics-input" className="field-label">
            Topics
          </label>
          <div className="input-container">
            <div className="tags-container">
              {fields.topics.tags.map((tag, i) => (
                <span key={i} className="tag">
                  {tag}
                  <button onClick={() => removeTag("topics", i)}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <textarea
              id="topics-input"
              placeholder="Press Enter to add…"
              value={fields.topics.currentInput}
              onChange={(e) => handleInputChange(e, "topics")}
              onKeyDown={(e) => handleKeyDown(e, "topics")}
            />
          </div>
        </div>

        {/* Keywords Field */}
        <div className="field-block">
          <label htmlFor="keywords-input" className="field-label">
            Keywords
          </label>
          <div className="input-container">
            <div className="tags-container">
              {fields.keywords.tags.map((tag, i) => (
                <span key={i} className="tag">
                  {tag}
                  <button onClick={() => removeTag("keywords", i)}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <textarea
              id="keywords-input"
              placeholder="Press Enter to add…"
              value={fields.keywords.currentInput}
              onChange={(e) => handleInputChange(e, "keywords")}
              onKeyDown={(e) => handleKeyDown(e, "keywords")}
            />
          </div>
        </div>
      </div>

      {/* Search button */}
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

      {isLoading && <div>Loading…</div>}
      {error && <div className="error">{error}</div>}

      {searchResults.length > 0 && (
        <div className="search-results">
          <h2>Search Results ({resultCount} total)</h2>
          <ul>
            {searchResults.map((res, idx) => (
              <li key={idx}>{JSON.stringify(res)}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default Search;
