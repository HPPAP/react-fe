import { useState } from "react";
import { Stack, Typography, TextField, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar, Alert } from "@mui/material";
import axios from "axios";
import { useOutletContext, useNavigate } from "react-router-dom";

export default function Settings() {
  const { project } = useOutletContext();
  const [title, setTitle] = useState(project.title);
  const [description, setDescription] = useState(project.description);
  const navigate = useNavigate();
  
  // State for delete confirmation modal
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  // State for success notification
  const [saveSuccess, setSaveSuccess] = useState(false);

  const sx = {
    wrapper: { 
      width: 1, 
      p: 4, 
      borderRadius: 2,
      maxWidth: '800px',
      mx: 'auto'
    },
    title: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      color: 'white',
      mb: 1,
    },
    field: {
      width: 1,
      mb: 3,
      "& .MuiOutlinedInput-root": {
        borderRadius: 1.5,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        transition: 'all 0.2s',
        "& fieldset": { 
          borderColor: "rgba(255, 255, 255, 0.3)",
          borderWidth: 1.5,
        },
        "&:hover fieldset": { 
          borderColor: "rgba(255, 255, 255, 0.6)" 
        },
        "&.Mui-focused fieldset": { 
          borderColor: "#4d94ff",
          borderWidth: 1.5,
        },
        "& input": { 
          color: "white",
          padding: '14px 16px',
          fontFamily: '"Inter", sans-serif',
        },
        "& textarea": { 
          color: "white",
          fontFamily: '"Inter", sans-serif',
        },
        "& input::placeholder": { 
          color: "rgba(255, 255, 255, 0.7)", 
          opacity: 1,
          fontFamily: '"Inter", sans-serif',
        },
      },
    },
    btnRow: { 
      display: "flex", 
      gap: 2,
      mt: 2,
    },
    saveBtn: {
      bgcolor: "#4d94ff",
      color: "white",
      px: 3,
      py: 1.2,
      borderRadius: 2,
      textTransform: "none",
      fontWeight: 600,
      fontFamily: '"Inter", sans-serif',
      letterSpacing: "0.02em",
      boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.2)",
      transition: "all 0.2s",
      "&:hover": {
        bgcolor: "#3a7dd6",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
      },
    },
    deleteBtn: {
      bgcolor: "#f44336",
      color: "white",
      px: 3,
      py: 1.2,
      borderRadius: 2,
      textTransform: "none",
      fontWeight: 600,
      fontFamily: '"Inter", sans-serif',
      letterSpacing: "0.02em",
      boxShadow: "0px 3px 8px rgba(0, 0, 0, 0.2)",
      transition: "all 0.2s",
      ml: "auto", // Push to right end
      "&:hover": {
        bgcolor: "#d32f2f",
        boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)",
      },
    },
    dialogPaper: {
      bgcolor: '#2b2d30',
      color: 'white',
      borderRadius: 2,
      padding: 2,
    },
    dialogTitle: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
    },
    dialogContent: {
      color: 'rgba(255, 255, 255, 0.85)',
      fontFamily: '"Inter", sans-serif',
    },
    dialogBtn: {
      textTransform: 'none',
      fontFamily: '"Inter", sans-serif',
      fontWeight: 500,
    },
    dialogDeleteBtn: {
      bgcolor: "#f44336",
      color: "white",
      "&:hover": {
        bgcolor: "#d32f2f",
      },
    },
  };

  function submit() {
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
        _id: project._id,
        title,
        description,
      })
      .then(() => {
        // Show success notification
        setSaveSuccess(true);
        
        // Stay in the same component (no navigation)
      })
      .catch((err) => console.error("Save failed", err));
  }

  function confirmDelete() {
    setDeleteDialogOpen(true);
  }
  
  function handleDeleteConfirm() {
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project/delete`, {
        _id: project._id,
      })
      .then(() => {
        navigate("/projects", { replace: true });
      })
      .catch((err) => console.error("Delete failed", err));
  }
  
  function handleCloseDialog() {
    setDeleteDialogOpen(false);
  }
  
  function handleCloseSnackbar() {
    setSaveSuccess(false);
  }

  return (
    <>
      <Stack sx={sx.wrapper} spacing={2}>
        <Typography variant="h6" sx={sx.title}>Title</Typography>
        <TextField
          value={title}
          placeholder="Enter title"
          onChange={(e) => setTitle(e.target.value)}
          sx={sx.field}
          variant="outlined"
          fullWidth
        />

        <Typography variant="h6" sx={sx.title}>Description</Typography>
        <TextField
          value={description}
          placeholder="Enter description"
          onChange={(e) => setDescription(e.target.value)}
          sx={sx.field}
          variant="outlined"
          fullWidth
          multiline
          rows={3}
        />

        <Stack direction="row" sx={sx.btnRow}>
          <Button variant="contained" color="primary" onClick={submit} sx={sx.saveBtn}>
            Save
          </Button>
          <Button variant="contained" color="secondary" onClick={confirmDelete} sx={sx.deleteBtn}>
            Delete Project
          </Button>
        </Stack>
      </Stack>
      
      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: sx.dialogPaper
        }}
      >
        <DialogTitle sx={sx.dialogTitle}>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText sx={sx.dialogContent}>
            Are you sure you want to delete this project? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} sx={sx.dialogBtn}>
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            sx={{...sx.dialogBtn, ...sx.dialogDeleteBtn}}
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Success Notification */}
      <Snackbar
        open={saveSuccess}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          variant="filled"
          sx={{ fontFamily: '"Inter", sans-serif', fontWeight: 500 }}
        >
          Project saved successfully!
        </Alert>
      </Snackbar>
    </>
  );
}
