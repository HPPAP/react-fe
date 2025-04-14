import { useState, useEffect } from "react";
import { Stack, Typography, TextField, Button, Box } from "@mui/material";
import { Link } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import "../App.css";

export default function Projects() {
  const [projects, setProjects] = useState([]);

  const addNewProject = () => {
    const newProject = { id: Date.now(), name: "New Project" };
    setProjects([...projects, newProject]);
  };

  return (
    <>
      <Stack spacing={5}>
        <Stack direction="row" spacing={2} justifyContent={"center"}>
          <Typography>All Projects</Typography>
          <TextField
            id="outlined-basic"
            label="Search"
            variant="outlined"
            sx={sx.textField}
          ></TextField>
          <Button variant="outlined" component={Link} to="/">
            Home
          </Button>
        </Stack>
        {/* /* Create New and Project Boxes in a Row */}
        <Stack
          direction="row"
          spacing={2}
          flexWrap="wrap"
          justifyContent={"flex-start"}
        >
          <Stack alignItems="center">
            <Button
              variant="outlined"
              onClick={addNewProject}
              sx={sx.createButton}
            >
              <AddIcon sx={{ fontSize: 100 }} />
            </Button>
            <Typography>Create New</Typography>
          </Stack>

          {/* Render dynamically created project boxes */}
          {projects.map((project) => (
            <Box key={project.id} sx={sx.projectBox}>
              <Typography>{project.name}</Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </>
  );
}

const sx = {
  textField: {
    width: "35%",
    marginLeft: "auto",
    marginRight: "auto",
    paddingBottom: 0,
    marginTop: 0,
    fontWeight: 500,
    "& .MuiOutlinedInput-root": {
      color: "white",
    },
  },

  createProjectBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center", // Aligns children to the left
    width: "fit-content", // Ensures the box is only as wide as its content
  },

  createButton: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    fontSize: "large",
    "&:focus": {
      outline: "none", // Removes the blue outline
    },
  },

  projectBox: {
    width: 200,
    height: 200,
    border: "1px solid #ccc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 2,
    "&:hover": {
      backgroundColor: "transparent", // Change background color on hover
      borderColor: "#45b6fe",
      cursor: "pointer", // Show pointer cursor on hover
      //   transform: "scale(1.05)", // Slightly enlarge the box
      transition: "all 0.3s ease", // Smooth transition effect
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)", // Add shadow
    },
  },
};
