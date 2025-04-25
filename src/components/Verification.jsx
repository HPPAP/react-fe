import { useState, useEffect } from "react";
import { Stack, Typography, TextField, Button, Box } from "@mui/material";
import "../App.css";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function Verification({
  i,
  panels,
  overview,
  correct_next,
  fail_next,
  keywords = [],
}) {
  const { page_id, id } = useParams();
  const [panel, set_panel] = useState();
  const [zoomLevel, setZoomLevel] = useState(1);

  const [curr_pages, set_curr_pages] = useState();

  useEffect(() => {
    setZoomLevel(1);

    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/page/get`, { _id: page_id })
      .then((response) => {
        set_panel(response.data.page);
      })
      .catch((error) => console.log(error));
  }, [panel]);

  useEffect(() => {
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project`, { _id: id })
      .then((res) => {
        set_curr_pages(res.data.project.pages);
      });
  }, []);

  function add() {
    const updated = [...new Set([...curr_pages, page_id])];
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
        _id: id,
        pages: updated,
      })
      .then(() => set_curr_pages(updated))
      .catch((err) => console.error("Save failed", err));
  }

  function remove() {
    const updated = curr_pages.filter((x) => x !== page_id);
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
        _id: id,
        pages: updated,
      })
      .then(() => set_curr_pages(updated))
      .catch((err) => console.error("Save failed", err));
  }

  const handleWheel = (event) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      const delta = event.deltaY > 0 ? 0.9 : 1.1;
      setZoomLevel((prev) => Math.min(Math.max(prev * delta, 0.5), 3));
    }
  };

  const highlightKeywords = (text) => {
    if (!keywords.length) return text;
    const parts = text.split(new RegExp(`(${keywords.join("|")})`, "gi"));
    return parts.map((part, idx) =>
      keywords.some((kw) => kw.toLowerCase() === part.toLowerCase()) ? (
        <mark key={idx}>{part}</mark>
      ) : (
        part
      )
    );
  };

  if (!panel) return null;
  return (
    <>
      <Stack sx={sx.compareStack}>
        <Stack sx={sx.boxBorder}>
          <Box sx={sx.textContainer}>{highlightKeywords(panel.text)}</Box>
        </Stack>
        <Stack sx={sx.boxBorder}>
          <Box sx={sx.pdfBorder} onWheel={handleWheel}>
            <img
              src={panel.image_url}
              alt="document preview"
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: "top left",
                width: "100%",
                height: "auto",
                transition: "transform 0.1s ease-out",
              }}
            />
          </Box>
        </Stack>
      </Stack>

      <Stack sx={sx.buttonsStack}>
        <Button variant="contained" onClick={add} sx={sx.button}>
          Save
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={remove}
          sx={sx.button}
        >
          Delete
        </Button>
      </Stack>

      <Stack sx={sx.overviewStack}>
        <Button variant="outlined" component={Link} to={`/project/${id}/edit`}>
          Overview
        </Button>
      </Stack>
    </>
  );
}

const sx = {
  compareStack: {
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    ml: 20,
    mt: 5,
  },
  overviewStack: {
    flexDirection: "row",
    justifyContent: "flex-end",
    mt: -7,
    mr: 5,
  },
  buttonsStack: {
    flexDirection: "row",
    justifyContent: "center",
    mt: 5,
    gap: 3,
    ml: 20,
  },
  boxBorder: {
    width: 700,
    height: 600,
    border: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  pdfBorder: {
    width: "100%",
    height: 600,
    overflow: "auto",
    cursor: "zoom-in",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  textContainer: {
    width: "100%",
    height: "100%",
    overflowY: "auto",
    padding: "10px",
  },
  button: {
    textTransform: "none",
    px: 3,
    py: 1,
  },
};
