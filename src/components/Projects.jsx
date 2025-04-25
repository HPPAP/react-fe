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
      {/* Header */}
      <Box sx={sx.header}>
        <Typography sx={sx.headerTitle}>All Projects</Typography>

        <TextField
          placeholder="Search"
          variant="outlined"
          sx={sx.searchField}
        />

        <Button component={Link} to="/" variant="outlined" sx={sx.homeButton}>
          Home
        </Button>
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
            <Typography sx={sx.projectLabel}>
              {i}. {project.title} — {project.description}
            </Typography>
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
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
  },
  searchField: {
    width: "35%",
    "& .MuiOutlinedInput-root": {
      // default white border
      "& fieldset": {
        borderColor: "white",
      },
      // on hover show blue
      "&:hover fieldset": {
        borderColor: "#45b6fe",
      },
      // on focus also blue
      "&.Mui-focused fieldset": {
        borderColor: "#45b6fe",
      },
      // placeholder text color
      "& input::placeholder": {
        color: "lightgrey",
        opacity: 1,
      },
      // input text color
      "& input": {
        color: "white",
      },
    },
  },
  homeButton: {
    textTransform: "none",
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
  },
  createButton: {
    width: 200,
    height: 200,
    textTransform: "none",
  },
  createIcon: {
    fontSize: 100,
  },
  createLabel: {
    mt: 1,
  },
  projectBox: {
    width: 200,
    height: 200,
    border: "1px solid #ccc",
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    ml: 2,
    "&:hover": {
      borderColor: "#45b6fe",
      boxShadow: "0px 4px 8px rgba(0,0,0,0.2)",
    },
  },
  projectLabel: {
    textAlign: "center",
    px: 1,
  },
};
