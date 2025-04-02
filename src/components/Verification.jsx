import { useState, useEffect, use } from "react";
import { Stack, Typography, TextField, Button, Box } from "@mui/material";
import { IconButton } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import RemoveIcon from "@mui/icons-material/Remove";
import "../App.css";
import { Link, useParams, useLocation } from "react-router-dom";

export default function Verification({ i, panels, next, cooper }) {
  const panel = panels[i];
  return (
    <>
      <Stack
        direction={"row"}
        spacing={5}
        justifyContent={"center"}
        marginTop={5}
      >
        {/* Stack 1: Searched Text */}
        <Stack sx={sx.boxBorder}>
          <Box sx={sx.textContainer}>{panel.text}</Box>
        </Stack>
        {/* Stack 1: PDF Image */}
        <Stack sx={sx.boxBorder}>
          <Box
            sx={{
              width: 400,
              height: 600,
            }}
          >
            <img
              src={panel.image_url}
              alt="this aint working brah"
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
        </Stack>
      </Stack>
      <Stack
        direction={"row"}
        justifyContent={"center"}
        marginTop={3}
        spacing={5}
      >
        <IconButton
          onClick={next}
          sx={{ ...sx.circleButton, backgroundColor: "green" }}
        >
          <CheckIcon sx={sx.icon} />
        </IconButton>
        {/* <IconButton sx={{ ...sx.circleButton, backgroundColor: "red" }}>
          <CloseIcon sx={sx.icon} />
        </IconButton>
        <IconButton sx={{ ...sx.circleButton, backgroundColor: "yellow" }}>
          <RemoveIcon sx={sx.icon} />
        </IconButton> */}
      </Stack>
      <Stack
        direction={"row"}
        justifyContent="flex-end"
        marginTop={-7}
        marginRight={5}
      >
        <Button
          onClick={cooper}
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
  boxBorder: {
    width: 400,
    height: 600,
    border: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
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
    height: 600,
    width: 400,
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
