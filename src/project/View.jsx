import { useState, useEffect } from "react";
import { 
  Stack, 
  Typography, 
  Paper, 
  IconButton, 
  Card, 
  CardContent, 
  Box, 
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
  Slide,
  Chip
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "axios";
import { useOutletContext, useNavigate, useParams } from "react-router-dom";

export default function Main() {
  const { project } = useOutletContext();
  const [page_docs, set_page_docs] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    pageId: null,
    pageTitle: "",
    pageNumber: ""
  });
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success"
  });
  
  const navigate = useNavigate();
  const { id: projectId } = useParams();

  const sx = { 
    wrapper: { 
      width: 1, 
      padding: 3
    }, 
    pageCard: {
      transition: "all 0.2s ease-in-out",
      '&:hover': {
        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.1)',
        cursor: 'pointer',
        backgroundColor: '#f5f5f5'
      },
      marginBottom: 1.5,
      borderRadius: 1
    },
    pageContent: {
      padding: "12px 16px !important", // Make the card content thinner
    },
    deleteIcon: {
      color: 'text.secondary',
      '&:hover': {
        color: 'error.main'
      },
      zIndex: 10
    },
    filterContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2
    }
  };

  useEffect(() => {
    set_page_docs(project.page_docs);
  }, [project]);
  
  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({...notification, open: false});
  };

  function openRemoveConfirmation(id, volumeTitle, pageNumber, event) {
    // Prevent navigation when clicking the delete button
    if (event) {
      event.stopPropagation();
    }
    
    setConfirmDialog({
      open: true,
      pageId: id,
      pageTitle: volumeTitle,
      pageNumber: pageNumber
    });
  }
  
  function closeConfirmDialog() {
    setConfirmDialog({...confirmDialog, open: false});
  }

  function confirmRemove() {
    const { pageId, pageTitle } = confirmDialog;
    
    const updated = page_docs.filter((x) => x._id !== pageId);
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
        _id: project._id,
        pages: updated.map((x) => x._id),
      })
      .then(() => {
        set_page_docs(updated);
        // Show notification
        setNotification({
          open: true,
          message: `Removed page from ${pageTitle} from project`,
          type: "error"
        });
        
        // Close dialog
        closeConfirmDialog();
      })
      .catch((err) => {
        console.error("Save failed", err);
        setNotification({
          open: true,
          message: "Failed to remove page from project",
          type: "error"
        });
        
        // Close dialog
        closeConfirmDialog();
      });
  }
  
  // Sort pages by page number
  const sortedPages = [...page_docs].sort((a, b) => {
    return parseInt(a.page_number) - parseInt(b.page_number);
  });
  
  // Navigate to verify page
  const navigateToVerify = (pageId, index) => {
    // Store all pages in sessionStorage before navigating
    sessionStorage.setItem('allPages', JSON.stringify(page_docs));
    sessionStorage.setItem('currentPageIndex', index.toString());
    
    navigate(`/project/${projectId}/verify/${pageId}`);
  };

  return (
    <Container maxWidth="lg">
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm Page Removal"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {`Are you sure you want to remove this page from ${confirmDialog.pageTitle} (page ${confirmDialog.pageNumber}) from your project?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmRemove} color="error" autoFocus>
            Remove
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={2000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
      
      <Stack sx={sx.wrapper} spacing={3}>
        <Box sx={sx.filterContainer}>
          <Typography variant="h6">
            Saved Pages ({page_docs.length})
          </Typography>
        </Box>

        <Stack spacing={1.5}>
          {sortedPages.map((doc, index) => (
            <Card 
              key={index} 
              sx={sx.pageCard} 
              elevation={1}
              onClick={() => navigateToVerify(doc._id, index)}
            >
              <CardContent sx={sx.pageContent}>
                <Box display="flex" alignItems="center">
                  <Box flexGrow={1}>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 2, width: 30 }}>
                        {index + 1}.
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2 }}>
                        Page {doc.page_number}
                      </Typography>
                      <Chip 
                        label="ADDED" 
                        size="small" 
                        sx={{
                          backgroundColor: "primary.light",
                          color: "primary.dark",
                          fontWeight: "medium",
                          borderColor: "primary.main",
                          border: 1,
                          ml: 2
                        }}
                      />
                    </Box>
                    
                    <Typography variant="body2" sx={{ mt: 0.5, ml: 4 }}>
                      {doc.text.length > 120 
                        ? `${doc.text.slice(0, 120)}...` 
                        : doc.text}
                    </Typography>
                  </Box>
                  
                  <IconButton 
                    size="small" 
                    onClick={(e) => openRemoveConfirmation(doc._id, doc.volume_title, doc.page_number, e)} 
                    sx={sx.deleteIcon}
                    aria-label="delete"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
        
        {page_docs.length === 0 && (
          <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
            <Typography variant="body1" color="text.secondary">
              No pages saved yet
            </Typography>
          </Paper>
        )}
      </Stack>
    </Container>
  );
}
