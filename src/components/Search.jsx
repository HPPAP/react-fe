import React, { useState } from "react";
import axios from "axios";
import "../App.css";
import "./Search.scss";

function Search() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // Add state for each field's tags and current input
  const [fields, setFields] = useState({
    pageNumber: { tags: [], currentInput: "" },
    volume: { tags: [], currentInput: "" },
    date: { tags: [], currentInput: "" },
    topics: { tags: [], currentInput: "" },
    keywords: { tags: [], currentInput: "" },
  });
  // Add state for loading and error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [testResponse, setTestResponse] = useState(null);
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

  const handleInputChange = (e, field) => {
    setFields((prev) => ({
      ...prev,
      [field]: {
        ...prev[field],
        currentInput: e.target.value,
      },
    }));
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

  // Add this helper function before the handleSearch function
  const getSearchData = () => {
    return {
      pageNumber: fields.pageNumber.tags,
      volume: fields.volume.tags,
      date: fields.date.tags,
      topics: fields.topics.tags,
      keywords: fields.keywords.tags,
    };
  };

  const handleSearch = async () => {
    setIsLoading(true);
    setError(null);

    try {
      axios({
        method: "post",
        url: `${import.meta.env.VITE_BE_URL}/api/search`,
        headers: {
          "Content- Type": "application/json",
        },
      })
        .then((res) => {
          console.log(res.data);
          setSearchResults(res.data.results);
        })
        .catch((error) => console.log(error));

      // const response = await fetch(
      //   `${import.meta.env.VITE_BE_URL}/api/search`,
      //   {
      //     credentials: "include",
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify(getSearchData()),
      //   }
      // );

      // if (!response.ok) {
      //   throw new Error("Search failed");
      // }

      // const data = await response.json();
      // setSearchResults(data.results);
    } catch (err) {
      setError("Failed to perform search. Please try again.");
      console.error("Search error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestClick = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BE_URL}/api/test-post`,
        { message: "Hello from the Test button!" }
      );

      setTestResponse(response.data);
    } catch (err) {
      console.error("Test POST error:", err);
      setTestResponse({ error: err.message });
    }
  };

  return (
    <div className="search-page">
      {/* Back to Home button - moved outside navigation container */}
      {/* <a href="/">
        <button className="back-button">Back to Home</button>
      </a> */}
      {/* Database Choice */}
      <div className="database-choice">
        <label htmlFor="database-select" className="db-label">
          Database Choice
        </label>
        <select id="database-select">
          <option value="">Select a Database</option>
          <option value="db1">Database 1</option>
          <option value="db2">Database 2</option>
        </select>
      </div>

      {/* Main Fields */}
      <div className="search-fields">
        {/* Page Number */}
        <div className="field-block">
          <label htmlFor="page-number-input" className="field-label">
            Page Number
          </label>
          <div className="input-container">
            <div className="tags-container">
              {fields.pageNumber.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button onClick={() => removeTag("pageNumber", index)}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <textarea
              id="page-number-input"
              placeholder="Press Enter to add..."
              value={fields.pageNumber.currentInput}
              onChange={(e) => handleInputChange(e, "pageNumber")}
              onKeyDown={(e) => handleKeyDown(e, "pageNumber")}
            />
          </div>
        </div>

        {/* Volume */}
        <div className="field-block">
          <label className="field-label">Volume</label>
          <div className="input-container">
            <div className="tags-container">
              {fields.volume.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button onClick={() => removeTag("volume", index)}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <textarea
              placeholder="Press Enter to add..."
              value={fields.volume.currentInput}
              onChange={(e) => handleInputChange(e, "volume")}
              onKeyDown={(e) => handleKeyDown(e, "volume")}
            />
          </div>
        </div>

        {/* Date */}
        <div className="field-block">
          <label className="field-label">Date</label>
          <div className="input-container">
            <div className="tags-container">
              {fields.date.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button onClick={() => removeTag("date", index)}>
                    &times;
                  </button>
                </span>
              ))}
            </div>
            <textarea
              placeholder="Press Enter to add..."
              value={fields.date.currentInput}
              onChange={(e) => handleInputChange(e, "date")}
              onKeyDown={(e) => handleKeyDown(e, "date")}
            />
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
        <a href="/">
          <button className="back-button">Home</button>
        </a>
        <div className="right-buttons">
          <button type="button" className="projects-btn">
            Projects
          </button>
          <button
            type="button"
            className="search-btn"
            onClick={handleSearch}
            disabled={isLoading}
          >
            Search
          </button>
          {/* ADD THIS TEST BUTTON HERE */}
          <button type="button" onClick={handleTestClick}>
            Test
          </button>
        </div>
      </div>

      {/* Optionally, display a loading indicator */}
      {isLoading && <div>Loading...</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
}

export default Search;
