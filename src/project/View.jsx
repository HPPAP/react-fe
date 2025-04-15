import { useState, useEffect } from "react";
import { Stack, Typography } from "@mui/material";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

export default function Main() {
  const { project } = useOutletContext();
  const [stage, set_stage] = useState(0);
  const [pages, set_pages] = useState([]);

  const sx = {
    wrapper: { width: 1 },
    container: { width: 1, border: 1 },
  };
  return (
    <Stack sx={sx.wrapper} spacing={2}>
      <Typography>TITLE: {project.title}</Typography>
      <Typography>DESCRIPTION: {project.description}</Typography>
      <Stack>
        <Typography>PAGES:</Typography>
        {project.pages.map((e, i) => (
          <Typography key={i}>
            {i}. {e}
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
}
