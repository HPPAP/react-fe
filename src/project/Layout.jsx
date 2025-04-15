import { useState, useEffect } from "react";
import { Stack, Typography } from "@mui/material";
import axios from "axios";

import { Outlet, useNavigate, useParams } from "react-router-dom";

export default function Main() {
  const { id } = useParams();

  const [project, set_project] = useState();

  useEffect(() => {
    axios({
      method: "post",
      url: `${import.meta.env.VITE_BE_URL}/api/project`,
      headers: { "Content-Type": "application/json" },
      data: { id },
    })
      .then((response) => set_project(response.data.project))
      .catch((error) => console.log(error));
  }, [id]);

  const sx = {
    wrapper: { minWidth: 1000, height: 1, mx: 5, my: 2 },
    container: { width: 1 },
  };
  return (
    <Stack sx={sx.wrapper} spacing={2}>
      <Navigation id={id} />
      <Stack sx={sx.container}>
        {project && <Outlet context={{ project }} />}
      </Stack>
    </Stack>
  );
}

function Navigation({ id }) {
  const navigate = useNavigate();
  const sx = {
    wrapper: { width: 1, height: 1, border: 1 },
    btn: {
      p: 1,
      cursor: "pointer",
      "&:hover": { backgroundColor: "lightgrey" },
    },
  };
  return (
    <Stack direction="row" spacing={1} sx={sx.wrapper}>
      <Typography sx={sx.btn} onClick={() => navigate("/projects")}>
        Home
      </Typography>
      <Typography sx={sx.btn} onClick={() => navigate(``)}>
        View
      </Typography>
      <Typography onClick={() => navigate("edit")} sx={sx.btn}>
        Edit
      </Typography>
      <Typography onClick={() => navigate("settings")} sx={sx.btn}>
        Settings
      </Typography>
    </Stack>
  );
}
