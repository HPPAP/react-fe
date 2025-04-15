import { useState, useEffect } from "react";
import { Stack, Typography, TextField } from "@mui/material";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

export default function Main() {
  const { project } = useOutletContext();
  const [title, set_title] = useState(project.title);
  const [description, set_description] = useState(project.description);

  const sx = {
    wrapper: { width: 1, border: 1 },
    container: { width: 1, border: 1 },
    bottom: {},
    btn: {
      p: 1,
      cursor: "pointer",
      "&:hover": { backgroundColor: "lightgrey" },
    },
  };

  function submit() {
    axios({
      method: "post",
      url: `${import.meta.env.VITE_BE_URL}/api/project/update`,
      headers: { "Content-Type": "application/json" },
      data: { id: project._id, title, description },
    })
      .then((response) => console.log(response.data))
      .catch((error) => console.log(error));
  }

  function cancel() {
    set_title(project.title);
    set_description(project.description);
  }

  return (
    <Stack sx={sx.wrapper}>
      <Typography>Title</Typography>
      <TextField
        value={title}
        onChange={(event) => {
          set_title(event.target.value);
        }}
      />

      <Typography>Description</Typography>
      <TextField
        value={description}
        onChange={(event) => {
          set_description(event.target.value);
        }}
      />

      <Stack direction="row" spacing={1} sx={sx.bottom}>
        <Typography sx={sx.btn} onClick={submit}>
          Save
        </Typography>
        <Typography sx={sx.btn} onClick={cancel}>
          Cancel
        </Typography>
      </Stack>
    </Stack>
  );
}
