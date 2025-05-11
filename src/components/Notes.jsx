import { useState, useEffect } from "react";
import { 
  Box, 
  IconButton, 
  Paper, 
  Typography, 
  Tabs, 
  Tab, 
  TextField, 
  Stack, 
  FormControlLabel, 
  Switch,
  Chip, 
  InputAdornment, 
  Button, 
  Card, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  CircularProgress 
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import DoneIcon from '@mui/icons-material/Done';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import axios from "axios";

const Notes = ({ 
  notesOpen, 
  setNotesOpen, 
  passages, 
  setPassages, 
  passageNotes, 
  setPassageNotes,
  universalDate,
  setUniversalDate,
  universalTopics,
  setUniversalTopics,
  pageNote,
  setPageNote,
  handleDeletePassage,
  handleSaveMetadata,
  projectId,
  page_id
}) => {
  // Local state for the Notes component
  const [tabValue, setTabValue] = useState(0);
  const [topicInput, setTopicInput] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle"); // idle, saving, saved, error
  const [lastSaved, setLastSaved] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reset state when page_id changes
  useEffect(() => {
    setIsLoading(true);
    setSaveStatus("idle");
    
    const loadPageMetadata = async () => {
      if (!page_id || !projectId) {
        setIsLoading(false);
        return;
      }
      
      try {
        console.log(`Loading metadata for page ${page_id} in project ${projectId}`);
        
        // First load universal metadata (date, topics)
        const universalResponse = await axios.post(`${import.meta.env.VITE_BE_URL}/api/page/get`, { 
          _id: page_id 
        });
        
        const pageData = universalResponse.data.page;
        if (pageData) {
          // Set date if available
          if (pageData.date) {
            setUniversalDate(pageData.date);
          } else {
            setUniversalDate("");
          }
          
          // Set topics if available
          if (pageData.topics && Array.isArray(pageData.topics)) {
            setUniversalTopics(pageData.topics);
          } else {
            setUniversalTopics([]);
          }
        }
        
        // Then load project-specific metadata
        const projectResponse = await axios.post(`${import.meta.env.VITE_BE_URL}/api/project`, {
          _id: projectId
        });
        
        const projectData = projectResponse.data.project;
        if (projectData && projectData.page_metadata && projectData.page_metadata[page_id]) {
          const metadata = projectData.page_metadata[page_id];
          
          // Load passages if available
          if (metadata.passages && Array.isArray(metadata.passages)) {
            setPassages(metadata.passages);
          } else {
            setPassages([]);
          }
          
          // Load page notes if available
          if (metadata.page_notes) {
            setPageNote(metadata.page_notes);
          } else {
            setPageNote("");
          }
          
          // Load passage notes if available
          if (metadata.passage_notes && typeof metadata.passage_notes === 'object') {
            setPassageNotes(metadata.passage_notes);
          } else {
            setPassageNotes({});
          }
          
          console.log(`Loaded metadata for page ${page_id}:`, {
            passages: metadata.passages?.length || 0,
            hasPageNotes: !!metadata.page_notes,
            passageNotes: Object.keys(metadata.passage_notes || {}).length
          });
        } else {
          // Clear state if no metadata found
          setPassages([]);
          setPageNote("");
          setPassageNotes({});
          console.log(`No existing metadata found for page ${page_id}`);
        }
        
      } catch (error) {
        console.error("Error loading page metadata:", error);
        // Reset state on error
        setPassages([]);
        setPageNote("");
        setPassageNotes({});
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPageMetadata();
  }, [page_id, projectId]);

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

  // Handle updating passage notes
  const handlePassageNoteChange = (passageId, note) => {
    setPassageNotes({
      ...passageNotes,
      [passageId]: note
    });
  };

  // Function to save metadata to the backend
  const saveAllMetadata = async () => {
    try {
      setSaveStatus("saving");
      
      // First save universal metadata (date and topics)
      if (universalDate || universalTopics.length > 0) {
        const universalMetadata = {
          date: universalDate || "",
          topics: Array.isArray(universalTopics) ? universalTopics : []
        };
        
        try {
          await axios.post(`${import.meta.env.VITE_BE_URL}/api/page/metadata/update`, {
            page_id: page_id,
            metadata: universalMetadata
          });
          console.log("Universal metadata saved successfully");
        } catch (error) {
          console.error("Error saving universal metadata:", error);
          // Continue anyway to try saving project metadata
        }
      }
      
      // Ensure passages have properly formatted data before saving
      const formattedPassages = Array.isArray(passages) ? passages.map(passage => {
        // Make sure passage is an object and has required fields
        if (typeof passage !== 'object' || passage === null) {
          return {
            id: String(Date.now()),
            text: String(passage || ""),
            start: 0,
            end: 0
          };
        }
        
        return {
          id: String(passage.id || Date.now()),
          text: String(passage.text || ""),
          start: Number(passage.start || 0),
          end: Number(passage.end || 0)
        };
      }) : [];
      
      // Convert any numeric passage note keys to strings
      const formattedPassageNotes = {};
      if (passageNotes && typeof passageNotes === 'object') {
        Object.keys(passageNotes).forEach(key => {
          const value = passageNotes[key];
          formattedPassageNotes[String(key)] = String(value || "");
        });
      }
      
      // Then save project-specific metadata (passages, notes)
      const projectMetadata = {
        passages: formattedPassages,
        page_notes: String(pageNote || ""),
        passage_notes: formattedPassageNotes
      };
      
      console.log("Saving project metadata:", {
        project_id: projectId,
        page_id: page_id,
        // Log a simplified version to avoid too much console output
        metadata_summary: {
          passages_count: formattedPassages.length,
          has_page_notes: !!projectMetadata.page_notes,
          passage_notes_count: Object.keys(formattedPassageNotes).length
        }
      });
      
      try {
        const response = await axios.post(`${import.meta.env.VITE_BE_URL}/api/project/page/metadata/update`, {
          project_id: projectId,
          page_id: page_id,
          metadata: projectMetadata
        });
        
        console.log("Project metadata saved successfully:", response.data);
        
        // Update state to reflect saved status
        setSaveStatus("saved");
        setLastSaved(new Date());
        
        // Reset to idle after 3 seconds
        setTimeout(() => {
          if (setSaveStatus) setSaveStatus("idle");
        }, 3000);
      } catch (error) {
        console.error("Error saving project metadata:", error);
        console.error("Request data:", {
          project_id: projectId,
          page_id: page_id,
          metadata: projectMetadata
        });
        
        // Set error state
        setSaveStatus("error");
        setTimeout(() => {
          if (setSaveStatus) setSaveStatus("idle");
        }, 3000);
        throw error; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      console.error("Error in saveAllMetadata:", error);
      setSaveStatus("error");
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        if (setSaveStatus) setSaveStatus("idle");
      }, 3000);
    }
  };

  // Determine what icon to show based on save status
  const renderSaveStatusIcon = () => {
    switch (saveStatus) {
      case "saving":
        return <CircularProgress size={20} />;
      case "saved":
        return <DoneIcon color="success" />;
      case "error":
        return <InfoOutlinedIcon color="error" />;
      default:
        return <DoneIcon color="disabled" />;
    }
  };

  // Format last saved time
  const formatLastSaved = () => {
    if (!lastSaved) return "";
    
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000);
    
    if (diff < 60) return "Saved just now";
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)} min ago`;
    return `Saved ${Math.floor(diff / 3600)} hr ago`;
  };

  return (
    <Paper 
      sx={{
        width: 450,
        height: '100vh',
        position: 'fixed',
        top: 0,
        right: 0,
        transform: notesOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.3s ease-in-out',
        zIndex: 1200,
        boxShadow: '-2px 0 8px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <Typography variant="h6">Notes</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Save status indicator */}
          <Box sx={{ 
            mr: 2, 
            display: 'flex', 
            alignItems: 'center',
            color: 'text.secondary',
            fontSize: '14px'
          }}>
            {isLoading ? (
              <CircularProgress size={16} />
            ) : (
              <>
                {lastSaved && saveStatus !== "saving" && (
                  <Typography variant="caption" sx={{ mr: 1, fontSize: '12px' }}>
                    {formatLastSaved()}
                  </Typography>
                )}
                {renderSaveStatusIcon()}
              </>
            )}
          </Box>
          <IconButton onClick={() => setNotesOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>
      
      {/* Tabs for Universal vs Project Notes - renamed tabs */}
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="General Info" />
        <Tab label="Save Passages" />
      </Tabs>
      
      {/* Tab Content Panels */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
        {/* Universal Metadata Panel - renamed and simplified */}
        {tabValue === 0 && (
          <Stack spacing={4}>
            <Typography variant="subtitle1" sx={{ fontSize: '18px', fontWeight: 600 }}>General Information</Typography>
            
            {/* Standard Date Input */}
            <TextField
              fullWidth
              variant="outlined"
              label="Page Date"
              type="date"
              value={universalDate}
              onChange={(e) => setUniversalDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mt: 1 }}
            />
            
            {/* Topics Input */}
            <Box>
              <TextField
                fullWidth
                variant="outlined"
                label="Topics"
                placeholder="Press Enter to add a topic"
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={handleAddTopic}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => {
                          if (topicInput.trim()) {
                            setUniversalTopics([...universalTopics, topicInput.trim()]);
                            setTopicInput("");
                          }
                        }}
                        edge="end"
                      >
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              
              {/* Topics Chips */}
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {universalTopics.map((topic, index) => (
                  <Chip
                    key={index}
                    label={topic}
                    onDelete={() => handleRemoveTopic(topic)}
                    sx={{ fontSize: '14px', height: '32px' }}
                  />
                ))}
              </Box>
            </Box>
            
            {/* Page Notes - always universal now */}
            <Box>
              <Typography variant="subtitle2" gutterBottom sx={{ fontSize: '16px', mt: 2 }}>
                Page Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={6}
                variant="outlined"
                placeholder="Notes about this page..."
                value={pageNote}
                onChange={(e) => setPageNote(e.target.value)}
                onKeyDown={(e) => {
                  // Save notes when pressing Enter
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    // Simply blur the field to indicate saving - no animation
                    e.target.blur();
                  }
                }}
                sx={{ 
                  mt: 2
                }}
              />
            </Box>
          </Stack>
        )}
        
        {/* Project Specific Panel - renamed to Saved Passages */}
        {tabValue === 1 && (
          <Stack spacing={4}>
            <Typography variant="subtitle1" sx={{ fontSize: '18px', fontWeight: 600 }}>Saved Passages</Typography>
            
            {/* Passages - Simplified with no instructions */}
            <Box>
              {passages.length === 0 ? (
                <Card variant="outlined" sx={{ 
                  p: 2, 
                  backgroundColor: 'transparent',
                  border: '1px solid rgba(0,0,0,0.1)'
                }}>
                  <Typography align="center" color="text.secondary">
                    No passages selected yet
                  </Typography>
                </Card>
              ) : (
                <Stack spacing={2}>
                  {passages.map((passage, index) => (
                    <Accordion 
                      key={passage.id}
                      disableGutters
                      elevation={0}
                      sx={{
                        backgroundColor: 'transparent',
                        '&:before': {
                          display: 'none',
                        },
                        '&.Mui-expanded': {
                          margin: 0
                        },
                        boxShadow: 'none',
                        border: '1px solid rgba(0,0,0,0.08)',
                        borderRadius: '4px',
                        mb: 2,
                        overflow: 'hidden'
                      }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon />}
                        sx={{ 
                          pr: 5, 
                          position: 'relative',
                          '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.02)',
                          },
                          '&.Mui-focused': {
                            backgroundColor: 'transparent',
                          },
                          '& .MuiAccordionSummary-content': {
                            margin: '12px 0',
                          },
                          '&.Mui-expanded': {
                            minHeight: 0,
                            backgroundColor: 'transparent',
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          width: '100%',
                          userSelect: 'none' 
                        }}>
                          <Typography sx={{ fontWeight: 500 }}>
                            Passage {index + 1}
                          </Typography>
                        </Box>
                        <Box
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePassage(passage.id);
                          }}
                          sx={{
                            position: 'absolute',
                            right: 8,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'error.light',
                            cursor: 'pointer',
                            width: 24,
                            height: 24,
                            '&:hover': {
                              color: 'error.main',
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ 
                        p: 2, 
                        pt: 0,
                        backgroundColor: 'transparent',
                        borderTop: 'none'
                      }}>
                        <Box>
                          {/* Full passage display - no truncation or dropdown */}
                          <Typography 
                            variant="body2" 
                            sx={{
                              fontFamily: '"Georgia", "Cambria", "Times New Roman", serif',
                              fontSize: '15px',
                              lineHeight: 1.6,
                              color: '#32302d',
                              letterSpacing: '0.01em',
                              fontStyle: 'italic',
                              padding: '8px 0',
                              borderBottom: '1px solid rgba(0,0,0,0.08)',
                              mb: 2
                            }}
                          >
                            "{passage.text}"
                          </Typography>
                          
                          {/* Notes field */}
                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            variant="outlined"
                            label="Notes for this passage"
                            placeholder="Add notes about this passage..."
                            value={passageNotes[passage.id] || ""}
                            onChange={(e) => handlePassageNoteChange(passage.id, e.target.value)}
                            onKeyDown={(e) => {
                              // Save notes when pressing Enter
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                // Simply blur the field to indicate saving - no animation
                                e.target.blur();
                              }
                            }}
                          />
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              )}
            </Box>
          </Stack>
        )}
      </Box>
      
      {/* Single Save button outside of tabs */}
      <Box sx={{ 
        p: 3, 
        borderTop: '1px solid rgba(0,0,0,0.1)',
        backgroundColor: 'transparent'
      }}>
        <Button 
          variant="contained" 
          onClick={saveAllMetadata}
          disabled={saveStatus === "saving"}
          startIcon={renderSaveStatusIcon()}
          sx={{ 
            py: 1.2, 
            fontSize: '15px', 
            width: '100%',
            '&:focus': {
              outline: 'none',
              boxShadow: 'none'
            }
          }}
        >
          {saveStatus === "saving" ? "Saving..." : "Save All Notes"}
        </Button>
      </Box>
    </Paper>
  );
};

export default Notes; 