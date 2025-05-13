import { useState, useEffect } from "react";
import axios from "axios";
import { Box, Typography, TextField, Button } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";

export default function Projects() {
  const [projects, set_projects] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_BE_URL}/api/projects`)
      .then((response) => set_projects(response.data.projects))
      .catch((error) => console.log(error));
  }, []);

  const addNewProject = async () => {
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BE_URL}/api/project/create`,
        {}
      );
      // send the user to the Settings screen for the new project:
      navigate(`/project/${data.project._id}/settings`);
    } catch (err) {
      console.error("Failed to create project:", err);
    }
  };

  return (
    <Box sx={sx.container}>
      {/* Logo */}
      <Typography 
        variant="h4" 
        sx={sx.logoText}
        onClick={() => navigate("/")}
      >
        PROXIMUS
      </Typography>
      
      {/* Header */}
      <Box sx={sx.header}>
        <Typography sx={sx.headerTitle}>Projects</Typography>
      </Box>

      {/* Create + Project Grid */}
      <Box sx={sx.grid}>
        {/* Create New */}
        <Box sx={sx.createBox}>
          <Button
            onClick={addNewProject}
            variant="outlined"
            sx={sx.createButton}
          >
            <AddIcon sx={sx.createIcon} />
          </Button>
          <Typography sx={sx.createLabel}>Create New</Typography>
        </Box>

        {/* Existing Projects */}
        {projects.map((project, i) => (
          <Box
            key={project._id}
            onClick={() => navigate(`/project/${project._id}`)}
            sx={sx.projectBox}
          >
            <Box sx={sx.projectContent}>
              <Typography sx={sx.projectTitle}>
                {project.title || "Untitled Project"}
              </Typography>
              <Typography sx={sx.projectDescription}>
                {project.description || "No description"}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

const sx = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    p: 4,
    position: "relative",
    pt: 6,
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    mb: 2,
  },
  headerTitle: {
    fontSize: "2.5rem",
    fontWeight: 600,
    fontFamily: '"Poppins", sans-serif',
    letterSpacing: '0.02em',
    color: 'white',
  },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 2,
    justifyContent: "flex-start",
  },
  createBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    mb: 2,
    ml: 2,
    width: 220,
  },
  createButton: {
    width: 220,
    height: 200,
    textTransform: "none",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      borderColor: "#45b6fe",
      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)",
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      transform: "translateY(-2px)",
    },
  },
  createIcon: {
    fontSize: 60,
    color: "rgba(255, 255, 255, 0.8)",
  },
  createLabel: {
    mt: 1,
    color: "white",
    fontSize: "1rem",
    fontFamily: '"Poppins", sans-serif',
    fontWeight: 500,
  },
  projectBox: {
    width: 220,
    height: 200,
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    ml: 2,
    mb: 2,
    padding: 2,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      borderColor: "#45b6fe",
      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)",
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      transform: "translateY(-2px)",
    },
  },
  projectContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    width: "100%",
    height: "100%",
    justifyContent: "center",
  },
  projectTitle: {
    fontSize: "1.1rem",
    fontWeight: 600,
    marginBottom: 1.5,
    fontFamily: '"Poppins", sans-serif',
    color: "white",
    letterSpacing: "0.02em",
  },
  projectDescription: {
    fontSize: "0.85rem",
    color: "rgba(255, 255, 255, 0.7)",
    maxWidth: "90%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    fontFamily: '"Inter", sans-serif',
    lineHeight: 1.4,
  },
  logoText: {
    position: 'absolute',
    top: 20,
    left: 24,
    color: 'white',
    fontWeight: 700,
    fontSize: '1.2rem',
    cursor: 'pointer',
    fontFamily: '"Poppins", sans-serif',
    letterSpacing: '0.06em',
    userSelect: 'none',
    '&:hover': {
      opacity: 0.9,
    },
  },
};
