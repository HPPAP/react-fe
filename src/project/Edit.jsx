// src/project/Edit.jsx

import { useState, useEffect } from "react";
import { Stack, Typography, Button } from "@mui/material";
import axios from "axios";
import { useOutletContext, useNavigate } from "react-router-dom";

export default function EditPage() {
  const { project } = useOutletContext();
  const [stage, setStage] = useState(0);
  const [pages, setPages] = useState([]);

  const sx = {
    wrapper: { width: 1, p: 4 },
    container: { width: 1, border: 1, p: 2 },
  };

  return (
    <Stack sx={sx.wrapper} spacing={2}>
      <Navigation setStage={setStage} />
      <Stack sx={sx.container}>
        {stage === 0 && <Stage0 setPages={setPages} />}
        {stage === 1 && <Stage1 pages={pages} setPages={setPages} />}
        {stage === 2 && <Stage2 pages={pages} />}
      </Stack>
    </Stack>
  );
}

function Navigation({ setStage }) {
  const navigate = useNavigate();
  const sx = {
    wrapper: { width: 1, mb: 2 },
    btn: {
      p: 1,
      cursor: "pointer",
      "&:hover": { backgroundColor: "lightgrey" },
    },
  };

  return (
    <Stack direction="row" spacing={2} sx={sx.wrapper}>
      <Typography sx={sx.btn} onClick={() => navigate("/search")}>
        Search
      </Typography>
      <Typography sx={sx.btn} onClick={() => setStage(1)}>
        Verify
      </Typography>
      <Typography sx={sx.btn} onClick={() => setStage(2)}>
        Confirm
      </Typography>
    </Stack>
  );
}

function Stage0({ setPages }) {
  useEffect(() => {
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/search`, {
        pageNumber: [],
        volume: [],
        topics: [],
        keywords: ["tax"],
        year: "1642-44",
      })
      .then((res) => setPages(res.data.results.results))
      .catch((err) => console.error(err));
  }, [setPages]);

  return (
    <Typography>
      HARD-CODED SEARCH:
      {`{ pageNumber: [], volume: [], topics: [], keywords: ["tax"], year: "1642-44" }`}
    </Typography>
  );
}

function Stage1({ pages, setPages }) {
  const { project } = useOutletContext();
  const sx = {
    btn: {
      p: 1,
      cursor: "pointer",
      "&:hover": { backgroundColor: "lightgrey" },
    },
  };

  const submit = () => {
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
        id: project._id,
        pages: pages.map((p) => p._id),
      })
      .then((res) => console.log("Saved:", res.data))
      .catch((err) => console.error(err));
  };

  const cancel = () => setPages([]);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <Typography sx={sx.btn} onClick={submit}>
          Save
        </Typography>
        <Typography sx={sx.btn} onClick={cancel}>
          Cancel
        </Typography>
      </Stack>
      {pages.map((p, i) => (
        <Typography key={i}>
          {i + 1}. {p._id}
        </Typography>
      ))}
    </Stack>
  );
}

function Stage2({ pages }) {
  const navigate = useNavigate();
  const pageIds = pages.map((p) => p._id);

  return (
    <Stack spacing={3} alignItems="center">
      <Typography variant="h6">
        You’ve selected {pages.length} page{pages.length !== 1 && "s"}.
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate("/results", { state: { pageIds } })}
      >
        Verify Pages
      </Button>
    </Stack>
  );
}
