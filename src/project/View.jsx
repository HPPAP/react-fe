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
  Chip,
  Tooltip
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CircularProgress from '@mui/material/CircularProgress';
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
  const [pageTexts, setPageTexts] = useState({});
  const [exportStatus, setExportStatus] = useState("idle"); // idle, loading, success, error
  
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
    },
    exportButton: {
      textTransform: 'none',
      borderRadius: 1.5,
      fontWeight: 500
    }
  };

  useEffect(() => {
    set_page_docs(project.page_docs);
    
    // Fetch full text for each page
    if (project.page_docs && project.page_docs.length > 0) {
      // Create an array of promises for all page fetches
      const fetchPromises = project.page_docs.map(doc => 
        axios.post(`${import.meta.env.VITE_BE_URL}/api/page/get`, { _id: doc._id })
          .then(response => ({
            id: doc._id,
            text: response.data.page.text
          }))
          .catch(error => {
            console.error(`Error fetching page ${doc._id}:`, error);
            return { id: doc._id, text: doc.text || "" };
          })
      );
      
      // Execute all promises in parallel
      Promise.all(fetchPromises)
        .then(results => {
          // Convert array of results to an object mapping page ID to text
          const textsMap = results.reduce((acc, { id, text }) => {
            acc[id] = text;
            return acc;
          }, {});
          
          setPageTexts(textsMap);
        })
        .catch(error => {
          console.error("Error fetching page texts:", error);
        });
    }
  }, [project]);
  
  // Find text excerpt around the keyword match and return with highlight markup
  const findExcerptWithKeyword = (fullText, pageId) => {
    // Use the full text if available, otherwise use truncated text from project
    const text = pageTexts[pageId] || fullText;
    
    // Get the keywords associated with this page
    const keywords = project.page_docs.find(doc => doc._id === pageId)?.keywords;
    
    if (!keywords || !text) return text.slice(0, 120) + "...";
    
    // Clean and split keywords
    const keywordArray = keywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(k => k);
      
    if (keywordArray.length === 0) return text.slice(0, 120) + "...";
    
    // Search for first matching keyword
    let lowestIndex = text.length;
    let matchedKeyword = "";
    
    for (const keyword of keywordArray) {
      const index = text.toLowerCase().indexOf(keyword);
      if (index !== -1 && index < lowestIndex) {
        lowestIndex = index;
        matchedKeyword = keyword;
      }
    }
    
    // If no match found, return beginning of text
    if (lowestIndex === text.length) return text.slice(0, 120) + "...";
    
    // Calculate excerpt range (show text around the matched keyword)
    const excerptStart = Math.max(0, lowestIndex - 60);
    const excerptEnd = Math.min(text.length, lowestIndex + matchedKeyword.length + 60);
    
    // Get the excerpt text
    const beforeKeyword = text.slice(excerptStart, lowestIndex);
    const keywordText = text.slice(lowestIndex, lowestIndex + matchedKeyword.length);
    const afterKeyword = text.slice(lowestIndex + matchedKeyword.length, excerptEnd);
    
    // Prepare the parts
    let prefix = excerptStart > 0 ? "..." : "";
    let suffix = excerptEnd < text.length ? "..." : "";
    
    // Return object with parts for formatting in the component
    return {
      prefix,
      beforeKeyword,
      keywordText,
      afterKeyword,
      suffix
    };
  };
  
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
    
    // Check if we have keywords for this page
    const doc = page_docs.find(doc => doc._id === pageId);
    const keywordParam = doc && doc.keywords ? `?keywords=${encodeURIComponent(doc.keywords)}` : '';
    
    navigate(`/project/${projectId}/verify/${pageId}${keywordParam}`);
  };

  // Function to handle CSV export
  const handleExportCsv = async () => {
    if (exportStatus === "loading") return;
    
    setExportStatus("loading");
    try {
      console.log("Exporting CSV for project:", projectId);
      console.log("Project data:", project);
      
      // Ensure we have a valid project ID
      if (!projectId) {
        throw new Error("Project ID is missing");
      }
      
      const response = await axios.post(
        `${import.meta.env.VITE_BE_URL}/api/project/export/csv`,
        { project_id: projectId },
        { 
          responseType: 'json',
          headers: {
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log("Export response:", response.data);
      
      // Get the CSV data and suggested filename
      const { csv_data, filename } = response.data;
      
      if (!csv_data) {
        throw new Error("No CSV data received");
      }
      
      // Create blob from the CSV data
      const blob = new Blob([csv_data], { type: 'text/csv;charset=utf-8;' });
      
      // Create download link and click it
      const link = document.createElement('a');
      
      // Create download URL
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', filename || 'project_export.csv');
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setExportStatus("success");
      setNotification({
        open: true,
        message: "CSV file exported successfully",
        type: "success"
      });
      
      // Reset status after a delay
      setTimeout(() => {
        setExportStatus("idle");
      }, 3000);
      
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus("error");
      setNotification({
        open: true,
        message: `Failed to export CSV: ${error.message || "Unknown error"}`,
        type: "error"
      });
      
      // Reset status after a delay
      setTimeout(() => {
        setExportStatus("idle");
      }, 3000);
    }
  };
  
  // Render export button with appropriate state
  const renderExportButton = () => {
    let buttonText = "Export to CSV";
    let icon = <FileDownloadIcon sx={{ mr: 0.5 }} />;
    let disabled = page_docs.length === 0;
    
    if (exportStatus === "loading") {
      buttonText = "Exporting...";
      icon = <CircularProgress size={20} sx={{ mr: 1 }} />;
      disabled = true;
    } else if (exportStatus === "success") {
      buttonText = "Export Successful";
      icon = <DownloadIcon sx={{ mr: 0.5 }} />;
    } else if (exportStatus === "error") {
      buttonText = "Export Failed";
      disabled = true;
    }
    
    return (
      <Tooltip title={disabled ? "No pages to export" : "Export all page data to CSV"}>
        <span>
          <Button
            variant="outlined"
            size="small"
            disabled={disabled}
            onClick={handleExportCsv}
            startIcon={icon}
            sx={sx.exportButton}
          >
            {buttonText}
          </Button>
        </span>
      </Tooltip>
    );
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
          
          {/* Export button */}
          {renderExportButton()}
        </Box>

        <Stack spacing={1.5}>
          {sortedPages.map((doc, index) => {
            const excerpt = findExcerptWithKeyword(doc.text, doc._id);
            
            return (
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
                        {typeof excerpt === 'string' ? (
                          excerpt
                        ) : (
                          <>
                            {excerpt.prefix}
                            {excerpt.beforeKeyword}
                            <Box component="span" sx={{ fontWeight: 'bold' }}>
                              {excerpt.keywordText}
                            </Box>
                            {excerpt.afterKeyword}
                            {excerpt.suffix}
                          </>
                        )}
                      </Typography>
                      
                      {doc.keywords && (
                        <Box sx={{ display: 'flex', mt: 1, ml: 4, flexWrap: 'wrap', gap: 0.5 }}>
                          {doc.keywords.split(',').map((keyword, idx) => (
                            keyword.trim() && (
                              <Chip
                                key={idx}
                                label={keyword.trim()}
                                size="small"
                                sx={{
                                  backgroundColor: "rgba(66, 133, 244, 0.1)",
                                  borderColor: "rgba(66, 133, 244, 0.5)",
                                  border: 1,
                                  color: "#333",
                                  height: 20,
                                  fontSize: '0.7rem'
                                }}
                              />
                            )
                          ))}
                        </Box>
                      )}
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
            );
          })}
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
