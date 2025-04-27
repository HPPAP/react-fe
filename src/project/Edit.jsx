import { useState, useEffect } from "react";
import {
  Stack,
  Typography,
  Button,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import axios from "axios";
import { useOutletContext, useNavigate, useParams } from "react-router-dom";

export default function EditPage() {
  const [pages, set_pages] = useState([]);

  const sx = { wrapper: { width: 1 }, container: { width: 1, border: 1 } };

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
  const [curr_pages, set_curr_pages] = useState(project.pages);

  const navigate = useNavigate();
  const { id: projectId } = useParams();

  function add(id) {
    const updated = [...new Set([...curr_pages, id])];
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
        _id: project._id,
        pages: updated,
      })
      .then(() => set_curr_pages(updated))
      .catch((err) => console.error("Save failed", err));
  }

  function remove(id) {
    const updated = curr_pages.filter((x) => x !== id);
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
        _id: project._id,
        pages: updated,
      })
      .then(() => set_curr_pages(updated))
      .catch((err) => console.error("Save failed", err));
  }

  return (
    <Stack>
      {/* {JSON.stringify(curr_pages)} */}
      {pages.map((e, i) => (
        <Stack
          key={i}
          direction="row"
          spacing={2}
          justifyContent={"space-between"}
        >
          <Typography sx={{ width: 50 }}>{i + 1}. </Typography>
          <Typography sx={{ width: 100 }}>{e.volume_title}</Typography>
          <Typography sx={{ width: 20 }}>{e.page_number}</Typography>
          <Typography sx={{ width: 700 }}>{e.text.slice(0, 40)}</Typography>
          {/* // _ID OR id */}
          {curr_pages.includes(e._id) ? (
            <Typography
              sx={{
                border: "1px solid",
                borderColor: "success.main",
                bgcolor: "success.light",
                borderRadius: 1,
                px: 1,
                py: 0.5,
                display: "inline-block",
                width: 60,
              }}
            >
              ADDED
            </Typography>
          ) : (
            <Typography
              sx={{
                border: "1px solid",
                borderColor: "error.main",
                bgcolor: "error.light",
                borderRadius: 1,
                px: 1,
                py: 0.5,
                display: "inline-block",
                width: 60,
              }}
            >
              NOT IN
            </Typography>
          )}
          <Button
            variant="contained"
            size="small"
            onClick={() => navigate(`/project/${projectId}/verify/${e._id}`)}
          >
            Verify
          </Button>
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
    button: {
      textTransform: "none",
      height: 40,
    },
    input: {
      backgroundColor: "white",
      borderRadius: 1,
      width: 250,
      "& .MuiOutlinedInput-root": {
        "& fieldset": { borderColor: "#ccc" },
        "&:hover fieldset": { borderColor: "#888" },
        "&.Mui-focused fieldset": { borderColor: "#45b6fe" },
      },
    },
    select: {
      height: 40,
      backgroundColor: "white",
      "& .MuiOutlinedInput-notchedOutline": {
        borderColor: "#ccc",
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "#888",
      },
      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#45b6fe",
      },
    },
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
    <Stack sx={sx.wrapper} direction="row" spacing={2} alignItems="center">
      <Select
        value={year}
        onChange={(e) => set_year(e.target.value)}
        autoWidth
        sx={sx.select}
      >
        {YEARS.map((e, i) => (
          <MenuItem key={i} value={e}>
            {e}
          </MenuItem>
        ))}
      </Select>

      <TextField
        value={keywords}
        onChange={(e) => set_keywords(e.target.value)}
        placeholder="Enter keywords (comma-separated)"
        variant="outlined"
        size="small"
        sx={sx.input}
      />

      {/* <Typography onClick={submit}>SUBMIT</Typography> */}
      <Button variant="contained" sx={sx.button} onClick={submit}>
        SEARCH
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
