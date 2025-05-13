import { useState, useEffect, useRef } from "react";
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
  InputLabel,
  CircularProgress,
  Pagination
} from "@mui/material";
import axios from "axios";
import {
  useOutletContext,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

const PARLIAMENTARY_YEARS = [
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

const STATUTES_VOLUMES = [
  "0",
  "1", 
  "2", 
  "3", 
  "4", 
  "5", 
  "6", 
  "7", 
  "8", 
  "9", 
  "10",
  "11"
];

// Helper function to format collection name
const formatCollectionName = (volumeSet) => {
  if (!volumeSet) return "Unknown Collection";
  
  // Capitalize first letter of each word 
  return volumeSet
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function EditPage() {
  const [searchParams] = useSearchParams();
  const { id: projectId } = useParams(); // Get project ID for storage keys
  
  // Get the initial volume set
  const initialVolumeSet = localStorage.getItem(`project_${projectId}_volumeSet`) || "parliamentary proceedings";
  
  // Initialize pageIds from localStorage
  const [pageIds, setPageIds] = useState(() => {
    const stored = localStorage.getItem(`project_${projectId}_pageIds`);
    return stored ? JSON.parse(stored) : [];
  });
  
  // Initialize pageData from localStorage or empty array
  const [pageData, setPageData] = useState(() => {
    const stored = localStorage.getItem(`project_${projectId}_pageData`);
    return stored ? JSON.parse(stored) : [];
  });
  
  // Initialize keywords from localStorage or URL params
  const [keywords, set_keywords] = useState(() => {
    const stored = localStorage.getItem(`project_${projectId}_keywords`);
    return stored || searchParams.get("keywords") || "";
  });

  // Add a state for the actively searched keywords (for highlighting)
  const [searchedKeywords, setSearchedKeywords] = useState(() => {
    const stored = localStorage.getItem(`project_${projectId}_searchedKeywords`);
    return stored || searchParams.get("keywords") || "";
  });
  
  // Initialize year from localStorage or default based on volume set
  const [year, set_year] = useState(() => {
    const stored = localStorage.getItem(`project_${projectId}_year`);
    if (stored) return stored;
    
    // Default based on volume set
    return initialVolumeSet === "parliamentary proceedings" 
      ? PARLIAMENTARY_YEARS[0] 
      : STATUTES_VOLUMES[0];
  });
  
  const [notification, setNotification] = useState({
    open: false,
    message: "",
    type: "success"
  });

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Set a session storage flag when component mounts to prevent re-searching
  useEffect(() => {
    // When component unmounts, set the flag to indicate we've visited this component
    return () => {
      sessionStorage.setItem(`project_${projectId}_visited`, 'true');
    };
  }, [projectId]);

  // Safe localStorage setter with error handling
  const safeSetLocalStorage = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to save to localStorage: ${error.message}`);
      
      // If it's a quota error, try to clear some space
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        try {
          // Clear old search results
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('pageData') && !key.includes(projectId)) {
              localStorage.removeItem(key);
            }
          }
          // Try setting again
          localStorage.setItem(key, value);
        } catch (retryError) {
          console.error('Could not save to localStorage even after cleanup');
        }
      }
    }
  };
  
  // Save pageIds and pageData to localStorage whenever they change
  useEffect(() => {
    if (pageIds.length > 0) {
      safeSetLocalStorage(`project_${projectId}_pageIds`, JSON.stringify(pageIds));
    }
  }, [pageIds, projectId]);

  useEffect(() => {
    if (pageData.length > 0) {
      // Only store essential data to reduce storage usage
      const compactData = pageData.map(page => ({
        _id: page._id,
        page_number: page.page_number,
        volume_title: page.volume_title,
        text: page.text.substring(0, 1000), // Limit text size
        volume_set: page.volume_set
      }));
      safeSetLocalStorage(`project_${projectId}_pageData`, JSON.stringify(compactData));
    }
  }, [pageData, projectId]);

  // Save searchedKeywords to localStorage when they change
  useEffect(() => {
    if (searchedKeywords) {
      safeSetLocalStorage(`project_${projectId}_searchedKeywords`, searchedKeywords);
    }
  }, [searchedKeywords, projectId]);

  // Keep highlight and storage in sync with the current input
  useEffect(() => {
    setSearchedKeywords(keywords);
    safeSetLocalStorage(`project_${projectId}_searchedKeywords`, keywords);
  }, [keywords, projectId]);

  // Effect to trigger search on mount if we have parameters but no stored results
  useEffect(() => {
    // Check if we've already visited this component in this session
    const hasVisited = sessionStorage.getItem(`project_${projectId}_visited`) === 'true';
    
    // Skip search completely if we've already visited this component
    if (hasVisited) {
      console.log("Already visited this component, skipping automatic search");
      return;
    }
    
    // Initialize default volume set and corresponding volume/year options
    let initialVolumeSet = localStorage.getItem(`project_${projectId}_volumeSet`) || "parliamentary proceedings";
    let initialYear = localStorage.getItem(`project_${projectId}_year`);
    
    // Set default year value if it doesn't exist or isn't valid for the volume set
    if (!initialYear) {
      if (initialVolumeSet === "parliamentary proceedings") {
        initialYear = PARLIAMENTARY_YEARS[0];
      } else if (initialVolumeSet === "statutes of the realm") {
        initialYear = STATUTES_VOLUMES[0];
      }
      try {
        localStorage.setItem(`project_${projectId}_year`, initialYear);
      } catch (error) {
        console.warn(`Failed to save initial year: ${error.message}`);
      }
    }
    
    // Only perform search if we have search parameters but no stored results
    if ((keywords || initialYear !== (initialVolumeSet === "parliamentary proceedings" ? PARLIAMENTARY_YEARS[0] : STATUTES_VOLUMES[0])) && pageIds.length === 0) {
      const initialSearch = async () => {
        try {
          setIsLoading(true);
          
          console.log("Performing initial search with:", { 
            keywords: keywords ? keywords.split(",").map((k) => k.trim()).filter(k => k) : [],
            year: initialYear,
            volumeSet: initialVolumeSet
          });
          
          // Mark that we've done an initial search for this project
          try {
            localStorage.setItem(`project_${projectId}_hasSearched`, 'true');
          } catch (error) {
            console.warn(`Failed to set hasSearched flag: ${error.message}`);
          }
          
          const response = await axios.post(
            `${import.meta.env.VITE_BE_URL}/api/search`,
            {
              pageNumber: [],
              volume: [],
              topics: [],
              keywords: keywords.split(",").map((k) => k.trim()).filter(k => k),
              year: initialYear,
              volume_set: initialVolumeSet
            }
          );
          
          console.log("Initial search results:", {
            count: response.data.results.count,
            firstFewResults: response.data.results.results.slice(0, 3)
          });
          
          // Store only IDs and full data separately
          const results = response.data.results.results;
          setPageData(results);
          setPageIds(results.map(page => page._id));
          
          // Set the searched keywords on initial search
          setSearchedKeywords(keywords);
        } catch (err) {
          console.error("Initial search failed:", err);
          console.error("Error details:", err.response ? err.response.data : "No response data");
          console.error("Error status:", err.response ? err.response.status : "No status code");
          setPageData([]);
          setPageIds([]);
        } finally {
          setIsLoading(false);
        }
      };
      initialSearch();
    } else if (pageIds.length > 0) {
      console.log("Using stored search results:", { count: pageIds.length });
    } else {
      console.log("No initial search parameters, skipping search");
    }
  }, []); // Run once on mount

  // Function to clear search results from localStorage
  const clearStoredResults = () => {
    try {
      localStorage.removeItem(`project_${projectId}_pageIds`);
      localStorage.removeItem(`project_${projectId}_pageData`);
      localStorage.removeItem(`project_${projectId}_searchedKeywords`);
      localStorage.removeItem(`project_${projectId}_hasSearched`);
      sessionStorage.removeItem(`project_${projectId}_visited`);
    } catch (error) {
      console.warn(`Error clearing localStorage: ${error.message}`);
    }
    setPageIds([]);
    setPageData([]);
    setSearchedKeywords("");
  };

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
            setPageData={setPageData}
            setPageIds={setPageIds}
            keywords={keywords}
            set_keywords={set_keywords}
            year={year}
            set_year={set_year}
            setSearchedKeywords={setSearchedKeywords}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            clearStoredResults={clearStoredResults}
            safeSetLocalStorage={safeSetLocalStorage}
          />
          <List 
            pageData={pageData}
            pageIds={pageIds}
            keywords={keywords}
            setNotification={setNotification}
            isLoading={isLoading}
            projectId={projectId}
          />
        </Stack>
      </Stack>
    </Container>
  );
}

function List({ pageData, pageIds, keywords, setNotification, isLoading, projectId }) {
  const { project } = useOutletContext();
  const [curr_pages, set_curr_pages] = useState(project.pages);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    pageId: null,
    pageTitle: "",
    pageNumber: ""
  });
  const [filterStatus, setFilterStatus] = useState(() => {
    // Restore filter status from localStorage or default to "all"
    return localStorage.getItem(`project_${projectId}_filterStatus`) || "all";
  });
  
  // Add pagination state, restore from localStorage if available
  const [currentPage, setCurrentPage] = useState(() => {
    const stored = localStorage.getItem(`project_${projectId}_currentPage`);
    return stored ? parseInt(stored) : 1;
  });
  const resultsPerPage = 20;

  const navigate = useNavigate();

  // Save filter status to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(`project_${projectId}_filterStatus`, filterStatus);
    } catch (error) {
      console.warn(`Failed to save filter status: ${error.message}`);
    }
  }, [filterStatus, projectId]);

  // Save current page to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(`project_${projectId}_currentPage`, currentPage.toString());
    } catch (error) {
      console.warn(`Failed to save current page: ${error.message}`);
    }
  }, [currentPage, projectId]);

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
    },
    loadingContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      padding: 4,
      marginTop: 2
    },
    loadingText: {
      color: 'white',
      marginTop: 2
    },
    paginationContainer: {
      display: 'flex',
      justifyContent: 'center',
      marginTop: 3,
      marginBottom: 2
    },
    pagination: {
      '& .MuiPaginationItem-root': {
        color: 'white',
      },
      '& .Mui-selected': {
        backgroundColor: 'rgba(66, 133, 244, 0.8)',
      }
    }
  };

  function add(id, event, volumeTitle) {
    // Stop propagation to prevent navigation when clicking the button
    event.stopPropagation();
    
    const updated = [...new Set([...curr_pages, id])];
    
    // Get current keywords to store with this page
    const currentKeywords = keywords;
    
    // Get the existing page_keywords or initialize empty object
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project`, { _id: project._id })
      .then((projectRes) => {
        const existingProject = projectRes.data.project;
        const pageKeywords = existingProject.page_keywords || {};
        
        // Only update keywords if we have some to add
        if (currentKeywords) {
          // Format keywords properly
          const keywordArray = Array.isArray(currentKeywords) 
            ? currentKeywords 
            : currentKeywords.split(',').map(k => k.trim()).filter(k => k);
            
          // Store as string
          pageKeywords[id] = keywordArray.join(',');
        }
        
        // Now update the project with both pages and keywords
        return axios.post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
          _id: project._id,
          pages: updated,
          page_keywords: pageKeywords
        });
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
    
    // Get the existing page_keywords
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project`, { _id: project._id })
      .then((projectRes) => {
        const existingProject = projectRes.data.project;
        const pageKeywords = existingProject.page_keywords || {};
        const updated = curr_pages.filter((x) => x !== pageId);
        
        // Remove keywords for this page
        if (pageKeywords[pageId]) {
          delete pageKeywords[pageId];
        }
        
        // Now update the project with both pages and keywords
        return axios.post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
          _id: project._id,
          pages: updated,
          page_keywords: pageKeywords
        });
      })
      .then(() => {
        set_curr_pages(curr_pages.filter((x) => x !== pageId));
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
    
    // If keywords is already an array, join it
    if (Array.isArray(keywords)) {
      return keywords.join(",");
    }
    
    // If it's a string, split by comma, clean, and rejoin
    const keywordArray = keywords
      .split(",")
      .map(k => k.trim())
      .filter(k => k);
      
    return keywordArray.join(",");
  };
  
  const navigateToVerify = (pageId, index) => {
    // Store only page IDs in sessionStorage before navigating
    sessionStorage.setItem('pageIds', JSON.stringify(pageIds));
    sessionStorage.setItem('currentPageIndex', index.toString());
    
    // Store "edit" as the referrer
    sessionStorage.setItem('verification_referrer', 'edit');
    
    // Format keywords properly for URL parameters
    const formattedKeywords = getFormattedKeywords();
    const keywordParam = formattedKeywords ? `?keywords=${encodeURIComponent(formattedKeywords)}` : '';
    
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
  const filteredPages = pageData.filter(page => {
    if (filterStatus === "all") return true;
    if (filterStatus === "added") return curr_pages.includes(page._id);
    if (filterStatus === "unadded") return !curr_pages.includes(page._id);
    return true;
  });

  // Calculate counts for each filter category
  const totalCount = pageData.length;
  const addedCount = pageData.filter(page => curr_pages.includes(page._id)).length;
  const notAddedCount = totalCount - addedCount;

  // Sort pages by page number
  const sortedPages = [...filteredPages].sort((a, b) => {
    return parseInt(a.page_number) - parseInt(b.page_number);
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedPages.length / resultsPerPage);
  const paginatedPages = sortedPages.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );
  
  // Calculate start and end indices for display
  const startIndex = sortedPages.length > 0 ? (currentPage - 1) * resultsPerPage + 1 : 0;
  const endIndex = Math.min(currentPage * resultsPerPage, sortedPages.length);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    // Scroll to top when changing pages
    window.scrollTo(0, 0);
  };

  // Reset to first page when results change
  useEffect(() => {
    setCurrentPage(1);
  }, [pageData, filterStatus]);

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
          {sortedPages.length > 0 
            ? `Showing results ${startIndex}-${endIndex}` 
            : "Search Results"}
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
            All ({totalCount})
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
            Added ({addedCount})
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
            Not Added ({notAddedCount})
          </Button>
        </Box>
      </Box>

      {isLoading ? (
        <Box sx={sx.loadingContainer}>
          <CircularProgress size={40} />
          <Typography variant="body1" sx={sx.loadingText}>
            Searching...
          </Typography>
        </Box>
      ) : (
        <>
          <Stack spacing={1.5}>
            {paginatedPages.map((page, index) => {
              const actualIndex = (currentPage - 1) * resultsPerPage + index;
              const excerpt = findExcerptWithKeyword(page.text, keywords);
              
              return (
                <Card 
                  key={index} 
                  sx={sx.pageCard} 
                  elevation={1}
                  onClick={() => navigateToVerify(page._id, actualIndex)}
                >
                  <CardContent sx={sx.pageContent}>
                    <Box display="flex" alignItems="center">
                      <Box flexGrow={1}>
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 2, width: 30 }}>
                            {actualIndex + 1}.
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ mr: 2 }}>
                            Page {page.page_number}
                          </Typography>
                          {/* Add collection badge here */}
                          {page.volume_set && (
                            <Chip
                              label={formatCollectionName(page.volume_set)}
                              size="small"
                              sx={{
                                bgcolor: page.volume_set === "statutes of the realm" ? '#d1a04f' : '#3f7bb6',
                                color: 'white',
                                fontWeight: 500,
                                fontSize: '0.7rem',
                                height: '18px',
                                mr: 1
                              }}
                            />
                          )}
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
                          {/* Show volume information with text */}
                          <Box component="span" sx={{ fontSize: '0.85rem', color: '#555', mr: 1 }}>
                            {page.volume_title}
                          </Box>
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
          
          {/* Pagination Controls */}
          {filteredPages.length > resultsPerPage && (
            <Box sx={sx.paginationContainer}>
              <Pagination 
                count={totalPages} 
                page={currentPage} 
                onChange={handlePageChange} 
                variant="outlined" 
                shape="rounded"
                sx={sx.pagination}
              />
            </Box>
          )}
          
          {!isLoading && filteredPages.length === 0 && (
            <Paper sx={{ p: 2, textAlign: 'center', backgroundColor: '#f8f9fa' }}>
              <Typography variant="body1" color="text.secondary">
                {pageData.length > 0 
                  ? "No matches for the current filter. Try adjusting your filter criteria."
                  : "No search results. Try adjusting your search terms."}
              </Typography>
            </Paper>
          )}
        </>
      )}
    </Stack>
  );
}

function Controls({ 
  setPageData, 
  setPageIds, 
  keywords, 
  set_keywords, 
  year, 
  set_year, 
  setSearchedKeywords,
  isLoading, 
  setIsLoading,
  clearStoredResults,
  safeSetLocalStorage
}) {
  const { id: projectId } = useParams(); // Get project ID for storage keys
  // Add a cancellation token ref
  const cancelTokenRef = useRef(null);
  // Add state for volume sets
  const [volumeSets, setVolumeSets] = useState(['parliamentary proceedings', 'statutes of the realm']);
  // Add state for selected volume set with localStorage persistence
  const [volumeSet, setVolumeSet] = useState(() => {
    const stored = localStorage.getItem(`project_${projectId}_volumeSet`);
    return stored || "parliamentary proceedings"; // Default to parliamentary proceedings
  });
  
  // State for available volume options based on the selected volume set
  const [volumeOptions, setVolumeOptions] = useState([]);
  
  // Fetch available volume sets when component mounts
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BE_URL}/api/volume-sets`)
      .then(res => {
        if (res.data.volume_sets && Array.isArray(res.data.volume_sets)) {
          setVolumeSets(res.data.volume_sets);
        }
      })
      .catch(err => {
        console.error("Failed to fetch volume sets:", err);
      });
  }, []);
  
  // Update volume options when volume set changes
  useEffect(() => {
    // Reset year/volume selection when changing collection
    if (volumeSet === "parliamentary proceedings") {
      setVolumeOptions(PARLIAMENTARY_YEARS);
      // If current year isn't in the new list, reset to first option
      if (!PARLIAMENTARY_YEARS.includes(year)) {
        set_year(PARLIAMENTARY_YEARS[0]);
        safeSetLocalStorage(`project_${projectId}_year`, PARLIAMENTARY_YEARS[0]);
      }
    } else if (volumeSet === "statutes of the realm") {
      setVolumeOptions(STATUTES_VOLUMES);
      // If current year isn't in the new list, reset to first option
      if (!STATUTES_VOLUMES.includes(year)) {
        set_year(STATUTES_VOLUMES[0]);
        safeSetLocalStorage(`project_${projectId}_year`, STATUTES_VOLUMES[0]);
      }
    }
  }, [volumeSet, projectId, year, set_year]);
  
  // Handle volume set change
  const handleVolumeSetChange = (e) => {
    const newVolumeSet = e.target.value;
    setVolumeSet(newVolumeSet);
    
    // Save to localStorage
    safeSetLocalStorage(`project_${projectId}_volumeSet`, newVolumeSet);
    
    // Clear search results when changing collection
    clearStoredResults();
  };

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
    buttonContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: 2
    },
    cancelButton: {
      height: 40,
      color: 'rgba(255, 255, 255, 0.9)',
      borderColor: 'rgba(255, 70, 70, 0.7)',
      backgroundColor: 'rgba(255, 70, 70, 0.15)',
      '&:hover': {
        backgroundColor: 'rgba(255, 70, 70, 0.25)',
        borderColor: 'rgba(255, 70, 70, 0.9)',
      }
    }
  };

  function submit() {
    // Save to localStorage with project-specific keys
    safeSetLocalStorage(`project_${projectId}_keywords`, keywords);
    safeSetLocalStorage(`project_${projectId}_year`, year);
    safeSetLocalStorage(`project_${projectId}_volumeSet`, volumeSet);
    
    // Clean keywords before submitting
    const cleanedKeywords = keywords
      .split(",")
      .map(k => k.trim())
      .filter(k => k);
    
    // Debug: Log the search parameters being sent
    console.log("Search parameters:", {
      year,
      keywords: cleanedKeywords,
      keywordsOriginal: keywords,
      volumeSet
    });
    
    // Show searching message
    const searchParams = [];
    if (year && volumeSet === "parliamentary proceedings" && year !== PARLIAMENTARY_YEARS[0]) searchParams.push(`Year: ${year}`);
    if (year && volumeSet === "statutes of the realm" && year !== STATUTES_VOLUMES[0]) searchParams.push(`Volume: ${year}`);
    if (cleanedKeywords.length > 0) searchParams.push(`Keywords: ${cleanedKeywords.join(', ')}`);
    if (volumeSet) searchParams.push(`Collection: ${volumeSet}`);
    
    // Clear old results before starting new search
    clearStoredResults();
    
    setPageData([]); // Clear current results while searching
    setPageIds([]);
    setIsLoading(true); // Set loading state
    
    // Create a new cancellation token
    cancelTokenRef.current = axios.CancelToken.source();
    
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/search`, {
        pageNumber: [],
        volume: [],
        topics: [],
        keywords: cleanedKeywords,
        year,
        volume_set: volumeSet
      }, {
        cancelToken: cancelTokenRef.current.token
      })
      .then((res) => {
        // Debug: Log the response 
        console.log("Search response:", {
          status: res.status,
          resultCount: res.data.results.count,
          firstFewResults: res.data.results.results.slice(0, 3)
        });
        
        if (res.data.results.count === 0) {
          console.log("No search results found. Search criteria may be too restrictive.");
        }
        
        // Store only IDs and full data separately
        const results = res.data.results.results;
        setPageData(results);
        setPageIds(results.map(page => page._id));
        
        // Update the searchedKeywords only when search is performed
        setSearchedKeywords(keywords);

        // Reset pagination to first page in localStorage
        safeSetLocalStorage(`project_${projectId}_currentPage`, "1");
      })
      .catch((err) => {
        if (axios.isCancel(err)) {
          console.log("Search was cancelled by user");
        } else {
          console.error("Search failed:", err);
          console.error("Error details:", err.response ? err.response.data : "No response data");
          console.error("Error status:", err.response ? err.response.status : "No status code");
        }
        
        // Set empty results on error
        setPageData([]);
        setPageIds([]);
      })
      .finally(() => {
        setIsLoading(false); // Clear loading state
        cancelTokenRef.current = null;
      });
  }
  
  const cancelSearch = () => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel("Search cancelled by user");
      setIsLoading(false);
    }
  };

  return (
    <Stack sx={sx.wrapper} direction="row" spacing={2} alignItems="center">
      {/* Volume Set Selector */}
      <FormControl sx={{ minWidth: 180 }}>
        <Select
          id="volume-set-select"
          value={volumeSet}
          onChange={handleVolumeSetChange}
          sx={sx.select}
          disabled={isLoading}
        >
          {volumeSets.map((set, i) => (
            <MenuItem key={i} value={set}>
              {formatCollectionName(set)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Select
        value={year}
        onChange={(e) => set_year(e.target.value)}
        autoWidth
        sx={sx.select}
        disabled={isLoading}
      >
        {volumeOptions.map((e, i) => (
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
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isLoading) {
            submit();
          }
        }}
        disabled={isLoading}
      />

      <Box sx={sx.buttonContainer}>
        {isLoading ? (
          <Button 
            variant="outlined"
            sx={sx.cancelButton}
            onClick={cancelSearch}
          >
            CANCEL SEARCH
          </Button>
        ) : (
          <Button 
            variant="contained" 
            sx={sx.button} 
            onClick={submit}
          >
            SEARCH
          </Button>
        )}
      </Box>
    </Stack>
  );
}
