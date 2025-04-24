// src/project/Edit.jsx

import { useState, useEffect } from "react";
import {
  Stack,
  Typography,
  Button,
  Popover,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useOutletContext, useNavigate } from "react-router-dom";

export default function EditPage() {
  const { project } = useOutletContext();
  const [pages, set_pages] = useState([]);

  const sx = {
    wrapper: { width: 1 },
    container: { width: 1, border: 1 },
  };

  return (
    <Stack sx={sx.wrapper} spacing={2}>
      <Stack sx={sx.container}>
        <Controls set_pages={set_pages} />

        <List pages={pages} />
      </Stack>
    </Stack>
  );
}

function List({ pages }) {
  const { project } = useOutletContext();
  console.log(project);

  return (
    <Stack>
      {pages.map((e, i) => (
        <Stack key={i} direction="row" spacing={2}>
          <Typography>{e.volume_title}</Typography>
          <Typography>{e.page_number}</Typography>
          <Typography>{e.text.slice(0, 40)}</Typography>
          {/* // _ID OR id */}
          {project.pages.includes(e._id) ? (
            <Typography>Del</Typography>
          ) : (
            <Typography>Add</Typography>
          )}
        </Stack>
      ))}
    </Stack>
  );
}

function Controls({ set_pages }) {
  const [year, set_year] = useState(YEARS[0]);
  const [keywords, set_keywords] = useState("");

  const sx = {
    wrapper: { border: 1 },
  };

  function submit() {
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/search`, {
        pageNumber: [],
        volume: [],
        topics: [],
        keywords: keywords.split(",").map((x) => x.trim()),
        year,
      })
      .then((res) => set_pages(res.data.results.results))
      .catch((err) => console.error(err));
  }
  return (
    <Stack sx={sx.wrapper} direction="row" spacing={2}>
      <Select value={year} onChange={(e) => set_year(e.target.value)} autoWidth>
        {YEARS.map((e, i) => (
          <MenuItem key={i} value={e}>
            {e}
          </MenuItem>
        ))}
      </Select>

      <TextField
        value={keywords}
        onChange={(e) => set_keywords(e.target.value)}
      />

      <Typography onClick={submit}>SUBMIT</Typography>
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

const YEARS = [
  "1640-42",
  "1642-44",
  "1644-46",
  "1646-16",
  "1646-1648",
  "1646-48",
  "1648-16",
  "1648-1651",
  "1648-51",
  "1651-59",
  "1660-67",
  "1660-97",
  "1667-87",
  "1688-16",
  "1688-1693",
  "1693-16",
  "1693-1697",
  "1697-16",
  "1697-1699",
  "1699-17",
  "1699-1702",
  "1699-1703",
  "1705-17",
  "1705-1708",
  "1708-17",
  "1708-1711",
  "1708/11",
  "1711-14",
  "1714-17",
  "1714-1718",
  "1714-74",
  "1714/17",
  "1714/74",
  "1718-17",
  "1718-1721",
  "1718-21",
  "1727-32",
  "1737-17",
  "1737-1741",
  "1737-41",
  "1741-45",
  "1750-54",
  "1754-57",
  "1765-66",
  "1766-17",
  "1766-1768",
  "1766-67",
  "1768-70",
  "1770-72",
  "1772-74",
  "1774-18",
  "1774-1800",
  "1774-76",
  "1778-17",
  "1778-1780",
  "1780-82",
  "1784-85",
  "1786",
  "1787",
  "1787-88",
  "1788-17",
  "1788-1789",
  "1788-89",
  "1792",
  "1792-17",
  "1792-1793",
];
