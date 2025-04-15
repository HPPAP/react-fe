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
      <Navigation set_stage={set_stage} />
      <Stack sx={sx.container}>
        {stage === 0 && <Stage0 set_pages={set_pages} />}
        {stage === 1 && <Stage1 pages={pages} set_pages={set_pages} />}
      </Stack>
    </Stack>
  );
}

function Navigation({ set_stage }) {
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
      <Typography sx={sx.btn} onClick={() => set_stage(0)}>
        Search
      </Typography>
      <Typography sx={sx.btn} onClick={() => set_stage(1)}>
        Verify
      </Typography>
      <Typography sx={sx.btn} onClick={() => set_stage(2)}>
        Confirm
      </Typography>
    </Stack>
  );
}

function Stage0({ set_pages }) {
  useEffect(() => {
    axios({
      method: "post",
      url: `${import.meta.env.VITE_BE_URL}/api/search`,
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        pageNumber: [],
        volume: [],
        topics: [],
        keywords: ["tax"],
        year: "1642-44",
      },
    })
      .then((response) => set_pages(response.data.results.results))
      .catch((error) => console.log(error));
  }, []);

  return (
    <p>
      HARD CODED:
      {`{
        pageNumber: [],
        volume: [],
        topics: [],
        keywords: ["tax"],
        year: "1642-44"
      }`}
    </p>
  );
}

function Stage1({ pages, set_pages }) {
  const { project } = useOutletContext();

  const sx = {
    wrapper: { width: 1, height: 1, border: 1 },
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
      data: { id: project._id, pages: pages.map((e) => e._id) },
    })
      .then((response) => console.log(response.data))
      .catch((error) => console.log(error));
  }

  function cancel() {
    set_pages([]);
  }

  return (
    <Stack>
      <Stack direction="row" spacing={1} sx={sx.bottom}>
        <Typography sx={sx.btn} onClick={submit}>
          Save
        </Typography>
        <Typography sx={sx.btn} onClick={cancel}>
          Cancel
        </Typography>
      </Stack>

      {pages.map((e, i) => (
        <Typography key={i}>
          {i}. {e._id}
        </Typography>
      ))}
    </Stack>
  );
}

function Stage2() {
  return <p>Stage2</p>;
}
