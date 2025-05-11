import { useState, useEffect, useCallback } from "react";
import { Stack, Typography, TextField, Button, Box, IconButton, Drawer, Paper, Tabs, Tab, Divider, FormControlLabel, Switch, Chip, InputAdornment, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, MenuItem, Menu } from "@mui/material";
import "../App.css";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import NotesIcon from '@mui/icons-material/Notes';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import DeleteIcon from '@mui/icons-material/Delete';
import Notes from "./Notes";

export default function Verification({
  i,
  panels,
  overview,
  correct_next,
  fail_next,
  keywords = [],
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const itemsString = searchParams.get("keywords");
  const keywordsArray = itemsString ? itemsString.split(",").map(k => k.trim()).filter(k => k) : [];

  const { page_id, id: projectId } = useParams();
  const [panel, set_panel] = useState();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [curr_pages, set_curr_pages] = useState();
  const [notesOpen, setNotesOpen] = useState(false);
  
  // Notes data state
  const [tabValue, setTabValue] = useState(0);
  const [universalDate, setUniversalDate] = useState("");
  const [universalTopics, setUniversalTopics] = useState([]);
  const [topicInput, setTopicInput] = useState("");
  const [pageNote, setPageNote] = useState("");
  const [passages, setPassages] = useState([]);
  const [passageNotes, setPassageNotes] = useState({});
  const [selectionMenuAnchor, setSelectionMenuAnchor] = useState(null);
  const [selectedText, setSelectedText] = useState("");
  const [selectedRange, setSelectedRange] = useState(null);

  // Get all pages data either from props or from sessionStorage
  const [allPages, setAllPages] = useState(() => {
    // Try to get pages from props first
    if (panels && panels.length > 0) {
      return panels;
    }
    
    // Otherwise try to get from sessionStorage
    try {
      const pagesFromStorage = sessionStorage.getItem('allPages');
      return pagesFromStorage ? JSON.parse(pagesFromStorage) : [];
    } catch (e) {
      console.error("Error parsing pages from sessionStorage:", e);
      return [];
    }
  });
  
  // Get current index
  const [currentIndex, setCurrentIndex] = useState(() => {
    // If index is provided directly, use it
    if (i !== undefined) {
      return i;
    }
    
    // Otherwise try to get from sessionStorage
    try {
      const indexFromStorage = sessionStorage.getItem('currentPageIndex');
      if (indexFromStorage) {
        return parseInt(indexFromStorage, 10);
      }
      
      // If not in storage, try to find page in allPages array
      if (allPages.length > 0) {
        const foundIndex = allPages.findIndex(p => p._id === page_id);
        return foundIndex >= 0 ? foundIndex : 0;
      }
      
      return 0;
    } catch (e) {
      console.error("Error getting current index:", e);
      return 0;
    }
  });

  // Function to extract year from volume title
  const extractYearFromVolumeTitle = (volumeTitle) => {
    if (!volumeTitle) return "";
    
    // Look for year patterns in the title
    const yearRangePattern = /(\d{4})[-\/](\d{2}|\d{4})/; // Matches 1640-42 or 1640-1642
    const singleYearPattern = /\b(\d{4})\b/; // Matches standalone year like 1640
    
    // Try to match a year range first
    const rangeMatch = volumeTitle.match(yearRangePattern);
    if (rangeMatch) {
      const startYear = rangeMatch[1];
      // Return just the year without creating an actual date object
      return startYear;
    }
    
    // Try to match a single year
    const singleMatch = volumeTitle.match(singleYearPattern);
    if (singleMatch) {
      return singleMatch[1];
    }
    
    // No year found
    return "";
  };

  // Update the currentIndex when page_id changes
  useEffect(() => {
    // Find the current page in the allPages array
    if (allPages.length > 0 && page_id) {
      const newIndex = allPages.findIndex(p => p._id === page_id);
      if (newIndex >= 0 && newIndex !== currentIndex) {
        console.log(`Updating index from ${currentIndex} to ${newIndex} for page ${page_id}`);
        setCurrentIndex(newIndex);
        // Also update sessionStorage
        sessionStorage.setItem('currentPageIndex', newIndex.toString());
      }
    }
  }, [page_id, allPages, currentIndex]);

  // Update the state when page_id changes
  useEffect(() => {
    // Reset notes state when moving to a new page
    if (page_id) {
      // Reset all note-related state to prevent notes from persisting across pages
      setPassages([]);
      setPassageNotes({});
      setPageNote("");
      setNotesOpen(false); // Close the notes panel
      
      // Set the zoom level back to default
      setZoomLevel(1);
      
      // Load the new page data
      axios
        .post(`${import.meta.env.VITE_BE_URL}/api/page/get`, { _id: page_id })
        .then((response) => {
          const pageData = response.data.page;
          set_panel(pageData);
          
          // Extract and set the year from volume title
          if (pageData && pageData.volume_title) {
            const year = extractYearFromVolumeTitle(pageData.volume_title);
            // Create a date string with January 1st of the extracted year
            if (year) {
              setUniversalDate(`${year}-01-01`);
            }
          }
          
          // Load saved metadata for this page
          loadPageMetadata(page_id);
        })
        .catch((error) => console.log("Error loading page:", error));
    }
  }, [page_id]); // Dependency on page_id means this runs when page changes

  // Function to load saved metadata for a page
  const loadPageMetadata = async (pageId) => {
    if (!pageId || !projectId) return;
    
    try {
      // Load universal metadata (date, topics)
      const universalResponse = await axios.post(`${import.meta.env.VITE_BE_URL}/api/page/get`, { 
        _id: pageId 
      });
      
      const pageData = universalResponse.data.page;
      if (pageData) {
        // Set topics if available
        if (pageData.topics && Array.isArray(pageData.topics)) {
          setUniversalTopics(pageData.topics);
        } else {
          setUniversalTopics([]);
        }
      }
      
      // Load project-specific metadata
      const projectResponse = await axios.post(`${import.meta.env.VITE_BE_URL}/api/project`, {
        _id: projectId
      });
      
      const projectData = projectResponse.data.project;
      if (projectData && projectData.page_metadata && projectData.page_metadata[pageId]) {
        const metadata = projectData.page_metadata[pageId];
        
        // Load passages if available
        if (metadata.passages && Array.isArray(metadata.passages)) {
          setPassages(metadata.passages);
        }
        
        // Load page notes if available
        if (metadata.page_notes) {
          setPageNote(metadata.page_notes);
        }
        
        // Load passage notes if available
        if (metadata.passage_notes) {
          setPassageNotes(metadata.passage_notes);
        }
      }
    } catch (error) {
      console.error("Error loading page metadata:", error);
    }
  };

  useEffect(() => {
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project`, { _id: projectId })
      .then((res) => {
        console.log(res.data);
        set_curr_pages(res.data.project.pages);
      });
  }, [projectId]);

  function add() {
    const updated = [...new Set([...curr_pages, page_id])];
    console.log("Current index:", currentIndex);
    console.log("All pages:", allPages);
    console.log("All pages length:", allPages?.length);
    
    // Get current keywords to store with this page
    const currentKeywords = keywordsArray.join(',');
    
    // Get the existing page_keywords or initialize empty object
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project`, { _id: projectId })
      .then((projectRes) => {
        const existingProject = projectRes.data.project;
        const pageKeywords = existingProject.page_keywords || {};
        
        // Update keywords for this page
        pageKeywords[page_id] = currentKeywords;
        
        // Now update the project with both pages and keywords
        return axios.post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
          _id: projectId,
          pages: updated,
          page_keywords: pageKeywords
        });
      })
      .then(() => {
        set_curr_pages(updated);
        
        // Navigate to next page if available
        if (allPages.length > 0 && currentIndex < allPages.length - 1) {
          console.log("Moving to next page");
          const nextIndex = currentIndex + 1;
          const nextPageId = allPages[nextIndex]._id;
          
          // Make sure we're not already on this page
          if (nextPageId !== page_id) {
            console.log(`Navigating from page ${page_id} to ${nextPageId}`);
            
            // Store updated index in sessionStorage
            sessionStorage.setItem('currentPageIndex', nextIndex.toString());
            
            const keywordParam = itemsString ? `?keywords=${itemsString}` : '';
            navigate(`/project/${projectId}/verify/${nextPageId}${keywordParam}`);
          } else {
            console.log("Already on the next page, not navigating");
          }
        } else {
          console.log("No more pages, going back to edit");
          navigate(`/project/${projectId}/edit`);
        }
      })
      .catch((err) => console.error("Save failed", err));
  }

  function remove() {
    const updated = curr_pages.filter((x) => x !== page_id);
    
    // Get the existing page_keywords
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project`, { _id: projectId })
      .then((projectRes) => {
        const existingProject = projectRes.data.project;
        const pageKeywords = existingProject.page_keywords || {};
        
        // Remove keywords for this page
        if (pageKeywords[page_id]) {
          delete pageKeywords[page_id];
        }
        
        // Now update the project with both pages and keywords
        return axios.post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
          _id: projectId,
          pages: updated,
          page_keywords: pageKeywords
        });
      })
      .then(() => {
        set_curr_pages(updated);
        
        // After removing, navigate to next page
        if (allPages.length > 0 && currentIndex < allPages.length - 1) {
          const nextIndex = currentIndex + 1;
          const nextPageId = allPages[nextIndex]._id;
          
          // Make sure we're not already on this page
          if (nextPageId !== page_id) {
            console.log(`Navigating from page ${page_id} to ${nextPageId}`);
            
            sessionStorage.setItem('currentPageIndex', nextIndex.toString());
            const keywordParam = itemsString ? `?keywords=${itemsString}` : '';
            navigate(`/project/${projectId}/verify/${nextPageId}${keywordParam}`);
          } else {
            console.log("Already on the next page, not navigating");
          }
        } else {
          navigate(`/project/${projectId}/edit`);
        }
      })
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
    if (!text) return "";
    
    // Combine keywords from props and URL params
    const allKeywords = [...(keywords || []), ...keywordsArray];
    
    if (!allKeywords.length && !passages.length) return text;
    
    // Create a copy of the text that we'll transform with highlighted spans
    let result = [];
    
    // Start by finding all passage positions in the text
    const positions = [];
    
    // Add passages to positions
    if (passages.length > 0) {
      passages.forEach(passage => {
        const start = text.indexOf(passage.text);
        if (start >= 0) {
          positions.push({
            start,
            end: start + passage.text.length,
            content: passage.text,
            type: 'passage'
          });
        }
      });
    }
    
    // Add keywords to positions
    if (allKeywords.length > 0) {
      allKeywords.forEach(keyword => {
        let start = text.toLowerCase().indexOf(keyword.toLowerCase());
        while (start >= 0) {
          // Get the actual text with original casing
          const actualText = text.substring(start, start + keyword.length);
          
          positions.push({
            start,
            end: start + keyword.length,
            content: actualText,
            type: 'keyword'
          });
          
          // Find next occurrence
          start = text.toLowerCase().indexOf(keyword.toLowerCase(), start + keyword.length);
        }
      });
    }
    
    // Sort positions by start index
    positions.sort((a, b) => a.start - b.start);
    
    // Handle overlapping positions (prioritize passages over keywords)
    const mergedPositions = [];
    for (const pos of positions) {
      if (mergedPositions.length === 0) {
        mergedPositions.push(pos);
        continue;
      }
      
      const lastPos = mergedPositions[mergedPositions.length - 1];
      
      // Check for overlap
      if (pos.start <= lastPos.end) {
        // If this is a passage and the last was a keyword, replace it
        if (pos.type === 'passage' && lastPos.type === 'keyword') {
          mergedPositions[mergedPositions.length - 1] = pos;
        }
        // Otherwise extend the last position
        else if (pos.end > lastPos.end) {
          lastPos.end = pos.end;
          lastPos.content = text.substring(lastPos.start, lastPos.end);
        }
      } else {
        mergedPositions.push(pos);
      }
    }
    
    // Build the result with highlights
    let lastIndex = 0;
    
    for (const pos of mergedPositions) {
      // Add text before the highlight
      if (pos.start > lastIndex) {
        result.push(text.substring(lastIndex, pos.start));
      }
      
      // Add the highlighted text with class names
      if (pos.type === 'passage') {
        result.push(
          <span 
            key={`passage-${pos.start}`} 
            className="passage-highlight"
            style={{ 
              backgroundColor: '#a8e6cf', 
              padding: '0 2px', 
              margin: '0 1px',
              display: 'inline',
              boxShadow: '0 0 0 2px #a8e6cf',
              borderRadius: '2px',
              color: '#32302d',
              fontFamily: 'inherit'
            }}
          >
            {pos.content}
          </span>
        );
      } else {
        result.push(
          <span 
            key={`keyword-${pos.start}`} 
            className="keyword-highlight"
            style={{ 
              backgroundColor: '#ffff00', 
              padding: '0 2px',
              margin: '0 1px',
              display: 'inline',
              boxShadow: '0 0 0 2px #ffff00',
              borderRadius: '2px',
              color: '#32302d',
              fontFamily: 'inherit'
            }}
          >
            {pos.content}
          </span>
        );
      }
      
      lastIndex = pos.end;
    }
    
    // Add any remaining text
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }
    
    return result;
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle adding topics
  const handleAddTopic = (e) => {
    if (e.key === "Enter" && topicInput.trim()) {
      setUniversalTopics([...universalTopics, topicInput.trim()]);
      setTopicInput("");
      e.preventDefault();
    }
  };

  // Handle removing topics
  const handleRemoveTopic = (topicToRemove) => {
    setUniversalTopics(universalTopics.filter(topic => topic !== topicToRemove));
  };

  // Handle passage selection menu
  const handleTextSelection = useCallback((event) => {
    // Let the browser finish its selection process first
    // by moving this to the end of the current call stack
    requestAnimationFrame(() => {
      const selection = window.getSelection();
      const text = selection.toString().trim();
      
      if (text.length > 0) {
        // Store the text
        setSelectedText(text);
        
        // Store the range for later restoration
        if (selection.rangeCount > 0) {
          // Clone the range immediately
          const range = selection.getRangeAt(0).cloneRange();
          setSelectedRange(range);
          
          // Position the menu below the selection
          const rect = range.getBoundingClientRect();
          setSelectionMenuAnchor({ 
            left: rect.left, 
            top: rect.bottom 
          });
          
          // Force the selection to be reapplied immediately
          // This is crucial for the first selection to remain visible
          window.getSelection().removeAllRanges();
          window.getSelection().addRange(range);
        }
      }
    });
  }, []);

  // Handle saving the selected passage
  const handleSavePassage = () => {
    if (selectedText && selectedText.trim()) {
      // Generate a unique ID string for the passage
      const passageId = String(Date.now());
      
      // Create a properly formatted passage object
      const newPassage = {
        id: passageId,
        text: selectedText.trim(),
        start: 0,
        end: 0
      };
      
      // Initialize an empty note for this passage to prevent undefined errors later
      setPassageNotes(prevNotes => ({
        ...prevNotes,
        [passageId]: ""
      }));
      
      // Add the new passage to the existing passages
      setPassages(prevPassages => [...prevPassages, newPassage]);
      
      // Show note panel after adding passage
      setNotesOpen(true);
      setTabValue(1); // Switch to the passages tab
      
      // Clear our state and the selection
      setSelectionMenuAnchor(null);
      setSelectedText("");
      setSelectedRange(null);
      window.getSelection().removeAllRanges();
      
      console.log("Created passage:", newPassage);
    }
  };

  // Use document.onmouseup instead of a React handler to ensure we catch all selections
  useEffect(() => {
    const handleDocumentMouseUp = (event) => {
      // Only handle selections within our text container
      if (event.target.closest('.selectable-text-container')) {
        handleTextSelection(event);
      }
    };
    
    document.addEventListener('mouseup', handleDocumentMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleDocumentMouseUp);
    };
  }, [handleTextSelection]);
  
  // Handle clearing the selection when clicking away
  const handleClearSelection = useCallback((event) => {
    // Don't clear if clicking on the menu or within textContainer (selecting text)
    if (event.target && (
      event.target.closest('.MuiMenu-paper') || 
      event.target.closest('.MuiMenuItem-root') ||
      event.target.closest('.selectable-text-container')
    )) {
      return;
    }
    
    // Clear the menu and selection state
    setSelectionMenuAnchor(null);
    setSelectedText("");
    setSelectedRange(null);
  }, []);

  // Set up document-wide click listener
  useEffect(() => {
    document.addEventListener('mousedown', handleClearSelection);
    
    return () => {
      document.removeEventListener('mousedown', handleClearSelection);
    };
  }, [handleClearSelection]);

  // This effect ensures the selection remains visible when the menu is open
  useEffect(() => {
    // Skip if we don't have both a range and a menu
    if (!selectedRange || !selectionMenuAnchor) return;
    
    // Create a function to reapply the selection
    const reapplySelection = () => {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(selectedRange);
    };
    
    // Apply immediately
    reapplySelection();
    
    // Also set up an interval to keep reapplying the selection
    // This helps prevent the browser from clearing it
    const intervalId = setInterval(reapplySelection, 100);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [selectedRange, selectionMenuAnchor]);

  // Handle updating passage notes
  const handlePassageNoteChange = (passageId, note) => {
    setPassageNotes({
      ...passageNotes,
      [passageId]: note
    });
  };
  
  // Handle deleting a passage
  const handleDeletePassage = (passageId) => {
    if (!passageId) return;
    
    // Convert to string in case it's a number
    const passageIdStr = String(passageId);
    
    // Remove passage from the array
    setPassages(prevPassages => 
      prevPassages.filter(passage => String(passage.id) !== passageIdStr)
    );
    
    // Also remove any notes associated with this passage
    setPassageNotes(prevNotes => {
      const updatedNotes = {...prevNotes};
      delete updatedNotes[passageIdStr];
      return updatedNotes;
    });
    
    console.log("Deleted passage with ID:", passageIdStr);
  };

  // Handle save all metadata
  const handleSaveMetadata = () => {
    // This would send the data to the API endpoints
    console.log("Saving metadata...");
    
    // For universal metadata
    if (universalDate || universalTopics.length > 0) {
      const universalMetadata = {
        date: universalDate,
        topics: universalTopics
      };
      
      // Call API to update universal metadata
      console.log("Universal metadata:", universalMetadata);
      // axios.post endpoint would go here
    }
    
    // For project-specific metadata
    const projectMetadata = {
      passages: passages,
      page_notes: pageNote,
      passage_notes: passageNotes
    };
    
    // Call API to update project metadata
    console.log("Project metadata:", projectMetadata);
    // axios.post endpoint would go here
    
    // Show success message or handle errors
  };

  // Function to navigate to a specific page
  const navigateToPage = useCallback((pageId, keywordParam = "") => {
    if (pageId === page_id) return; // Don't navigate if already on this page
    
    const targetUrl = `/project/${projectId}/verify/${pageId}${keywordParam}`;
    navigate(targetUrl);
  }, [projectId, page_id, navigate]);
  
  // Function to navigate to edit view
  const navigateToEdit = useCallback(() => {
    const targetUrl = `/project/${projectId}/edit`;
    navigate(targetUrl);
  }, [projectId, navigate]);
  
  // Update the navigation buttons to use the new functions
  const handlePrevResult = () => {
    if (allPages.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevPageId = allPages[prevIndex]._id;
      
      console.log(`Moving to previous result (index ${prevIndex})`);
      sessionStorage.setItem('currentPageIndex', prevIndex.toString());
      
      const keywordParam = itemsString ? `?keywords=${itemsString}` : '';
      navigateToPage(prevPageId, keywordParam);
    }
  };
  
  const handleNextResult = () => {
    if (allPages.length > 0 && currentIndex < allPages.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextPageId = allPages[nextIndex]._id;
      
      console.log(`Moving to next result (index ${nextIndex})`);
      sessionStorage.setItem('currentPageIndex', nextIndex.toString());
      
      const keywordParam = itemsString ? `?keywords=${itemsString}` : '';
      navigateToPage(nextPageId, keywordParam);
    }
  };

  if (!panel) return null;
  return (
    <Box sx={{ display: 'flex', position: 'relative' }}>
      <Box sx={{ 
        width: notesOpen ? 'calc(100% - 450px)' : '100%',
        transition: 'width 0.3s ease-in-out',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Stack 
          sx={{
            flexDirection: "row",
            gap: 4,
            justifyContent: "center",
            mt: 2,
            mb: 2,
            px: 4,
            flex: 1,
            overflow: 'hidden'
          }}
        >
          <Stack 
            sx={{
              width: '50%',
              height: '100%',
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              backgroundColor: '#f9f7f1',
              position: 'relative'
            }}
          >
            <Box 
              sx={{
                height: '100%',
                overflow: 'auto',
                padding: '30px 40px',
                fontSize: '17px',
                lineHeight: 1.8,
                backgroundColor: '#f9f7f1',
                color: '#32302d',
                fontFamily: '"Georgia", "Cambria", "Times New Roman", serif',
                letterSpacing: '0.01em',
                '& p, & div': { 
                  marginBottom: '1.2em',
                  maxWidth: '42em',
                },
                '& .passage-highlight': {
                  backgroundColor: '#a8e6cf',
                  padding: '0 2px',
                  margin: '0 1px',
                  borderRadius: '2px',
                  boxShadow: '0 0 0 1px #a8e6cf',
                  fontFamily: 'inherit',
                },
                '& .keyword-highlight': {
                  backgroundColor: '#ffff00',
                  padding: '0 2px',
                  margin: '0 1px',
                  borderRadius: '2px',
                  boxShadow: '0 0 0 1px #ffff00',
                  fontFamily: 'inherit',
                }
              }}
              className="selectable-text-container"
            >
              {highlightKeywords(panel.text)}
            </Box>
          </Stack>
          
          <Stack 
            sx={{
              width: '50%',
              height: '100%',
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              backgroundColor: '#f9f7f1',
              position: 'relative'
            }}
          >
            <Box 
              sx={{
                width: "100%",
                height: "100%",
                overflow: "auto",
                cursor: "zoom-in",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "flex-start",
                backgroundColor: '#f9f7f1'
              }} 
              onWheel={handleWheel}
            >
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
            <IconButton 
              onClick={() => setNotesOpen(!notesOpen)}
              sx={{
                position: 'absolute',
                bottom: 10,
                right: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                color: notesOpen ? 'primary.main' : 'inherit'
              }}
              aria-label="Toggle notes"
            >
              <NotesIcon />
            </IconButton>
          </Stack>
        </Stack>

        <Box sx={{ textAlign: 'center', mt: 1, mb: 1 }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Search Results: Page {currentIndex + 1} of {allPages.length}
          </Typography>
          
          {panel && (
            <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
              Volume: {panel.volume_title} | Page {panel.page_number}
            </Typography>
          )}
        </Box>

        <Stack 
          sx={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 2,
            mt: 1,
            mb: 3,
            px: 4
          }}
        >
          <Button
            variant="outlined"
            onClick={handlePrevResult}
            disabled={currentIndex <= 0}
            sx={sx.doubleArrowButton}
          >
            ←←
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => {
              // Navigate to adjacent page in text (previous)
              console.log(`Navigating to previous physical page from ${page_id}`);
              
              axios.post(`${import.meta.env.VITE_BE_URL}/api/page/adjacent`, {
                page_id: page_id,
                direction: "previous"
              })
              .then(response => {
                if (response.data && response.data.page) {
                  const prevPage = response.data.page;
                  console.log(`Found previous page: ${prevPage._id}`);
                  
                  // Find if this page is in our results
                  const pageIndex = allPages.findIndex(p => p._id === prevPage._id);
                  if (pageIndex >= 0) {
                    // If it's in our results, update the current index
                    sessionStorage.setItem('currentPageIndex', pageIndex.toString());
                  }
                  
                  const keywordParam = itemsString ? `?keywords=${itemsString}` : '';
                  navigateToPage(prevPage._id, keywordParam);
                } else {
                  console.log("No previous page found");
                }
              })
              .catch(error => {
                console.error("Error finding previous page:", error);
              });
            }}
            sx={sx.arrowButton}
          >
            ←
          </Button>
        
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
          
          <Button
            variant="outlined"
            onClick={() => {
              // Navigate to adjacent page in text (next)
              console.log(`Navigating to next physical page from ${page_id}`);
              
              axios.post(`${import.meta.env.VITE_BE_URL}/api/page/adjacent`, {
                page_id: page_id,
                direction: "next"
              })
              .then(response => {
                if (response.data && response.data.page) {
                  const nextPage = response.data.page;
                  console.log(`Found next page: ${nextPage._id}`);
                  
                  // Find if this page is in our results
                  const pageIndex = allPages.findIndex(p => p._id === nextPage._id);
                  if (pageIndex >= 0) {
                    // If it's in our results, update the current index
                    sessionStorage.setItem('currentPageIndex', pageIndex.toString());
                  }
                  
                  const keywordParam = itemsString ? `?keywords=${itemsString}` : '';
                  navigateToPage(nextPage._id, keywordParam);
                } else {
                  console.log("No next page found");
                }
              })
              .catch(error => {
                console.error("Error finding next page:", error);
              });
            }}
            sx={sx.arrowButton}
          >
            →
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleNextResult}
            disabled={currentIndex >= allPages.length - 1}
            sx={sx.doubleArrowButton}
          >
            →→
          </Button>
        </Stack>
        
        <Stack 
          sx={{
            flexDirection: "row",
            justifyContent: "center",
            mb: 3
          }}
        >
          <Button 
            variant="outlined" 
            onClick={navigateToEdit}
            sx={{ px: 4 }}
          >
            Back to Overview
          </Button>
        </Stack>
      </Box>
      
      <Menu
        open={Boolean(selectionMenuAnchor)}
        anchorReference="anchorPosition"
        anchorPosition={
          selectionMenuAnchor
            ? { top: selectionMenuAnchor.top, left: selectionMenuAnchor.left }
            : undefined
        }
        onClose={handleClearSelection}
        sx={{ pointerEvents: 'none' }}
        PaperProps={{ sx: { pointerEvents: 'auto' } }}
        disableAutoFocus
        disableEnforceFocus
        disableRestoreFocus
      >
        <MenuItem 
          onClick={handleSavePassage}
          dense
        >
          <TextFieldsIcon fontSize="small" sx={{ mr: 1 }} />
          Save as passage
        </MenuItem>
      </Menu>
      
      <Notes 
        notesOpen={notesOpen}
        setNotesOpen={setNotesOpen}
        passages={passages}
        setPassages={setPassages}
        passageNotes={passageNotes}
        setPassageNotes={setPassageNotes}
        universalDate={universalDate}
        setUniversalDate={setUniversalDate}
        universalTopics={universalTopics}
        setUniversalTopics={setUniversalTopics}
        pageNote={pageNote}
        setPageNote={setPageNote}
        handleDeletePassage={handleDeletePassage}
        handleSaveMetadata={handleSaveMetadata}
        projectId={projectId}
        page_id={page_id}
      />
    </Box>
  );
}

const sx = {
  button: {
    textTransform: "none",
    px: 4,
    py: 1.2,
    minWidth: 100
  },
  arrowButton: {
    minWidth: "46px",
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    padding: 0,
    fontWeight: "bold",
    fontSize: "20px",
  },
  doubleArrowButton: {
    minWidth: "46px",
    width: "46px",
    height: "46px",
    borderRadius: "50%",
    padding: 0,
    fontWeight: "bold",
    fontSize: "18px",
  }
};
