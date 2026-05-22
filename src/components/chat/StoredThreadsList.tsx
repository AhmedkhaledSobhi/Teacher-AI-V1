/**
 * Component to display and manage stored chat threads
 * Enhanced with professional styling and improved selection indicators
 */

import { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  Tooltip,
  alpha,
  useTheme,
  CircularProgress,
  Chip,
} from "@mui/material";
import CustomAvatar from "@core/components/mui/Avatar";

interface StoredThreadsListProps {
  threads: threads[];
  onSelectThread: (thread: threads) => void;
  onDeleteThread: (threadId: string) => void;
  currentThreadId?: string | null;
  isLoading?: boolean;
  deletingThreadId?: string | null;
  curriculum?: Array<{ subject: string; display_name: string }>;
}

interface threads {
  thread_id: string;
  thread_name: string;
  subject?: string;
  display_name?: string;
}

// Generate dynamic colors based on subject index
const generateSubjectColor = (index: number): { bg: string; text: string } => {
  const colors = [
    { bg: "#e3f2fd", text: "#1976d2" }, // Blue
    { bg: "#f3e5f5", text: "#7b1fa2" }, // Purple
    { bg: "#fff3e0", text: "#e65100" }, // Orange
    { bg: "#e8f5e9", text: "#2e7d32" }, // Green
    { bg: "#fce4ec", text: "#c2185b" }, // Pink
    { bg: "#e0f2f1", text: "#00695c" }, // Teal
    { bg: "#fef7e0", text: "#f57c00" }, // Amber
    { bg: "#ede7f6", text: "#5e35b1" }, // Deep Purple
  ];

  return colors[index % colors.length];
};

// Define theme colors that match the CSS variables
const themeColors = {
  light: {
    sectionHeader: "rgba(0, 0, 0, 0.5)",
    emptyText: "rgba(0, 0, 0, 0.5)",
    activeBackground: "#ECECF1",
    activeText: "#000000",
    hoverBackground: "rgba(0, 0, 0, 0.05)",
    titleActive: "#000000",
    title: "#343541",
    previewActive: "rgba(0, 0, 0, 0.8)",
    preview: "rgba(0, 0, 0, 0.6)",
    icon: "rgba(0, 0, 0, 0.5)",
    aiIcon: "#10A37F",
  },
  dark: {
    sectionHeader: "rgba(236, 236, 241, 0.5)",
    emptyText: "rgba(236, 236, 241, 0.6)",
    activeBackground: "#343541",
    activeText: "#FFFFFF",
    hoverBackground: "rgba(255, 255, 255, 0.1)",
    titleActive: "#FFFFFF",
    title: "#ECECF1",
    previewActive: "rgba(255, 255, 255, 0.7)",
    preview: "rgba(236, 236, 241, 0.6)",
    icon: "rgba(236, 236, 241, 0.6)",
    aiIcon: "#19C37D",
  },
};

const StoredThreadsList = ({
  threads,
  onSelectThread,
  onDeleteThread,
  currentThreadId,
  isLoading = false,
  deletingThreadId = null,
  curriculum = [],
}: StoredThreadsListProps) => {
  const theme = useTheme();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);
  const [hoveredThreadId, setHoveredThreadId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(theme.palette.mode === "dark");
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  // Update dark mode state when theme changes
  useEffect(() => {
    setIsDarkMode(theme.palette.mode === "dark");
  }, [theme.palette.mode]);

  // Get colors based on current theme
  const colors = isDarkMode ? themeColors.dark : themeColors.light;

  // Handle thread deletion
  const handleDeleteClick = (threadId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the list item click
    setThreadToDelete(threadId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (threadToDelete) {
      try {
        // Show loading state
        setDeleteInProgress(true);

        // Call the parent component's delete handler
        await onDeleteThread(threadToDelete);

        // Close the dialog and reset state
        setDeleteDialogOpen(false);
        setThreadToDelete(null);
      } catch (error) {
        console.error("Error in confirmDelete:", error);
        // Error handling is now managed in the parent component
      } finally {
        setDeleteInProgress(false);
        setDeleteDialogOpen(false);
        setThreadToDelete(null);
      }
    }
  };

  // Generate a display title for the thread
  const getThreadTitle = (thread: string) => {
    return thread || "محادثه جديده";
  };

  // Check if a thread is currently being deleted
  const isThreadBeingDeleted = (threadId: string) => {
    return deletingThreadId === threadId;
  };

  // Get subject badge color and display name based on subject
  const getSubjectInfo = (subject?: string) => {
    if (!subject) return null;
    // Find the curriculum item
    const curriculumItem = curriculum.find((c) => c.subject === subject);

    if (!curriculumItem) return null;

    // Get index for color generation
    const index = curriculum.findIndex((c) => c.subject === subject);
    const color = generateSubjectColor(index);

    return {
      displayName: curriculumItem.display_name,
      color,
    };
  };

  return (
    <>
      <List
        dense
        sx={{
          width: "100%",
          "& .MuiListItem-root": {
            transition: "all 0.2s ease-in-out",
          },
        }}
      >
        {[...threads].reverse().map((thread) => {
          const isSelected = currentThreadId === thread.thread_id;
          const isHovered = hoveredThreadId === thread.thread_id;
          const isBeingDeleted = isThreadBeingDeleted(thread.thread_id);

          return (
            <ListItem
              key={thread.thread_id}
              disablePadding
              sx={{
                borderRadius: 1.5,
                mx: 1,
                mb: 0.5,
                opacity: isBeingDeleted ? 0.5 : 1,
                transition: "opacity 0.2s ease-in-out",
              }}
            >
              <ListItemButton
                selected={isSelected}
                onClick={() => onSelectThread(thread)}
                onMouseEnter={() => setHoveredThreadId(thread.thread_id)}
                onMouseLeave={() => setHoveredThreadId(null)}
                disabled={isLoading || isBeingDeleted}
                sx={{
                  cursor:
                    isLoading || isBeingDeleted ? "not-allowed" : "pointer",
                  borderRadius: 1.5,
                  py: 1.5,
                  position: "relative",
                  overflow: "hidden",
                  "&::before": isSelected
                    ? {
                        content: '""',
                        position: "absolute",
                        left: 0,
                        top: "10%",
                        height: "80%",
                        width: "3px",
                        backgroundColor: colors.activeBackground,
                        borderRadius: "0 4px 4px 0",
                      }
                    : {},
                  "&.Mui-selected": {
                    backgroundColor: colors.activeBackground,
                    color: colors.activeText,
                    "&:hover": {
                      backgroundColor: colors.activeBackground,
                    },
                  },
                  "&:hover:not(.Mui-selected):not(.Mui-disabled)": {
                    backgroundColor: colors.hoverBackground,
                  },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                    position: "relative",
                  }}
                >
                  {/* Thread icon */}
                  <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>
                    {isBeingDeleted ? (
                      <CircularProgress size={20} sx={{ color: colors.icon }} />
                    ) : (
                      <></>
                    )}
                  </Box>

                  {/* Thread details */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? colors.titleActive : colors.title,
                        mb:
                          thread.subject && getSubjectInfo(thread?.subject)
                            ? 0.5
                            : 0,
                      }}
                    >
                      {getThreadTitle(thread?.thread_name)}
                    </Typography>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        fontSize: "0.7rem", // أصغر من body2 الافتراضي
                        fontWeight: isSelected ? 600 : 500,
                        color: isSelected ? colors.titleActive : "#6b7280", // رمادي (Tailwind gray-500)
                        mb:
                          thread.subject && getSubjectInfo(thread.subject)
                            ? 0.5
                            : 0,
                      }}
                    >
                      {thread?.subject}
                    </Typography>

                    {thread.subject && getSubjectInfo(thread.subject) && (
                      <Chip
                        label={getSubjectInfo(thread.subject)!.displayName}
                        size="small"
                        sx={{
                          height: "20px",
                          fontSize: "0.7rem",
                          fontWeight: 500,
                          backgroundColor: getSubjectInfo(thread.subject)!.color
                            .bg,
                          color: getSubjectInfo(thread.subject)!.color.text,
                          "& .MuiChip-label": {
                            px: 1,
                            py: 0,
                          },
                        }}
                      />
                    )}
                  </Box>

                  {/* Loading indicator for thread selection */}
                  {isLoading && isSelected && (
                    <CircularProgress
                      size={16}
                      sx={{
                        ml: 1,
                        color: isSelected ? colors.titleActive : colors.icon,
                      }}
                    />
                  )}
                </Box>

                {/* Delete button */}
                <ListItemSecondaryAction
                  sx={{
                    right: 8,
                    visibility:
                      (isHovered || isSelected) && !isBeingDeleted
                        ? "visible"
                        : "hidden",
                    transition: "visibility 0.2s ease",
                  }}
                >
                  <Tooltip title="Delete conversation">
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      size="small"
                      onClick={(e) => handleDeleteClick(thread.thread_id, e)}
                      disabled={isLoading || isBeingDeleted}
                      sx={{
                        color: colors.icon,
                        "&:hover": {
                          backgroundColor: isSelected
                            ? alpha(colors.hoverBackground, 0.2)
                            : colors.hoverBackground,
                        },
                      }}
                    >
                      <i className="tabler-trash text-sm" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteInProgress && setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Delete Conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this conversation? This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 1 }}
            disabled={deleteInProgress}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            sx={{ borderRadius: 1 }}
            disabled={deleteInProgress}
            startIcon={
              deleteInProgress ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
          >
            {deleteInProgress ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default StoredThreadsList;
