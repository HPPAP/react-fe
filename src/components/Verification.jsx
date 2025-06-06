import { useState, useEffect, useCallback, useRef } from "react";
import { Stack, Typography, TextField, Button, Box, IconButton, Drawer, Paper, Tabs, Tab, Divider, FormControlLabel, Switch, Chip, InputAdornment, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, MenuItem, Menu } from "@mui/material";
import "../App.css";
import { Link, useParams, useSearchParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import NotesIcon from '@mui/icons-material/Notes';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import DeleteIcon from '@mui/icons-material/Delete';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import SaveIcon from '@mui/icons-material/Save';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import Notes from "./Notes";

// Define color palette for different projects' passages
const PROJECT_COLORS = [
  '#ffb347', // Current project - orange
  '#a8e6cf80', // Light green with transparency
  '#54c8e880', // Light blue with transparency
  '#cc99ff80', // Purple with transparency
  '#ff6b6b60', // Red with lower transparency
  '#4d96ff60', // Blue with lower transparency
  '#7ec85060', // Light green with lower transparency
  '#ff9cee60', // Pink with lower transparency
  '#d0b49f60', // Tan with lower transparency
  '#ffdb5860'  // Yellow with lower transparency
];

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
  
  // Add a state to track the referrer
  const [referrer, setReferrer] = useState("view"); // Default to view
  
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

  // Add back textContainerRef
  const textContainerRef = useRef(null);

  // Get all pages data either from props or from sessionStorage
  const [allPages, setAllPages] = useState(() => {
    // Try to get pages from props first
    if (panels && panels.length > 0) {
      return panels;
    }
    
    // Otherwise try to get from sessionStorage
    try {
      // First check for pageIds (new approach with just IDs)
      const pageIdsFromStorage = sessionStorage.getItem('pageIds');
      if (pageIdsFromStorage) {
        const pageIds = JSON.parse(pageIdsFromStorage);
        // Return array of objects with just _id property
        return pageIds.map(id => ({ _id: id }));
      }
      
      // Fall back to old approach with full page data
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

  // Helper function to format collection name
  const formatCollectionName = (volumeSet) => {
    if (!volumeSet) return "Unknown Collection";
    
    // Capitalize first letter of each word 
    return volumeSet
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
      
      // Do not automatically close the notes panel when switching pages
      // This provides a more consistent UI experience
      
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

          // DEBUG: Check for text content and formatting
          if (pageData && pageData.text) {
            // Log the first 100 characters to check content
            console.log("DEBUG - Page text preview:", 
              JSON.stringify(pageData.text.substring(0, 100)));
            
            // Check for significant whitespace or newlines that might affect matching
            const whitespaceCount = (pageData.text.match(/\s/g) || []).length;
            const newlineCount = (pageData.text.match(/\n/g) || []).length;
            const percentWhitespace = Math.round((whitespaceCount / pageData.text.length) * 100);
            
            console.log("DEBUG - Text stats:", {
              length: pageData.text.length,
              whitespaceCount,
              newlineCount,
              percentWhitespace: `${percentWhitespace}%`
            });
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
          console.log("DEBUG - Loading passages:", metadata.passages.length);
          console.log("DEBUG - Raw passages data:", JSON.stringify(metadata.passages));
          
          // Ensure each passage has the required fields
          const validPassages = metadata.passages.filter(p => p && p.text);
          
          // Check if we have valid passages
          if (validPassages.length > 0) {
            console.log("DEBUG - Setting valid passages:", JSON.stringify(validPassages));
            setPassages(validPassages);
          } else {
            console.log("DEBUG - No valid passages found");
            setPassages([]);
          }
        } else {
          console.log("DEBUG - No passages found in metadata");
          setPassages([]);
        }
        
        // Load page notes if available
        if (metadata.page_notes) {
          setPageNote(metadata.page_notes);
        }
        
        // Load passage notes if available
        if (metadata.passage_notes) {
          setPassageNotes(metadata.passage_notes);
        }
      } else {
        // Reset if no metadata found
        console.log("DEBUG - No metadata found, resetting passages");
        setPassages([]);
        setPageNote("");
        setPassageNotes({});
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

  // State for cross-project passages
  const [otherProjectPassages, setOtherProjectPassages] = useState([]);
  const [projectsWithPassages, setProjectsWithPassages] = useState([]);
  const [selectedHighlightProjects, setSelectedHighlightProjects] = useState("current"); // "current", "all", or specific project ID

  // Function to load passages from other projects for this page
  const loadOtherProjectPassages = async (pageId) => {
    if (!pageId || !projectId) return;
    
    try {
      const response = await axios.post(`${import.meta.env.VITE_BE_URL}/api/page/passages/all-projects`, {
        page_id: pageId,
        current_project_id: projectId
      });
      
      if (response.data.success && response.data.projects) {
        console.log("Other projects with passages:", response.data.projects);
        
        const projects = response.data.projects;
        setProjectsWithPassages(projects);
        
        // Flatten all passages with project info
        const allPassages = [];
        projects.forEach((project, index) => {
          const colorIndex = (index % (PROJECT_COLORS.length - 1)) + 1; // Skip first color (reserved for current project)
          const projectColor = PROJECT_COLORS[colorIndex];
          
          if (project.passages && project.passages.length > 0) {
            const projectPassages = project.passages.map(passage => ({
              ...passage,
              projectId: project.project_id,
              projectTitle: project.project_title,
              color: projectColor
            }));
            
            allPassages.push(...projectPassages);
          }
        });
        
        setOtherProjectPassages(allPassages);
      }
    } catch (error) {
      console.error("Error loading other project passages:", error);
    }
  };

  // Update effect to load passages when page changes
  useEffect(() => {
    if (page_id) {
      loadOtherProjectPassages(page_id);
    }
  }, [page_id, projectId]);

  // Add state for search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchResult, setCurrentSearchResult] = useState(0);
  const [showSearch, setShowSearch] = useState(false);

  // Add function to handle search
  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !panel?.text) {
      setSearchResults([]);
      return;
    }
    
    const query = searchQuery.trim().toLowerCase();
    const text = panel.text.toLowerCase();
    const results = [];
    
    let index = text.indexOf(query);
    while (index !== -1) {
      results.push({
        start: index,
        end: index + query.length,
        text: panel.text.substring(index, index + query.length)
      });
      index = text.indexOf(query, index + 1);
    }
    
    setSearchResults(results);
    setCurrentSearchResult(results.length > 0 ? 0 : -1);
    
    // Scroll to first result if found
    if (results.length > 0) {
      scrollToSearchResult(0);
    }
  }, [searchQuery, panel]);
  
  // Add effect to trigger search on query change
  useEffect(() => {
    handleSearch();
  }, [searchQuery, handleSearch]);
  
  // Function to scroll to a specific search result
  const scrollToSearchResult = (resultIndex) => {
    if (resultIndex < 0 || !searchResults.length || resultIndex >= searchResults.length) {
      return;
    }
    
    const result = searchResults[resultIndex];
    const textContainer = document.querySelector('.selectable-text-container');
    if (!textContainer) return;
    
    // Create a temporary element for the result
    const tempElement = document.createElement('span');
    tempElement.id = `search-result-${resultIndex}`;
    tempElement.className = 'search-result current';
    tempElement.textContent = result.text;
    
    // Find the text node containing this result
    const textNodes = [];
    const walkTree = (node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node);
      } else {
        for (const child of node.childNodes) {
          walkTree(child);
        }
      }
    };
    
    walkTree(textContainer);
    
    // Find the cumulative text position to identify which text node contains our result
    let currentPosition = 0;
    let targetNode = null;
    let localStart = 0;
    
    for (const node of textNodes) {
      const nodeLength = node.textContent.length;
      if (currentPosition <= result.start && result.start < currentPosition + nodeLength) {
        targetNode = node;
        localStart = result.start - currentPosition;
        break;
      }
      currentPosition += nodeLength;
    }
    
    if (targetNode) {
      // Create a range around the search result
      const range = document.createRange();
      range.setStart(targetNode, localStart);
      range.setEnd(targetNode, localStart + result.text.length);
      
      // Get the rect of this range
      const rects = range.getClientRects();
      if (rects.length > 0) {
        const rect = rects[0];
        
        // Scroll the element into view
        textContainer.scrollTo({
          top: rect.top + textContainer.scrollTop - textContainer.offsetTop - 100,
          behavior: 'smooth'
        });
        
        // Highlight the current result differently
        // First remove any existing "current" class
        const currentElements = textContainer.querySelectorAll('.search-result.current');
        currentElements.forEach(el => {
          el.classList.remove('current');
        });
        
        // Then find our highlight and add the current class
        setTimeout(() => {
          const highlights = textContainer.querySelectorAll('.search-result');
          if (highlights[resultIndex]) {
            highlights[resultIndex].classList.add('current');
          }
        }, 100);
      }
    }
  };
  
  // Function to navigate to next/previous search result
  const navigateSearchResults = (direction) => {
    if (!searchResults.length) return;
    
    let newIndex;
    if (direction === 'next') {
      newIndex = (currentSearchResult + 1) % searchResults.length;
    } else {
      newIndex = (currentSearchResult - 1 + searchResults.length) % searchResults.length;
    }
    
    setCurrentSearchResult(newIndex);
    scrollToSearchResult(newIndex);
  };
  
  // Handle key press in search field
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      navigateSearchResults('next');
    } else if (e.key === 'Escape') {
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  // Modified highlightKeywords function to include search results
  const highlightKeywords = (text) => {
    if (!text) return "";
    
    // Combine keywords from props and URL params
    const allKeywords = [...(keywords || []), ...keywordsArray];
    
    // Determine which passages to highlight based on selectedHighlightProjects
    let passagesToHighlight = [...passages]; // Always include current project passages
    
    // Add passages from other projects if "all" is selected
    if (selectedHighlightProjects === "all") {
      passagesToHighlight = [...passages, ...otherProjectPassages];
    }
    
    if (!allKeywords.length && !passagesToHighlight.length && !searchResults.length) return text;

    console.log("DEBUG - highlightKeywords called with:", {
      textLength: text?.length || 0,
      keywordsCount: allKeywords?.length || 0,
      passagesCount: passagesToHighlight?.length || 0,
      searchResultsCount: searchResults?.length || 0
    });
    
    // Create a copy of the text that we'll transform with highlighted spans
    let result = [];
    
    // Start by finding all positions in the text that need highlighting
    const positions = [];
    
    // Normalize text functions - used to handle potential whitespace differences
    const normalizeText = (str) => {
      if (!str) return "";
      // Replace multiple whitespace with single space and trim
      return str.replace(/\s+/g, ' ').trim();
    };
    
    // Helper function to try different matching approaches
    const findTextPosition = (needle, haystack) => {
      if (!needle || !haystack) return -1;
      
      // Try exact match first
      let start = haystack.indexOf(needle);
      if (start >= 0) return start;
      
      // Normalize and try again
      const normalizedNeedle = normalizeText(needle);
      const normalizedHaystack = normalizeText(haystack);
      start = normalizedHaystack.indexOf(normalizedNeedle);
      
      // If normalized match found, map back to original text position
      if (start >= 0) {
        console.log(`DEBUG - Found normalized match for "${normalizedNeedle}" at position ${start} in normalized text`);
        
        // Find the actual start position in the original text
        let charCount = 0;
        let originalIndex = 0;
        
        // Scan through the original text counting normalized characters 
        // until we reach our target position
        while (charCount < start && originalIndex < haystack.length) {
          // Skip multiple whitespace in original text when counting normalized chars
          if (haystack[originalIndex].match(/\s/) && 
              originalIndex + 1 < haystack.length && 
              haystack[originalIndex + 1].match(/\s/)) {
            originalIndex++;
            continue;
          }
          
          charCount++;
          originalIndex++;
        }
        
        console.log(`DEBUG - Mapped normalized position ${start} to original position ${originalIndex}`);
        return originalIndex;
      }
      
      return -1;
    };
    
    // Add passages to positions
    if (passagesToHighlight.length > 0) {
      passagesToHighlight.forEach(passage => {
        if (!passage.text) {
          console.log("DEBUG - Skipping passage with no text:", passage);
          return;
        }
        
        const start = findTextPosition(passage.text, text);
        if (start >= 0) {
          console.log(`DEBUG - Found passage "${passage.text}" at position ${start}`);
          positions.push({
            start,
            end: start + passage.text.length,
            content: passage.text,
            type: 'passage',
            id: passage.id,
            projectId: passage.projectId || 'current',
            color: passage.color || PROJECT_COLORS[0] // Use first color for current project
          });
        } else {
          console.log(`DEBUG - Could not find passage text in document: "${passage.text}"`);
          // Try finding a substring match for longer passages
          if (passage.text.length > 20) {
            const subtext = passage.text.substring(0, 20);
            const subStart = findTextPosition(subtext, text);
            if (subStart >= 0) {
              console.log(`DEBUG - Found partial match for "${subtext}" at position ${subStart}`);
              
              // Find a reasonable end point that doesn't go past text boundaries
              const potentialEnd = Math.min(
                subStart + passage.text.length,
                text.length
              );
              
              // Create a match with the found text
              const foundText = text.substring(subStart, potentialEnd);
              console.log(`DEBUG - Using approx match: "${foundText.substring(0, 30)}..."`);
              
              positions.push({
                start: subStart,
                end: potentialEnd,
                content: foundText,
                type: 'passage',
                id: passage.id,
                projectId: passage.projectId || 'current',
                color: passage.color || PROJECT_COLORS[0]
              });
            }
          }
        }
      });
    } else {
      console.log("DEBUG - No passages to highlight");
    }
    
    // Add keywords to positions
    if (allKeywords.length > 0) {
      allKeywords.forEach(keyword => {
        if (!keyword) return;
        
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
    
    // Add search results to positions
    if (searchResults.length > 0 && searchQuery.trim()) {
      searchResults.forEach((result, index) => {
        positions.push({
          start: result.start,
          end: result.end,
          content: result.text,
          type: 'search',
          index: index,
          isCurrent: index === currentSearchResult
        });
      });
    }
    
    console.log(`DEBUG - Total positions to highlight: ${positions.length}`);
    
    // Sort positions by start index
    positions.sort((a, b) => a.start - b.start);
    
    // Handle overlapping positions (prioritize passages over keywords over search)
    const mergedPositions = [];
    for (const pos of positions) {
      if (mergedPositions.length === 0) {
        mergedPositions.push(pos);
        continue;
      }
      
      const lastPos = mergedPositions[mergedPositions.length - 1];
      
      // Check for overlap
      if (pos.start <= lastPos.end) {
        // Prioritize by type
        const typePriority = { passage: 3, keyword: 2, search: 1 };
        const currentPriority = typePriority[lastPos.type] || 0;
        const newPriority = typePriority[pos.type] || 0;
        
        // If new position has higher priority, replace last position
        if (newPriority > currentPriority) {
          mergedPositions[mergedPositions.length - 1] = pos;
        }
        // Otherwise extend the last position if needed
        else if (pos.end > lastPos.end) {
          lastPos.end = pos.end;
          lastPos.content = text.substring(lastPos.start, lastPos.end);
        }
      } else {
        mergedPositions.push(pos);
      }
    }
    
    console.log(`DEBUG - Merged positions: ${mergedPositions.length}`);
    
    // Build the result with highlights
    let lastIndex = 0;
    
    for (const pos of mergedPositions) {
      // Add text before the highlight
      if (pos.start > lastIndex) {
        result.push(text.substring(lastIndex, pos.start));
      }
      
      // Add the highlighted text with class names
      if (pos.type === 'passage') {
        console.log(`DEBUG - Adding passage highlight for "${pos.content.substring(0, 30)}..."`);
        
        // Determine if this is from current project or another project
        const isCurrentProject = !pos.projectId || pos.projectId === 'current';
        
        // Create style object with different styling for current vs other projects
        const highlightStyle = {
          backgroundColor: pos.color || '#a8e6cf', 
          padding: '0 2px', 
          margin: '0 1px',
          display: 'inline',
          boxShadow: `0 0 0 1px ${pos.color || '#a8e6cf'}`,
          borderRadius: '2px',
          color: '#32302d',
          fontFamily: 'inherit'
        };
        
        // Apply more subtle styling for other projects' passages
        if (!isCurrentProject) {
          highlightStyle.boxShadow = `0 0 0 1px ${pos.color || '#a8e6cf80'}`;
          highlightStyle.borderStyle = 'dashed';
          highlightStyle.borderWidth = '1px';
          highlightStyle.borderColor = pos.color.replace('80', '');
          highlightStyle.backgroundColor = pos.color;
        }
        
        result.push(
          <span 
            key={`passage-${pos.start}-${pos.id || ''}`} 
            className={isCurrentProject ? "passage-highlight" : "passage-highlight-other"}
            style={highlightStyle}
            data-passage-id={pos.id || ''}
            data-project-id={pos.projectId || 'current'}
          >
            {pos.content}
          </span>
        );
      } else if (pos.type === 'keyword') {
        result.push(
          <span 
            key={`keyword-${pos.start}`} 
            className="keyword-highlight"
            style={{ 
              backgroundColor: '#ffff00', 
              padding: '0 2px',
              margin: '0 1px',
              display: 'inline',
              boxShadow: '0 0 0 1px #ffff00',
              borderRadius: '2px',
              color: '#32302d',
              fontFamily: 'inherit'
            }}
          >
            {pos.content}
          </span>
        );
      } else if (pos.type === 'search') {
        // Add special highlighting for search results
        result.push(
          <span 
            key={`search-${pos.start}-${pos.index}`} 
            className={`search-result ${pos.isCurrent ? 'current' : ''}`}
            style={{ 
              backgroundColor: pos.isCurrent ? '#ff6b6b' : '#ff9f80', 
              padding: '0 2px',
              margin: '0 1px',
              display: 'inline',
              boxShadow: `0 0 0 1px ${pos.isCurrent ? '#ff6b6b' : '#ff9f80'}`,
              borderRadius: '2px',
              color: '#32302d',
              fontFamily: 'inherit'
            }}
            data-search-index={pos.index}
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
    
    console.log(`DEBUG - Generated ${result.length} output elements`);
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
      console.log("DEBUG - Creating new passage:", newPassage);
      setPassages(prevPassages => {
        const updatedPassages = [...prevPassages, newPassage];
        console.log("DEBUG - Updated passages:", updatedPassages);
        return updatedPassages;
      });
      
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
    
    // Make sure notes panel stays open after deletion
    // This ensures the user can continue working with passages
    setNotesOpen(true);
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
  
  // Add reference to location to get the referrer
  const location = useLocation();
  
  // Determine the referrer when component mounts
  useEffect(() => {
    // Check if we have a referrer in sessionStorage
    const storedReferrer = sessionStorage.getItem('verification_referrer');
    if (storedReferrer) {
      setReferrer(storedReferrer);
    } else {
      // Default to "view" if no referrer found
      setReferrer("view");
    }
  }, []);
  
  // Update the navigateToEdit function to use the correct destination
  const navigateToOverview = useCallback(() => {
    // Navigate to the appropriate page based on referrer
    navigate(`/project/${projectId}${referrer === 'edit' ? '/edit' : ''}`);
  }, [projectId, navigate, referrer]);
  
  // Handle navigation to next result
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
  
  // Handle navigation to previous result
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

  // Add effect to monitor passages and highlighting
  useEffect(() => {
    if (passages.length > 0 && panel?.text) {
      console.log(`DEBUG - Passages state updated: ${passages.length} passages`);
      // Force re-render of highlights when passages change
      const textContainer = document.querySelector('.selectable-text-container');
      if (textContainer) {
        // Check if highlights are rendering
        setTimeout(() => {
          const highlights = textContainer.querySelectorAll('.passage-highlight');
          console.log(`DEBUG - After passages update: Found ${highlights.length} highlighted passages in DOM`);
        }, 500);
      }
    }
  }, [passages, panel]);

  // Function to scroll to a passage by its ID
  const scrollToPassage = (passageId) => {
    if (!passageId) return;
    
    console.log(`Scrolling to passage with ID: ${passageId}`);
    
    // Find the passage text in the array
    const passage = passages.find(p => String(p.id) === String(passageId));
    
    // If not found in current project passages, try to find in other projects
    const otherPassage = !passage && otherProjectPassages.length > 0 
      ? otherProjectPassages.find(p => String(p.id) === String(passageId))
      : null;
      
    const targetPassage = passage || otherPassage;
    
    if (!targetPassage || !targetPassage.text) {
      console.log(`Passage with ID ${passageId} not found or has no text`);
      return;
    }
    
    // Find the highlight element in the DOM
    const textContainer = document.querySelector('.selectable-text-container');
    if (!textContainer) return;
    
    // Try to find by data-passage-id first (most reliable)
    let highlightEl = textContainer.querySelector(`[data-passage-id="${passageId}"]`);
    
    // If not found by ID, try to find by text content
    if (!highlightEl) {
      const allHighlights = textContainer.querySelectorAll('.passage-highlight, .passage-highlight-other');
      for (const el of allHighlights) {
        if (el.textContent === targetPassage.text) {
          highlightEl = el;
          break;
        }
      }
    }
    
    if (highlightEl) {
      // Scroll the element into view with smooth behavior
      highlightEl.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      
      // Add a smooth transition effect to highlight the passage
      const originalBackgroundColor = highlightEl.style.backgroundColor; // Store the original highlight color
      
      // Set initial transition properties for smooth animation
      highlightEl.style.transition = 'background-color 1.5s ease';
      
      // Flash effect - bright orange highlight that fades back to original color
      highlightEl.style.backgroundColor = '#ff9e80';
      
      // Set a timeout to fade back to the original color
      setTimeout(() => {
        highlightEl.style.backgroundColor = originalBackgroundColor;
      }, 800);
    } else {
      console.log(`No highlight element found for passage: ${targetPassage.text.substring(0, 30)}...`);
    }
  };

  if (!panel) return null;
  
  // Check if this is a Statutes of the Realm document
  const isStatutesDocument = panel.volume_set === "statutes of the realm";
  
  return (
    <Box sx={{ display: 'flex', position: 'relative' }}>
      {/* Add Back button at the top left */}
      <Button 
        variant="outlined" 
        onClick={navigateToOverview}
        startIcon={<HomeIcon />}
        sx={{ 
          position: 'absolute',
          bottom: 20,
          left: 20,
          zIndex: 10,
          color: '#fff',
          borderColor: 'rgba(255, 255, 255, 0.5)',
          '&:hover': { 
            borderColor: '#fff',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          },
          px: 2,
          py: 1,
          borderRadius: 2,
          textTransform: 'none',
          fontWeight: 500
        }}
      >
        {referrer === 'edit' ? 'Back to Search' : 'Back to Overview'}
      </Button>

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
              width: isStatutesDocument ? '100%' : '50%', // Full width for Statutes, half for others
              height: '100%',
              borderRadius: 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              overflow: 'hidden',
              backgroundColor: '#f9f7f1',
              position: 'relative'
            }}
          >
            <Box 
              ref={textContainerRef}
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
                  maxWidth: isStatutesDocument ? '60em' : '42em', // Wider for Statutes
                },
                '& .passage-highlight': {
                  backgroundColor: '#ffb347', 
                  padding: '0 2px', 
                  margin: '0 1px',
                  display: 'inline',
                  boxShadow: '0 0 0 1px #ffb347',
                  borderRadius: '2px',
                  color: '#32302d',
                  fontFamily: 'inherit'
                },
                '& .passage-highlight-other': {
                  padding: '0 2px',
                  margin: '0 1px',
                  display: 'inline',
                  borderRadius: '2px',
                  color: '#32302d',
                  fontFamily: 'inherit'
                },
                '& .keyword-highlight': {
                  backgroundColor: '#ffff00', 
                  padding: '0 2px',
                  margin: '0 1px',
                  display: 'inline',
                  boxShadow: '0 0 0 1px #ffff00',
                  borderRadius: '2px',
                  color: '#32302d',
                  fontFamily: 'inherit'
                },
                '& .search-result': {
                  backgroundColor: '#ff9f80',
                  padding: '0 2px',
                  margin: '0 1px',
                  display: 'inline',
                  boxShadow: '0 0 0 1px #ff9f80',
                  borderRadius: '2px',
                  color: '#32302d',
                  fontFamily: 'inherit'
                },
                '& .search-result.current': {
                  backgroundColor: '#ff6b6b',
                  boxShadow: '0 0 0 1px #ff6b6b',
                  fontWeight: 'bold'
                },
                '& ::selection': {
                  backgroundColor: 'rgba(255, 170, 0, 0.3)'
                }
              }}
              className="selectable-text-container"
            >
              {highlightKeywords(panel.text)}
            </Box>
            
            {/* Search Bar */}
            {showSearch && (
              <Box sx={{
                position: 'absolute',
                bottom: 20,
                left: 20,
                display: 'flex',
                alignItems: 'center',
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 2,
                padding: '4px 8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}>
                <TextField
                  size="small"
                  placeholder="Search in text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  variant="outlined"
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: searchResults.length > 0 && (
                      <InputAdornment position="end">
                        <Typography variant="caption" sx={{ mx: 1 }}>
                          {currentSearchResult + 1}/{searchResults.length}
                        </Typography>
                        <Box sx={{ display: 'flex' }}>
                          <IconButton 
                            size="small" 
                            onClick={() => navigateSearchResults('prev')}
                            disabled={searchResults.length === 0}
                          >
                            <KeyboardArrowUpIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => navigateSearchResults('next')}
                            disabled={searchResults.length === 0}
                          >
                            <KeyboardArrowDownIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ width: 300, mr: 1 }}
                />
                <IconButton 
                  size="small" 
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery("");
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}
            
            {/* Search Toggle Button */}
            {!showSearch && (
              <IconButton
                onClick={() => setShowSearch(true)}
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  left: 20,
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.9)' },
                  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                  zIndex: 10
                }}
              >
                <SearchIcon />
              </IconButton>
            )}
          </Stack>
          
          {/* Only show image view for non-Statutes documents */}
          {!isStatutesDocument && (
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
            </Stack>
          )}
        </Stack>

        {/* Page information area with modified spacing */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            mt: 1,
            mb: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            borderRadius: 2,
            py: 1.5,
            px: 3,
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.5,
            maxWidth: 'fit-content'
          }}
        >
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 500, letterSpacing: 0.5 }}>
            Search Results: Page {currentIndex + 1} of {allPages.length}
          </Typography>
          
          {panel && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {/* Database Collection Chip */}
                <Chip 
                  label={formatCollectionName(panel.volume_set)} 
                  size="small"
                  sx={{
                    bgcolor: panel.volume_set === "statutes of the realm" ? '#d1a04f' : '#3f7bb6',
                    color: 'white',
                    fontWeight: 500,
                    fontSize: '0.75rem',
                    height: '20px'
                  }}
                />
                
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                  {panel.volume_title} • Page {panel.page_number}
                </Typography>
              </Box>
              
              {isStatutesDocument && (
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontStyle: 'italic', mt: 0.5 }}>
                  Note: PDF view is not available for Statutes of the Realm documents
                </Typography>
              )}
            </>
          )}
        </Box>

        {/* Redesigned navigation controls - without the Back to Overview button */}
        <Box 
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 2,
            mt: 0.5,
            mb: 2,
            px: 4
          }}
        >
          {/* Left side - Search result navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
              onClick={handlePrevResult}
              disabled={currentIndex <= 0}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                '&.Mui-disabled': { color: 'rgba(255, 255, 255, 0.3)' },
                padding: 1.2
              }}
              size="small"
            >
              <KeyboardDoubleArrowLeftIcon />
            </IconButton>
            
            <IconButton
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
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                padding: 1.2
              }}
              size="small"
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {/* Center - Main actions - removed Back to Overview button */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              onClick={add} 
              startIcon={<SaveIcon />}
              sx={{ 
                bgcolor: '#4caf50', 
                color: 'white',
                '&:hover': { bgcolor: '#43a047' },
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
              }}
            >
              Save
            </Button>
            
            {/* Only show delete button if page is in curr_pages */}
            {curr_pages && curr_pages.includes(page_id) && (
              <Button
                variant="contained"
                onClick={remove}
                startIcon={<DeleteIcon />}
                sx={{ 
                  bgcolor: '#f44336', 
                  color: 'white',
                  '&:hover': { bgcolor: '#e53935' },
                  px: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 500,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                }}
              >
                Remove
              </Button>
            )}
          </Box>
          
          {/* Right side - Document navigation */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconButton
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
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                padding: 1.2
              }}
              size="small"
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
            
            <IconButton
              onClick={handleNextResult}
              disabled={currentIndex >= allPages.length - 1}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' },
                '&.Mui-disabled': { color: 'rgba(255, 255, 255, 0.3)' },
                padding: 1.2
              }}
              size="small"
            >
              <KeyboardDoubleArrowRightIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
      
      {/* Notes button fixed at bottom right of the page */}
      <IconButton 
        onClick={() => setNotesOpen(!notesOpen)}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 1000,
          backgroundColor: 'rgba(66, 133, 244, 0.9)',
          color: 'white',
          '&:hover': {
            backgroundColor: 'rgba(66, 133, 244, 1)',
          },
          boxShadow: '0 3px 8px rgba(0,0,0,0.3)',
          width: 56,
          height: 56
        }}
        aria-label="Toggle notes"
      >
        <NotesIcon />
      </IconButton>
      
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
        scrollToPassage={scrollToPassage}
        projectsWithPassages={projectsWithPassages}
        selectedHighlightProjects={selectedHighlightProjects}
        setSelectedHighlightProjects={setSelectedHighlightProjects}
        projectColors={PROJECT_COLORS}
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
