import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link as RouterLink,
} from "react-router-dom";
import ApiTest from "./ApiTest";
import Search from "./components/Search";
import Results from "./components/Results";
import Projects from "./components/Projects";
import Verification from "./components/Verification.jsx";

import ProjectLayout from "./project/Layout.jsx";
import ProjectView from "./project/View.jsx";
import ProjectEdit from "./project/Edit.jsx";
import ProjectSettings from "./project/Settings.jsx";

import { Box, Button, Typography } from "@mui/material";

function HomePage() {
  return (
    <Box sx={sx.homeContainer}>
      <Typography variant="h2" sx={sx.title}>
        PROXIMUS
      </Typography>

      <Button
        component={RouterLink}
        to="/projects"
        variant="outlined"
        sx={sx.navButton}
      >
        Projects
      </Button>

      <Box sx={{ mt: 4 }}>
        <ApiTest />
      </Box>
    </Box>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/results" element={<Results />} />
        <Route path="/projects" element={<Projects />} />

        <Route path="/search" element={<Search />} />
        <Route path="project/:id/search" element={<Search />} />

        <Route path="/project/:id/verify/:page_id" element={<Verification />} />
        <Route path="/project/:id" element={<ProjectLayout />}>
          <Route index element={<ProjectView />} />

          <Route path="edit" element={<ProjectEdit />} />

          <Route path="settings" element={<ProjectSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

const sx = {
  homeContainer: {
    height: "100vh", // Fill the viewport height
    bgcolor: "#282c34", // Dark background
    color: "white", // White text
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // Vertical center
    alignItems: "center", // Horizontal center
    textAlign: "center",
    px: 2, // Small horizontal padding
  },
  title: {
    fontSize: "3rem",
    fontWeight: "bold",
    mb: 3,
  },
  navButton: {
    color: "inherit",
    borderColor: "rgba(255,255,255,0.6)",
    textTransform: "none",
    "&:hover": {
      borderColor: "white",
      bgcolor: "rgba(255,255,255,0.1)",
    },
  },
};
