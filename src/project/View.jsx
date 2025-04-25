import { useState, useEffect } from "react";
import { Stack, Typography } from "@mui/material";
import axios from "axios";
import { useOutletContext } from "react-router-dom";

export default function Main() {
  const { project } = useOutletContext();
  const [page_docs, set_page_docs] = useState([]);

  const sx = { wrapper: { width: 1 }, container: { width: 1, border: 1 } };

  useEffect(() => {
    set_page_docs(project.page_docs);
  }, [project]);

  function remove(id) {
    const updated = page_docs.filter((x) => x._id !== id);
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
        _id: project._id,
        pages: updated.map((x) => x._id),
      })
      .then(() => set_page_docs(updated))
      .catch((err) => console.error("Save failed", err));
  }

  return (
    <Stack sx={sx.wrapper} spacing={2}>
      <Typography>TITLE: {project.title}</Typography>
      <Typography>DESCRIPTION: {project.description}</Typography>

      <Stack>
        {page_docs.map((e, i) => (
          <Stack key={i} direction="row" spacing={2}>
            <Typography>{i + 1}. </Typography>
            <Typography>{e.volume_title}</Typography>
            <Typography>{e.page_number}</Typography>
            <Typography>{e.text.slice(0, 40)}</Typography>
            <Typography onClick={() => remove(e._id)}>Del</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
