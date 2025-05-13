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
      <Typography 
        variant="h4" 
        sx={sx.logoText}
        onClick={() => navigate("/")}
      >
        PROXIMUS
      </Typography>
      
      <Button 
        variant="outlined"
        onClick={() => navigate("/projects")}
        sx={sx.projectsButton}
      >
        Projects
      </Button>
      
      <Stack sx={sx.layoutWrapper}>
        <Box sx={sx.headerContainer}>
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
    <Box sx={{ display: "flex", alignItems: "center", mb: 1.5, ml: 3 }}>
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
          Search
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
    </Box>
  );
}

const sx = {
  layoutWrapper: {
    width: "100%",
    my: 2,
    mt: 6,
  },
  headerContainer: {
    position: 'relative',
    width: '100%',
    mb: 3.5,
    pl: 3,
  },
  titleContainer: {
    textAlign: 'center',
    mb: 1,
    pt: 0,
  },
  projectTitle: {
    fontWeight: 600,
    fontSize: '2rem',
    mb: 0.5,
    color: 'white',
    fontFamily: '"Poppins", sans-serif',
    letterSpacing: '0.02em',
  },
  projectDescription: {
    color: 'white',
    mb: 2,
    maxWidth: '80%',
    mx: 'auto',
    opacity: 0.85,
    fontFamily: '"Inter", sans-serif',
    fontSize: '1rem',
    letterSpacing: '0.01em',
    lineHeight: 1.5,
    fontWeight: 300,
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
    backgroundColor: "transparent",
    width: "auto",
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
  projectsButton: {
    position: 'absolute',
    top: 60,
    left: 30,
    color: 'white',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    padding: '6px 12px',
    fontSize: '0.875rem',
    textTransform: 'none',
    fontWeight: 500,
    fontFamily: '"Poppins", sans-serif',
    letterSpacing: '0.02em',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderColor: 'rgba(255, 255, 255, 0.5)',
    }
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
