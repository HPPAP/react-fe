import { useState, useEffect, use } from "react";
import { Stack, Typography, TextField, Button, Box } from "@mui/material";
import { IconButton } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import "../App.css";
import { Link } from "react-router-dom";

export default function Verification({
  i,
  panels,
  correct_next,
  overview,
  fail_next,
  move_next,
}) {
  const panel = panels[i];

  return (
    <>
      <Stack sx={sx.compareStack}>
        {/* Stack 1: Searched Text */}
        <Stack sx={sx.boxBorder}>
          <Box sx={sx.textContainer}>{panel.text}</Box>
        </Stack>
        {/* Stack 2: PDF Image */}
        <Stack sx={sx.boxBorder}>
          <Box sx={sx.pdfBorder}>
            <img
              src={panel.image_url}
              alt="picture aint loading brah"
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
        </Stack>
      </Stack>
      <Stack sx={sx.buttonsStack}>
        <IconButton
          onClick={correct_next} // highlight panel green and move to next page
          sx={{ ...sx.circleButton, backgroundColor: "green" }}
        >
          <CheckIcon sx={sx.icon} />
        </IconButton>
        <IconButton
          // sx={{ ...sx.circleButton, backgroundColor: "red" }}
          onClick={fail_next} // Call highlight callback when red button is clicked
          sx={{ ...sx.circleButton, backgroundColor: "red" }}
        >
          <CloseIcon sx={sx.icon} />
        </IconButton>

        <IconButton
          onClick={move_next}
          sx={{ ...sx.circleButton, backgroundColor: "yellow" }}
        >
          <RemoveIcon sx={sx.icon} />
        </IconButton>
      </Stack>
      <Stack sx={sx.overviewStack}>
        <Button
          onClick={overview}
          variant="outlined"
          component={Link}
          to="/Results"
        >
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
  },

  boxBorder: {
    width: 400,
    height: 600,
    border: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  pdfBorder: {
    width: 400,
    height: 600,
  },

  circleButton: {
    border: 1,
    width: 100,
    height: 100,
    borderRadius: "50%",
    "&:focus": {
      outline: "none", // Removes the blue outline
    },
  },

  image: {
    width: 400,
    height: 600,
  },

  icon: {
    fontSize: 50,
  },

  textContainer: {
    width: "100%",
    height: "100%",
    overflowY: "auto", // Enables vertical scrolling
    padding: "10px", // Adds some spacing inside the box
  },
};
