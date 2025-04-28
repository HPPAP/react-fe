import { useState, useEffect } from "react";
import { Stack, Typography, Box, Button, IconButton, Container } from "@mui/material";
import HomeIcon from '@mui/icons-material/Home';
import axios from "axios";
import { Outlet, useNavigate, useParams, useLocation } from "react-router-dom";

export default function ProjectLayout() {
  const location = useLocation();
  const [project, setProject] = useState(null);

  const { id } = useParams();
  useEffect(() => {
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project`, { _id: id })
      .then((res) => {
        setProject(res.data.project);
      })
      .catch((err) => console.error(err));
  }, [id, location]);

  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Stack sx={sx.layoutWrapper}>
        <Box sx={sx.headerContainer}>
          <IconButton 
            sx={sx.homeButton} 
            onClick={() => navigate("/projects")}
            aria-label="home"
          >
            <HomeIcon sx={{ color: 'white' }} />
          </IconButton>
          
          {project && (
            <Box sx={sx.titleContainer}>
              <Typography variant="h5" align="center" sx={sx.projectTitle}>
                {project.title}
              </Typography>
              <Typography variant="body2" align="center" sx={sx.projectDescription}>
                {project.description}
              </Typography>
            </Box>
          )}
        </Box>
        
        <Navigation currentPath={location.pathname} />
        
        <Stack sx={sx.contentContainer}>
          {project && <Outlet context={{ project }} />}
        </Stack>
      </Stack>
    </Container>
  );
}

function Navigation({ currentPath }) {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Extract the last part of the path to determine active button
  const activePath = currentPath.split('/').pop();

  return (
    <Stack direction="row" sx={sx.navWrapper}>
      <Typography
        variant="button"
        sx={{
          ...sx.navButton,
          ...(activePath === id || activePath === '' ? sx.activeNavButton : {})
        }}
        onClick={() => navigate("")}
      >
        View
      </Typography>
      <Typography
        variant="button"
        sx={{
          ...sx.navButton,
          ...(activePath === 'edit' ? sx.activeNavButton : {})
        }}
        onClick={() => navigate("edit")}
      >
        Edit
      </Typography>
      <Typography
        variant="button"
        sx={{
          ...sx.navButton,
          ...(activePath === 'settings' ? sx.activeNavButton : {})
        }}
        onClick={() => navigate("settings")}
      >
        Settings
      </Typography>
    </Stack>
  );
}

const sx = {
  layoutWrapper: {
    width: "100%",
    my: 4,
  },
  headerContainer: {
    position: 'relative',
    width: '100%',
    mb: 2,
    pl: 3,
  },
  homeButton: {
    position: 'absolute',
    top: 0,
    left: 3,
    zIndex: 10,
  },
  titleContainer: {
    textAlign: 'center',
    mb: 2,
    pt: 2,
  },
  projectTitle: {
    fontWeight: 'medium',
    mb: 0.5,
    color: 'white',
  },
  projectDescription: {
    color: 'white',
    mb: 2,
    maxWidth: '80%',
    mx: 'auto',
    opacity: 0.85,
  },
  contentContainer: {
    width: "100%",
  },
  navWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    border: "1px solid white",
    borderRadius: 2,
    p: 1, 
    mb: 3,
    backgroundColor: "transparent",
    width: "auto",
    alignSelf: "flex-start",
    ml: 3,
  },
  navButton: {
    color: "white",
    px: 2,
    py: 0.5,
    mx: 0.5,
    borderRadius: 1,
    cursor: "pointer",
    fontWeight: 500,
    textAlign: "center",
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.1)",
    },
  },
  activeNavButton: {
    backgroundColor: "rgba(66, 133, 244, 0.8)",
    fontWeight: 700,
    "&:hover": {
      backgroundColor: "rgba(66, 133, 244, 0.8)",
    },
  },
};
