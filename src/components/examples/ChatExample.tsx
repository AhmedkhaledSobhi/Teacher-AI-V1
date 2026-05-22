/**
 * Example component demonstrating how to use the chat API
 */

"use client";

import { useState, useEffect } from "react";
import { useChat } from "@/hooks/useChat";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";

export default function ChatExample() {
  // Use the chat hook
  const {
    threadId,
    messages,
    error,
    initializeThread,
    getMessages,
    addMessage,
    isInitializing,
    isSendingMessage,
    isLoadingMessages,
  } = useChat();

  // Form state
  const [userId, setUserId] = useState<string>(
    "7961297e-2738-43d2-b48e-80a12f116ccd"
  );
  const [gradeId, setGradeId] = useState<number>(2);
  const [subject, setSubject] = useState<string>("Science");
  const [termId, setTermId] = useState<number>(2);
  const [messageContent, setMessageContent] = useState<string>("");

  // Handle form input changes
  const handleGradeChange = (e: SelectChangeEvent) => {
    setGradeId(Number(e.target.value));
  };

  const handleSubjectChange = (e: SelectChangeEvent) => {
    setSubject(e.target.value);
  };

  const handleTermChange = (e: SelectChangeEvent) => {
    setTermId(Number(e.target.value));
  };

  // Initialize thread
  const handleInitializeThread = async () => {
    const newThreadId = await initializeThread({
      grade_id: gradeId,
      subject,
      term_id: termId,
      user_id: userId,
    });

    if (newThreadId) {
      // Optionally store the thread ID in localStorage for persistence
      localStorage.setItem("chatThreadId", newThreadId);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!messageContent.trim()) return;

    const success = await addMessage(messageContent);
    if (success) {
      setMessageContent("");
    }
  };

  // Load messages when thread ID changes
  useEffect(() => {
    if (threadId) {
      getMessages(threadId);
    }
  }, [threadId, getMessages]);

  // Check for stored thread ID on component mount
  useEffect(() => {
    const storedThreadId = localStorage.getItem("chatThreadId");
    if (storedThreadId) {
      // If we have a stored thread ID, load messages
      getMessages(storedThreadId);
    }
  }, [getMessages]);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: 2 }}>
      <Typography
        variant="h4"
        gutterBottom
      >
        Chat Example
      </Typography>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}

      {!threadId ? (
        <Card sx={{ mb: 4 }}>
          <CardHeader title="Initialize Chat Thread" />
          <CardContent>
            <Box
              component="form"
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                label="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                fullWidth
                disabled={isInitializing}
              />

              <FormControl
                fullWidth
                disabled={isInitializing}
              >
                <InputLabel>Grade</InputLabel>
                <Select
                  value={gradeId.toString()}
                  label="Grade"
                  onChange={handleGradeChange}
                >
                  <MenuItem value={1}>Grade 1</MenuItem>
                  <MenuItem value={2}>Grade 2</MenuItem>
                  <MenuItem value={3}>Grade 3</MenuItem>
                  <MenuItem value={4}>Grade 4</MenuItem>
                  <MenuItem value={5}>Grade 5</MenuItem>
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                disabled={isInitializing}
              >
                <InputLabel>Subject</InputLabel>
                <Select
                  value={subject}
                  label="Subject"
                  onChange={handleSubjectChange}
                >
                  <MenuItem value="Math">Math</MenuItem>
                  <MenuItem value="Science">Science</MenuItem>
                  <MenuItem value="English">English</MenuItem>
                  <MenuItem value="History">History</MenuItem>
                </Select>
              </FormControl>

              <FormControl
                fullWidth
                disabled={isInitializing}
              >
                <InputLabel>Term</InputLabel>
                <Select
                  value={termId.toString()}
                  label="Term"
                  onChange={handleTermChange}
                >
                  <MenuItem value={1}>Term 1</MenuItem>
                  <MenuItem value={2}>Term 2</MenuItem>
                  <MenuItem value={3}>Term 3</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                onClick={handleInitializeThread}
                disabled={isInitializing}
                startIcon={
                  isInitializing ? <CircularProgress size={20} /> : null
                }
              >
                {isInitializing ? "Initializing..." : "Start Chat"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card sx={{ mb: 2 }}>
            <CardHeader
              title="Chat Thread"
              subheader={`Thread ID: ${threadId}`}
              action={
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    localStorage.removeItem("chatThreadId");
                    window.location.reload();
                  }}
                >
                  New Thread
                </Button>
              }
            />
            <CardContent>
              <Box
                sx={{
                  height: 400,
                  overflowY: "auto",
                  mb: 2,
                  p: 2,
                  bgcolor: "background.default",
                }}
              >
                {isLoadingMessages ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <CircularProgress />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="100%"
                  >
                    <Typography color="text.secondary">
                      No messages yet. Start the conversation!
                    </Typography>
                  </Box>
                ) : (
                  messages.map((message) => (
                    <Paper
                      key={message.id}
                      elevation={1}
                      sx={{
                        p: 2,
                        mb: 2,
                        maxWidth: "80%",
                        ml: message.role === "user" ? "auto" : 0,
                        mr: message.role === "assistant" ? "auto" : 0,
                        bgcolor:
                          message.role === "user"
                            ? "primary.light"
                            : "background.paper",
                        color:
                          message.role === "user"
                            ? "primary.contrastText"
                            : "text.primary",
                      }}
                    >
                      <Typography variant="body1">{message.content}</Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 1, opacity: 0.7 }}
                      >
                        {new Date(message.created_at).toLocaleTimeString()}
                      </Typography>
                    </Paper>
                  ))
                )}
              </Box>

              <Divider sx={{ mb: 2 }} />

              <Box sx={{ display: "flex", gap: 1 }}>
                <TextField
                  fullWidth
                  label="Type a message"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  disabled={isSendingMessage}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={isSendingMessage || !messageContent.trim()}
                  startIcon={
                    isSendingMessage ? <CircularProgress size={20} /> : null
                  }
                >
                  Send
                </Button>
              </Box>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
}
