import { useState, useEffect } from "react";
import {
  Stack,
  Typography,
  Button,
  Select,
  MenuItem,
  TextField,
  Container,
  Card,
  CardContent,
  Box,
  Paper,
  Chip,
  Snackbar,
  Alert,
  Slide,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel
} from "@mui/material";
import axios from "axios";
import {
  useOutletContext,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

export default function EditPage() {
  const [pages, set_pages] = useState([]);
  const [searchParams] = useSearchParams();
  const { id: projectId } = useParams(); // Get project ID for storage keys
  
  // Initialize keywords from localStorage or URL params
  const [keywords, set_keywords] = useState(() => {
    const stored = localStorage.getItem(`project_${projectId}_keywords`);
    return stored || searchParams.get("keywords") || "";
  });
  
  // Initialize year from localStorage or default
  const [year, set_year] = useState(() => {
    const stored = localStorage.getItem(`project_${projectId}_year`);
    return stored || YEARS[0];
  });
  
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success"
  });

  // Effect to trigger search on mount if we have parameters
  useEffect(() => {
    if (keywords || year !== YEARS[0]) {
      const initialSearch = async () => {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BE_URL}/api/search`,
            {
              pageNumber: [],
              volume: [],
              topics: [],
              keywords: keywords.split(",").map((k) => k.trim()).filter(k => k),
              year,
            }
          );
          set_pages(response.data.results.results);
        } catch (err) {
          console.error(err);
        }
      };
      initialSearch();
    }
  }, []); // Run once on mount

  const sx = { 
    wrapper: { width: 1 }, 
    container: { width: 1 } 
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({...notification, open: false});
  };

  return (
    <Container maxWidth="lg">
      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
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
      <Stack sx={sx.wrapper} spacing={2}>
        <Stack sx={sx.container}>
          <Controls
            set_pages={set_pages}
            keywords={keywords}
            set_keywords={set_keywords}
            year={year}
            set_year={set_year}
          />
          <List 
            pages={pages} 
            keywords={keywords} 
            setNotification={setNotification}
          />
        </Stack>
      </Stack>
    </Container>
  );
}

function List({ pages, keywords, setNotification }) {
  const { project } = useOutletContext();
  const [curr_pages, set_curr_pages] = useState(project.pages);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    pageId: null,
    pageTitle: "",
    pageNumber: ""
  });
  const [filterStatus, setFilterStatus] = useState("all");

  const navigate = useNavigate();
  const { id: projectId } = useParams();

  const sx = { 
    wrapper: { 
      width: 1, 
      padding: 1
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
    addedChip: {
      backgroundColor: "primary.light",
      color: "primary.dark",
      fontWeight: "medium",
      borderColor: "primary.main",
      border: 1,
    },
    notAddedChip: {
      backgroundColor: "#e0e0e0", 
      color: "#616161",
      fontWeight: "medium",
      borderColor: "#9e9e9e",
      border: 1,
    },
    actionButton: {
      ml: 1,
      zIndex: 10
    },
    filterContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2
    },
    toggleButton: {
      textTransform: 'none',
      borderRadius: 20,
      margin: '0 6px',
      minWidth: '80px',
      padding: '4px 12px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      color: 'rgba(255, 255, 255, 0.7)',
      '&.Mui-selected': {
        backgroundColor: 'rgba(66, 133, 244, 0.8)',
        color: 'white',
        borderColor: 'rgba(66, 133, 244, 0.8)',
        '&:hover': {
          backgroundColor: 'rgba(66, 133, 244, 0.9)',
          borderColor: 'rgba(66, 133, 244, 0.9)',
        }
      },
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      }
    },
    toggleButtonGroup: {
      backgroundColor: 'transparent',
      '& .MuiToggleButtonGroup-grouped': {
        borderRadius: 20,
        margin: '0 4px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        '&:not(:first-of-type)': {
          borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
        },
      }
    }
  };

  function add(id, event, volumeTitle) {
    // Stop propagation to prevent navigation when clicking the button
    event.stopPropagation();
    
    const updated = [...new Set([...curr_pages, id])];
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
        _id: project._id,
        pages: updated,
      })
      .then(() => {
        set_curr_pages(updated);
        // Show notification
        setNotification({
          open: true,
          message: `Added page from ${volumeTitle} to project`,
          type: "success"
        });
      })
      .catch((err) => {
        console.error("Save failed", err);
        setNotification({
          open: true,
          message: "Failed to add page to project",
          type: "error"
        });
      });
  }

  function openRemoveConfirmation(id, event, volumeTitle, pageNumber) {
    // Stop propagation to prevent navigation when clicking the button
    event.stopPropagation();
    
    setConfirmDialog({
      open: true,
      pageId: id,
      pageTitle: volumeTitle,
      pageNumber: pageNumber
    });
  }

  function confirmRemove() {
    const { pageId, pageTitle } = confirmDialog;
    
    const updated = curr_pages.filter((x) => x !== pageId);
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
        _id: project._id,
        pages: updated,
      })
      .then(() => {
        set_curr_pages(updated);
        // Show notification
        setNotification({
          open: true,
          message: `Removed page from ${pageTitle} from project`,
          type: "info"
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

  function closeConfirmDialog() {
    setConfirmDialog({...confirmDialog, open: false});
  }

  // Format keywords for URL parameters ensuring proper format
  const getFormattedKeywords = () => {
    if (!keywords) return "";
    
    const keywordArray = keywords
      .split(",")
      .map(k => k.trim())
      .filter(k => k);
      
    return keywordArray.join(",");
  };
  
  const navigateToVerify = (pageId, index) => {
    // Store all pages in sessionStorage before navigating
    sessionStorage.setItem('allPages', JSON.stringify(pages));
    sessionStorage.setItem('currentPageIndex', index.toString());
    
    // Format keywords properly for URL parameters
    const formattedKeywords = getFormattedKeywords();
    const keywordParam = formattedKeywords ? `?keywords=${formattedKeywords}` : '';
    
    navigate(`/project/${projectId}/verify/${pageId}${keywordParam}`);
  };

  // Find text excerpt around the first keyword match and return with highlight markup
  const findExcerptWithKeyword = (text, keywords) => {
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

  // Filter pages based on current filter status
  const filteredPages = pages.filter(page => {
    if (filterStatus === "all") return true;
    if (filterStatus === "added") return curr_pages.includes(page._id);
    if (filterStatus === "unadded") return !curr_pages.includes(page._id);
    return true;
  });

  // Sort pages by page number
  const sortedPages = [...filteredPages].sort((a, b) => {
    return parseInt(a.page_number) - parseInt(b.page_number);
  });

  return (
    <Stack sx={sx.wrapper} spacing={3}>
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

      <Box sx={sx.filterContainer}>
        <Typography variant="h6">
          Search Results ({filteredPages.length}/{pages.length})
        </Typography>
        
        <Box sx={{ display: 'flex', gap: '8px' }}>
          <Button 
            variant={filterStatus === 'all' ? 'contained' : 'outlined'} 
            onClick={() => setFilterStatus('all')}
            sx={{
              borderRadius: 20,
              textTransform: 'none',
              backgroundColor: filterStatus === 'all' ? 'rgba(66, 133, 244, 0.8)' : 'transparent',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              '&:hover': {
                backgroundColor: filterStatus === 'all' ? 'rgba(66, 133, 244, 0.9)' : 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
              }
            }}
          >
            All
          </Button>
          <Button 
            variant={filterStatus === 'added' ? 'contained' : 'outlined'} 
            onClick={() => setFilterStatus('added')}
            sx={{
              borderRadius: 20,
              textTransform: 'none',
              backgroundColor: filterStatus === 'added' ? 'rgba(66, 133, 244, 0.8)' : 'transparent',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              '&:hover': {
                backgroundColor: filterStatus === 'added' ? 'rgba(66, 133, 244, 0.9)' : 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
              }
            }}
          >
            Added
          </Button>
          <Button 
            variant={filterStatus === 'unadded' ? 'contained' : 'outlined'} 
            onClick={() => setFilterStatus('unadded')}
            sx={{
              borderRadius: 20,
              textTransform: 'none',
              backgroundColor: filterStatus === 'unadded' ? 'rgba(66, 133, 244, 0.8)' : 'transparent',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              color: 'white',
              '&:hover': {
                backgroundColor: filterStatus === 'unadded' ? 'rgba(66, 133, 244, 0.9)' : 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.5)',
              }
            }}
          >
            Not Added
          </Button>
        </Box>
      </Box>

      <Stack spacing={1.5}>
        {sortedPages.map((page, index) => {
          const excerpt = findExcerptWithKeyword(page.text, keywords);
          
          return (
            <Card 
              key={index} 
              sx={sx.pageCard} 
              elevation={1}
              onClick={() => navigateToVerify(page._id, index)}
            >
              <CardContent sx={sx.pageContent}>
                <Box display="flex" alignItems="center">
                  <Box flexGrow={1}>
                    <Box display="flex" alignItems="center">
                      <Typography variant="body2" color="text.secondary" sx={{ mr: 2, width: 30 }}>
                        {index + 1}.
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2 }}>
                        Page {page.page_number}
                      </Typography>
                      {curr_pages.includes(page._id) ? (
                        <Chip 
                          label="ADDED" 
                          size="small" 
                          sx={{...sx.addedChip, ml: 2}}
                        />
                      ) : (
                        <Chip 
                          label="NOT ADDED" 
                          size="small" 
                          sx={{...sx.notAddedChip, ml: 2}}
                        />
                      )}
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
                  </Box>
                  
                  <Box>
                    {curr_pages.includes(page._id) ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={(e) => openRemoveConfirmation(page._id, e, page.volume_title, page.page_number)}
                        sx={sx.actionButton}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary" 
                        onClick={(e) => add(page._id, e, page.volume_title)}
                        sx={sx.actionButton}
                      >
                        Add
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
      
      {filteredPages.length === 0 && (
        <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
          <Typography variant="body1" color="text.secondary">
            {pages.length > 0 
              ? "No matches for the current filter. Try adjusting your filter criteria."
              : "No search results. Try adjusting your search terms."}
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}

function Controls({ set_pages, keywords, set_keywords, year, set_year }) {
  const { id: projectId } = useParams(); // Get project ID for storage keys

  const sx = {
    wrapper: { 
      padding: 2,
      marginBottom: 2 
    },
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
    // Save to localStorage with project-specific keys
    localStorage.setItem(`project_${projectId}_keywords`, keywords);
    localStorage.setItem(`project_${projectId}_year`, year);
    
    // Clean keywords before submitting
    const cleanedKeywords = keywords
      .split(",")
      .map(k => k.trim())
      .filter(k => k);
      
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/search`, {
        pageNumber: [],
        volume: [],
        topics: [],
        keywords: cleanedKeywords,
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
