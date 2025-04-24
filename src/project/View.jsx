import { useState, useEffect } from "react";
import { Stack, Typography } from "@mui/material";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

export default function Main() {
  const { project } = useOutletContext();
  const [stage, set_stage] = useState(0);
  const [pages, set_pages] = useState(project.page_docs);

  const sx = {
    wrapper: { width: 1 },
    container: { width: 1, border: 1 },
  };
  console.log(project);
  return (
    <Stack sx={sx.wrapper} spacing={2}>
      <Typography>TITLE: {project.title}</Typography>
      <Typography>DESCRIPTION: {project.description}</Typography>
      <Stack>
        {pages.map((e, i) => (
          <Stack key={i} direction="row" spacing={2}>
            <Typography>{e.volume_title}</Typography>
            <Typography>{e.page_number}</Typography>

            <Typography>{e.text.slice(0, 40)}</Typography>
            {/* // _ID OR id */}

            {project.pages.includes(e.id) ? (
              <Typography>Del</Typography>
            ) : (
              <Typography>Add</Typography>
            )}
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
