import { useState, useEffect } from "react";
import { Stack, Typography } from "@mui/material";
import axios from "axios";
import { Outlet, useNavigate, useParams } from "react-router-dom";

export default function ProjectLayout() {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project`, { id })
      .then((res) => setProject(res.data.project))
      .catch((err) => console.error(err));
  }, [id]);

  return (
    <Stack sx={sx.layoutWrapper}>
      <Navigation />
      <Stack sx={sx.contentContainer}>
        {project && <Outlet context={{ project }} />}
      </Stack>
    </Stack>
  );
}

function Navigation() {
  const navigate = useNavigate();

  return (
    <Stack direction="row" sx={sx.navWrapper}>
      <Typography
        variant="button"
        sx={sx.navButton}
        onClick={() => navigate("/projects")}
      >
        Home
      </Typography>
      <Typography
        variant="button"
        sx={sx.navButton}
        onClick={() => navigate("")}
      >
        View
      </Typography>
      <Typography
        variant="button"
        sx={sx.navButton}
        onClick={() => navigate("edit")}
      >
        Edit
      </Typography>
      <Typography
        variant="button"
        sx={sx.navButton}
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
    maxWidth: 1200,
    mx: "auto",
    my: 4,
    px: 2,
  },
  contentContainer: {
    width: "100%",
  },
  navWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // spread buttons evenly
    border: "1px solid white", // white outline
    borderRadius: 2,
    p: 2,
    mb: 3,
    backgroundColor: "transparent", // remove white fill
  },
  navButton: {
    color: "white",
    px: 2,
    py: 1,
    borderRadius: 1,
    cursor: "pointer",
    fontWeight: 500,
    "&:hover": {
      backgroundColor: "rgba(255,255,255,0.1)", // subtle white hover
    },
  },
};
