import React, { useState, useEffect } from "react";
import "../App.css";
import Verification from "./Verification.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"; // Import axios
import { Stack, Typography, Button, Box } from "@mui/material";

function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const [panels, setPanels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popup, set_popup] = useState(null);
  const [redPanels, setRedPanels] = useState([]); // red panels
  const [greenPanels, setGreenPanels] = useState([]); // Green panels

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
            "Content-Type": "application/json",
          },
          data: { page_ids: pageIds },
        });

        if (response.data && response.data.results) {
          setPanels(response.data.results);
        } else {
          console.log("No results found in response");
        }
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Failed to load results. Please try again.");
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

  // Click red button, ensuing functionality
  const markAsRedAndNext = () => {
    setRedPanels((prev) => (prev.includes(popup) ? prev : [...prev, popup]));
    setGreenPanels((prev) => prev.filter((index) => index !== popup)); // Remove from green
    set_popup((prev) => (prev < panels.length - 1 ? prev + 1 : prev)); // Move to next panel
  };

  // Click green button, ensuing functionality
  const markAsGreenAndNext = () => {
    setGreenPanels((prev) => (prev.includes(popup) ? prev : [...prev, popup]));
    setRedPanels((prev) => prev.filter((index) => index !== popup)); // Remove from red
    set_popup((prev) => (prev < panels.length - 1 ? prev + 1 : prev)); // Move to next panel
  };

  // Click yellow button, ensuing functionality
  const moveToNext = () => {
    // We can add functionality where she chooses if she wants to highlight the unsure panels yellow or not
    set_popup((prev) => (prev < panels.length - 1 ? prev + 1 : prev)); // Move to next panel
  };

  // If we're still loading, show a loading message
  if (loading) {
    return <div className="loading">Loading results...</div>;
  }

  return (
    <Stack sx={sx.resultsPage}>
      {popup !== null ? (
        <Verification
          i={popup}
          panels={panels}
          overview={() => set_popup(null)}
          correct_next={markAsGreenAndNext}
          fail_next={markAsRedAndNext}
          move_next={moveToNext}
        />
      ) : (
        <>
          <Typography variant="h4" sx={sx.header}>
            Search Results
          </Typography>

          <Stack sx={sx.resultsContainer}>
            <Stack sx={sx.resultsContent}>
              <Stack sx={sx.panelsGrid}>
                {panels.map((panelText, index) => (
                  <Box
                    key={index}
                    onClick={() => handlePanelClick(index)}
                    // handle highlight
                    sx={{
                      ...sx.resultPanel,
                      backgroundColor: greenPanels.includes(index)
                        ? "green"
                        : redPanels.includes(index)
                        ? "red"
                        : "white", // If green, show green; else check for red
                    }}
                  >
                    <Typography variant="body1">
                      {index + 1}. Volume Title: {panelText.volume_title} | Page
                      Number: {panelText.page_number}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Stack>

          <Stack direction="row" sx={sx.buttonRow}>
            <Button variant="contained" sx={sx.backButton} href="/">
              Home
            </Button>
            <Button variant="contained" sx={sx.searchBtn} href="/search">
              Back to Search
            </Button>
          </Stack>
        </>
      )}
    </Stack>
  );
}

export default Results;

// MUI sx styles converted from SCSS
const sx = {
  resultsPage: {
    p: 0,
    fontFamily: "Arial, sans-serif",
    position: "relative",
    width: 1200,
    minHeight: "100vh",
    boxSizing: "border-box",
    margin: 0,
  },
  header: {
    textAlign: "center",
    margin: "0 0 2rem 0",
    paddingTop: "1rem",
    fontSize: "20px",
  },
  resultsContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 0,
    padding: "1rem",
    minHeight: "calc(80vh - 100px)",
    margin: "0 auto",
    width: "100%",
    border: "1px solid #ddd",
  },
  resultsContent: {
    height: "calc(79vh)",
    overflowY: "scroll",
  },
  panelsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  resultPanel: {
    backgroundColor: "white",
    color: "black",
    padding: "1rem",
    borderRadius: 0,
    minHeight: "60px",
    display: "flex",
    alignItems: "center",
    border: "1px solid #ddd",
    width: "95%",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-start",
    gap: "1rem",
  },
};
