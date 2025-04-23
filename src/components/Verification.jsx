import { useState, useEffect, use } from "react";
import { Stack, Typography, TextField, Button, Box } from "@mui/material";
import { IconButton } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import "../App.css";
import { Link } from "react-router-dom";

export default function Verification({
  i,
  panels,
  correct_next,
  overview,
  fail_next,
  move_next,
  keywords = [],
}) {
  console.log("Verification component - keywords:", keywords); // Debug log
  const panel = panels[i];
  const [zoomLevel, setZoomLevel] = useState(1);

  // Reset zoom when panel changes
  useEffect(() => {
    setZoomLevel(1);
  }, [panel.image_url]);

  const handleWheel = (event) => {
    if (event.ctrlKey || event.metaKey) {
      // Support both Ctrl and Cmd keys
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      setZoomLevel((prev) => {
        const newLevel = prev * delta;
        return Math.min(Math.max(newLevel, 0.5), 3); // Limit zoom between 50% and 300%
      });
    }
  };

  // Function to highlight keywords in text
  const highlightKeywords = (text) => {
    console.log("highlightKeywords - keywords:", keywords); // Debug log
    if (!keywords.length) return text;
    
    const parts = text.split(new RegExp(`(${keywords.join('|')})`, 'gi'));
    return parts.map((part, i) => 
      keywords.some(keyword => keyword.toLowerCase() === part.toLowerCase()) 
        ? <mark key={i} style={{ backgroundColor: 'yellow' }}>{part}</mark>
        : part
    );
  };

  return (
    <>
      <Stack sx={sx.compareStack}>
        {/* Stack 1: Searched Text */}
        <Stack sx={sx.boxBorder}>
          <Box sx={sx.textContainer}>
            {highlightKeywords(panel.text)}
          </Box>
        </Stack>
        {/* Stack 2: PDF Image */}
        <Stack sx={sx.boxBorder}>
          <Box sx={sx.pdfBorder} onWheel={handleWheel}>
            {/* <img
              src={panel.image_url}
              alt="document preview"
              style={{
                width: `${100 * zoomLevel}%`,
                height: `${100 * zoomLevel}%`,
                minWidth: "100%",
                minHeight: "100%",
                objectFit: "contain",
                transition: "all 0.1s ease-out",
              }}
            /> */}
            <img
              src={panel.image_url}
              alt="document preview"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top left",
                width: "100%",
                height: "auto",
                objectFit: "contain",
                transition: "transform 0.1s ease-out",
              }}
            />
          </Box>
        </Stack>
      </Stack>
      <Stack sx={sx.buttonsStack}>
        <IconButton
          onClick={correct_next} // highlight panel green and move to next page
          sx={{ ...sx.circleButton, backgroundColor: "green" }}
        >
          <CheckIcon sx={sx.icon} />
        </IconButton>
        <IconButton
          // sx={{ ...sx.circleButton, backgroundColor: "red" }}
          onClick={fail_next} // Call highlight callback when red button is clicked
          sx={{ ...sx.circleButton, backgroundColor: "red" }}
        >
          <CloseIcon sx={sx.icon} />
        </IconButton>

        <IconButton
          onClick={move_next}
          sx={{ ...sx.circleButton, backgroundColor: "yellow" }}
        >
          <RemoveIcon sx={sx.icon} />
        </IconButton>
      </Stack>
      <Stack sx={sx.overviewStack}>
        <Button
          onClick={overview}
          variant="outlined"
          component={Link}
          to="/Results"
        >
          Overview
        </Button>
      </Stack>
    </>
  );
}

const sx = {
  compareStack: {
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
  },

  overviewStack: {
    flexDirection: "row",
    justifyContent: "flex-end",
    mt: -7,
    mr: 5,
  },

  buttonsStack: {
    flexDirection: "row",
    justifyContent: "center",
    mt: 5,
    gap: 3,
  },

  boxBorder: {
    width: 700,
    height: 600,
    border: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  pdfBorder: {
    width: "100%",
    height: 600,
    overflow: "auto", // Changed from 'auto' to 'scroll' to always show bars
    cursor: "zoom-in",

    // make sure this works
    display: "flex",
    justifyContent: "flex-start", // Ensures image aligns to top-left for natural scroll
    alignItems: "flex-start",
  },

  circleButton: {
    border: 1,
    width: 100,
    height: 100,
    borderRadius: "50%",
    "&:focus": {
      outline: "none", // Removes the blue outline
    },
  },

  image: {
    width: 600,
    height: 600,
  },

  icon: {
    fontSize: 50,
  },

  textContainer: {
    width: "100%",
    height: "100%",
    overflowY: "auto", // Enables vertical scrolling
    padding: "10px", // Adds some spacing inside the box
  },
};
