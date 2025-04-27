import { useState, useEffect } from "react";
import { Stack, Typography, TextField, Button, Box } from "@mui/material";
import "../App.css";
import { Link, useParams, useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

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
  const itemsArray = itemsString ? itemsString.split(",") : [];

  const { page_id, id } = useParams();
  const [panel, set_panel] = useState();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [curr_pages, set_curr_pages] = useState();
  
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

  useEffect(() => {
    setZoomLevel(1);

    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/page/get`, { _id: page_id })
      .then((response) => {
        set_panel(response.data.page);
      })
      .catch((error) => console.log("THIS", error));
  }, [page_id]);

  useEffect(() => {
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project`, { _id: id })
      .then((res) => {
        console.log(res.data);
        set_curr_pages(res.data.project.pages);
      });
  }, [id]);

  function add() {
    const updated = [...new Set([...curr_pages, page_id])];
    console.log("Current index:", currentIndex);
    console.log("All pages:", allPages);
    console.log("All pages length:", allPages?.length);
    
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
        _id: id,
        pages: updated,
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
            navigate(`/project/${id}/verify/${nextPageId}${keywordParam}`);
          } else {
            console.log("Already on the next page, not navigating");
          }
        } else {
          console.log("No more pages, going back to edit");
          navigate(`/project/${id}/edit`);
        }
      })
      .catch((err) => console.error("Save failed", err));
  }

  function remove() {
    const updated = curr_pages.filter((x) => x !== page_id);
    axios
      .post(`${import.meta.env.VITE_BE_URL}/api/project/update`, {
        _id: id,
        pages: updated,
      })
      .then(() => {
        set_curr_pages(updated);
        
        // After removing, can also navigate to next page
        if (allPages.length > 0 && currentIndex < allPages.length - 1) {
          const nextIndex = currentIndex + 1;
          const nextPageId = allPages[nextIndex]._id;
          
          // Make sure we're not already on this page
          if (nextPageId !== page_id) {
            console.log(`Navigating from page ${page_id} to ${nextPageId}`);
            
            sessionStorage.setItem('currentPageIndex', nextIndex.toString());
            const keywordParam = itemsString ? `?keywords=${itemsString}` : '';
            navigate(`/project/${id}/verify/${nextPageId}${keywordParam}`);
          } else {
            console.log("Already on the next page, not navigating");
          }
        } else {
          navigate(`/project/${id}/edit`);
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
        <Button
          variant="outlined"
          onClick={() => {
            // Navigate to previous result (just one step back)
            if (allPages.length > 0 && currentIndex > 0) {
              const prevIndex = currentIndex - 1;
              const prevPageId = allPages[prevIndex]._id;
              
              console.log(`Moving to previous result (index ${prevIndex})`);
              sessionStorage.setItem('currentPageIndex', prevIndex.toString());
              
              const keywordParam = itemsString ? `?keywords=${itemsString}` : '';
              navigate(`/project/${id}/verify/${prevPageId}${keywordParam}`);
            }
          }}
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
                navigate(`/project/${id}/verify/${prevPage._id}${keywordParam}`);
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
                navigate(`/project/${id}/verify/${nextPage._id}${keywordParam}`);
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
          onClick={() => {
            // Navigate to next result (just one step forward)
            if (allPages.length > 0 && currentIndex < allPages.length - 1) {
              const nextIndex = currentIndex + 1;
              const nextPageId = allPages[nextIndex]._id;
              
              console.log(`Moving to next result (index ${nextIndex})`);
              sessionStorage.setItem('currentPageIndex', nextIndex.toString());
              
              const keywordParam = itemsString ? `?keywords=${itemsString}` : '';
              navigate(`/project/${id}/verify/${nextPageId}${keywordParam}`);
            }
          }}
          disabled={currentIndex >= allPages.length - 1}
          sx={sx.doubleArrowButton}
        >
          →→
        </Button>
      </Stack>
      
      <Typography variant="body2" sx={sx.pageCounter}>
        Search Results: Page {currentIndex + 1} of {allPages.length}
      </Typography>
      
      {panel && (
        <Typography variant="body2" sx={sx.volumeCounter}>
          Volume: {panel.volume_title} | Page {panel.page_number}
        </Typography>
      )}

      <Stack sx={sx.navigationStack} direction="row" spacing={2} style={{ display: 'none' }}>
        {/* Removing the old navigation buttons */}
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
    ml: 5,
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
    gap: 2,
    ml: 5,
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
  navigationStack: {
    flexDirection: "row",
    justifyContent: "center",
    mt: 2,
    mb: 2,
    gap: 2,
  },
  arrowButton: {
    minWidth: "40px",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    padding: 0,
    fontWeight: "bold",
    fontSize: "20px",
  },
  doubleArrowButton: {
    minWidth: "40px",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    padding: 0,
    fontWeight: "bold",
    fontSize: "18px",
  },
  pageCounter: {
    textAlign: "center",
    marginTop: 1,
    color: "#666",
  },
  volumeCounter: {
    textAlign: "center",
    marginTop: 0.5,
    marginBottom: 2,
    color: "#666",
  },
};
