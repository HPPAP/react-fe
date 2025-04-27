import { useState } from "react";
import { Stack, Typography, TextField, Button } from "@mui/material";
import axios from "axios";
import { useOutletContext, useNavigate } from "react-router-dom";

export default function Settings() {
  const { project } = useOutletContext();
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const navigate = useNavigate();

  const sx = {
    wrapper: { width: 1, p: 4, borderRadius: 2 },
    field: {
      width: 1,
      mb: 2,
      "& .MuiOutlinedInput-root": {
        "& fieldset": { borderColor: "white" },
        "&:hover fieldset": { borderColor: "white" },
        "&.Mui-focused fieldset": { borderColor: "white" },
        "& input": { color: "white" },
        "& input::placeholder": { color: "white", opacity: 1 },
      },
    },
    btnRow: { display: "flex", gap: 2 },
  };

  function submit() {
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
        _id: project._id,
        title,
        description,
      })
      .then(() => {
        navigate("/projects", { replace: true });
      })
      .catch((err) => console.error("Save failed", err));
  }

  function cancel() {
    setTitle(project.title);
    setDescription(project.description);
  }

  function handleDelete() {
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project/delete`, {
        _id: project._id,
      })
      .then(() => {
        navigate("/projects", { replace: true });
      })
      .catch((err) => console.error("Delete failed", err));
  }

  return (
    <Stack sx={sx.wrapper} spacing={2}>
      <Typography variant="h6">Title</Typography>
      <TextField
        value={title}
        placeholder="Enter title"
        onChange={(e) => setTitle(e.target.value)}
        sx={sx.field}
        variant="outlined"
        fullWidth
      />

      <Typography variant="h6">Description</Typography>
      <TextField
        value={description}
        placeholder="Enter description"
        onChange={(e) => setDescription(e.target.value)}
        sx={sx.field}
        variant="outlined"
        fullWidth
      />

      <Stack direction="row" sx={sx.btnRow}>
        <Button variant="contained" color="primary" onClick={submit}>
          Save
        </Button>
        <Button variant="contained" color="primary" onClick={cancel}>
          Cancel
        </Button>
        <Button variant="contained" color="secondary" onClick={handleDelete}>
          Delete
        </Button>
      </Stack>
    </Stack>
  );
}
