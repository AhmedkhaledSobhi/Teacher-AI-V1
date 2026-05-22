// Third-party Imports
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// Type Imports
import type {
  StatusType,
  ChatType,
  UserChatType,
  MessageContent,
} from "@/types/apps/chatTypes";

// Data Imports
import { db } from "@/fake-db/apps/chat";

// API Imports - Using CLIENT-SIDE API (visible in network tab)
import { submitDataToRAG, initializeThread } from "@/utils/chat-api";
import type { SubmitDataRequest } from "@/utils/chat-api";
import {
  addMessageToThreadClient,
  getThreadMessagesClient,
} from "@/services/chat-api-client";

// Helper function to create a new message with the correct structure
export const createNewMessage = (
  content: string,
  role: "user" | "assistant",
  options?: {
    attached_image?: string;
    generated_audio?: string;
    isGenerating?: boolean;
  }
): MessageContent => {
  return {
    message_id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    content,
    role,
    attached_image: options?.attached_image || "",
    generated_audio: options?.generated_audio || "",
    isGenerating: options?.isGenerating || false,
  };
};

// Helper function to generate AI responses based on user input and AI model
const generateAIResponse = (
  message: string,
  aiModel: string | undefined
): string => {
  // In a real application, this would call an actual AI API
  // For now, we'll simulate responses based on keywords in the message

  const lowerMsg = message.toLowerCase();

  if (aiModel === "teacher") {
    if (lowerMsg.includes("dinosaur")) {
      return "Dinosaurs are fascinating creatures! They lived millions of years ago during what we call the Mesozoic Era. Would you like to know more about a specific type of dinosaur? 🦕🦖";
    } else if (
      lowerMsg.includes("math") ||
      lowerMsg.includes("add") ||
      lowerMsg.includes("subtract")
    ) {
      return "Math is so much fun! I can help you with addition, subtraction, multiplication, and division. What specific problem are you working on? 🧮";
    } else if (lowerMsg.includes("science")) {
      return "Science is all about discovering how our world works! We can explore biology, chemistry, physics, or earth science. What would you like to learn about today? 🔬";
    } else {
      return "That's a great question! I'm your Teacher AI and I'm here to help you learn. What subject are you interested in exploring today? 📚";
    }
  } else if (aiModel === "chatgpt") {
    if (lowerMsg.includes("help")) {
      return "I'd be happy to help you with that. Could you provide more details about what you need assistance with?";
    } else if (lowerMsg.includes("explain")) {
      return "I'll explain that for you. Let me break it down step by step so it's easier to understand.";
    } else {
      return "Thanks for your message. I'm ChatGPT, an AI assistant designed to be helpful, harmless, and honest. How can I assist you today?";
    }
  } else if (aiModel === "gemini") {
    if (lowerMsg.includes("space") || lowerMsg.includes("planet")) {
      return "Space is an incredible frontier! Our universe is vast and filled with galaxies, stars, planets, and so much more. What aspect of space would you like to explore? 🌌";
    } else if (lowerMsg.includes("animal")) {
      return "Animals are amazing! There are millions of different species on our planet, from tiny insects to massive whales. What animal would you like to learn about? 🐘";
    } else {
      return "Hello! I'm Gemini, and I'm here to help you explore and learn. What would you like to discover today? 🔍";
    }
  } else {
    return "I'm an AI assistant here to help you. What would you like to know?";
  }
};

// Function to create and add a message to the chat
export const createAndAddMessage = (
  content: string,
  role: "user" | "assistant",
  options?: {
    attached_image?: string;
    generated_audio?: string;
    isGenerating?: boolean;
  }
) => {
  return (dispatch: any) => {
    const message = createNewMessage(content, role, options);
    dispatch(addMessageToChat(message));
    return message;
  };
};

// Async thunk for adding a user message and generating an AI response
export const sendUserMessageAndGenerateResponse = createAsyncThunk(
  "chat/sendUserMessageAndGenerateResponse",
  async (
    params: {
      content: string;
      aiModel?: string;
      attached_image?: string;
      generated_audio?: string;
    },
    { dispatch }
  ) => {
    // First, create and add the user message
    const userMessage = createNewMessage(params.content, "user", {
      attached_image: params.attached_image,
      generated_audio: params.generated_audio,
    });

    dispatch(addMessageToChat(userMessage));

    // Then, create an AI response with "isGenerating" flag
    const aiResponsePlaceholder = createNewMessage("", "assistant", {
      isGenerating: true,
    });

    dispatch(addMessageToChat(aiResponsePlaceholder));

    // Generate the AI response (simulated delay for realistic effect)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate the actual response content
    const responseContent = generateAIResponse(params.content, params.aiModel);

    // Update the placeholder message with the actual content
    dispatch(
      updateMessageInChat({
        messageId: aiResponsePlaceholder.message_id,
        updates: {
          content: responseContent,
          isGenerating: false,
        },
      })
    );

    // Return both messages
    return {
      userMessage,
      aiResponse: {
        ...aiResponsePlaceholder,
        content: responseContent,
        isGenerating: false,
      },
    };
  }
);

// Async thunk for sending messages to RAG API
export const sendMsgToRAG = createAsyncThunk(
  "chat/sendMsgToRAG",
  async (params: {
    message: string;
    inputType: "text" | "audio" | "image";
    threadId?: string;
    userId?: string;
    gradeId?: number;
    subject?: string;
    termId?: number;
  }) => {
    const ragRequest: SubmitDataRequest = {
      input_type: params.inputType,
      query: params.message,
      thread_id: params.threadId,
      user_id: params.userId,
      grade_id: params.gradeId,
      subject: params.subject,
      term_id: params.termId,
    };

    const response = await submitDataToRAG(ragRequest);
    return {
      ...response,
      originalMessage: params.message,
      inputType: params.inputType,
    };
  }
);

// Async thunk for adding messages to thread - CLIENT-SIDE API CALL
export const addMessageToThread = createAsyncThunk(
  "chat/addMessageToThread",
  async (
    params: {
      message: string;
      inputType: "text" | "audio" | "image";
      threadId: string;
      audioFile?: File;
      imageFile?: File;
      imagePreviewUrl?: string;
      audioDuration?: number;
      retryMessageId?: string; // Add parameter for retry functionality
      teacherName?: string;
      studyAndLearn?: boolean;
      selectedCourse?: string | null;
      selectedUnit?: string | null;
      selectedLesson?: string | null;
      selectedPage?: string | null;
    },
    { rejectWithValue }
  ) => {
    try {
      // Debug logging before API call

      // 🌐 DIRECT CLIENT-SIDE API CALL - Visible in network tab!
      const response = await addMessageToThreadClient({
        thread_id: params.threadId,
        input_type: params.inputType,
        query: params.message,
        audio_file: params.audioFile,
        image_file: params.imageFile,
        teacher_name: params.teacherName,
        study_and_learn: params.studyAndLearn,
        selected_course: params.selectedCourse,
        selected_unit: params.selectedUnit,
        selected_lesson: params.selectedLesson,
        selected_page: params.selectedPage,
      });

      // Check if the response indicates an error
      if (response.operation_status === "error") {
        console.error("❌ [REDUX CLIENT] API returned error:", {
          message: response.message,
          error: response.error,
        });

        return rejectWithValue({
          error: response.message || "Failed to send message",
          originalMessage: params.message,
          inputType: params.inputType,
          retryMessageId: params.retryMessageId,
          threadId: params.threadId,
          imagePreviewUrl: params.imagePreviewUrl,
          audioDuration: params.audioDuration,
        });
      }

      return {
        operation_status: response.operation_status,
        message: response.message,
        data: response.data,
        originalMessage: params.message,
        inputType: params.inputType,
        imagePreviewUrl: params.imagePreviewUrl,
        audioDuration: params.audioDuration,
        retryMessageId: params.retryMessageId,
        messageId: response.data?.message_id || "",
        assistant_message_id: response.data?.assistant_message_id || "",
      };
    } catch (error) {
      console.error("❌ [REDUX CLIENT] Exception:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      return rejectWithValue({
        error:
          error instanceof Error ? error.message : "Failed to send message",
        originalMessage: params.message,
        inputType: params.inputType,
        retryMessageId: params.retryMessageId,
        threadId: params.threadId,
        imagePreviewUrl: params.imagePreviewUrl,
        audioDuration: params.audioDuration,
      });
    }
  }
);

// Async thunk for loading thread messages - CLIENT-SIDE API CALL
export const loadThreadMessages = createAsyncThunk(
  "chat/loadThreadMessages",
  async (threadId: string) => {
    // 🌐 DIRECT CLIENT-SIDE API CALL - Visible in network tab!
    const result = await getThreadMessagesClient(threadId);

    return { ...result, threadId };
  }
);

// Helper function to retry a failed message
export const retryFailedMessage = createAsyncThunk(
  "chat/retryFailedMessage",
  async (errorMessage: MessageContent, { dispatch }) => {
    // Validate required fields
    if (!errorMessage.originalMessage || !errorMessage.threadId) {
      console.error(
        "Cannot retry message: missing required fields",
        errorMessage
      );
      throw new Error("Cannot retry message: missing required fields");
    }

    // First, update the error message to show it's retrying
    dispatch(
      updateMessageInChat({
        messageId: errorMessage.message_id,
        updates: {
          content: "جاري معالجه الطلب ...",
          isGenerating: true,
          hasError: false,
        },
      })
    );

    // Then dispatch the addMessageToThread action with the retry flag
    try {
      return await dispatch(
        addMessageToThread({
          message: errorMessage.originalMessage,
          inputType: errorMessage.inputType || "text",
          threadId: errorMessage.threadId,
          // Include other parameters if available
          imagePreviewUrl: errorMessage.attached_image,
          audioDuration: errorMessage.audioDuration,
          retryMessageId: errorMessage.message_id, // Pass the error message ID for retry
        })
      ).unwrap();
    } catch (error) {
      console.error("Retry failed:", error);
      // The error will be handled by the rejected case of addMessageToThread
      throw error;
    }
  }
);

export const chatSlice = createSlice({
  name: "chat",
  initialState: db,
  reducers: {
    startNewChat: (
      state,
      action: PayloadAction<{
        thread: {
          thread_id: string;
          thread_name: string;
          subject?: string;
          display_name?: string;
        };
        preserveMessages?: boolean; // Option to preserve existing messages (e.g., temp messages)
      }>
    ) => {
      const { thread, preserveMessages = false } = action.payload;

      // Set the active thread (preserve subject and display_name if available)
      state.activeThread = {
        thread_id: thread.thread_id,
        thread_name: thread.thread_name,
        subject: thread.subject,
        display_name: thread.display_name,
      };

      // Only clear messages if we're not preserving them (e.g., when switching threads)
      // Preserve messages when transitioning from pending conversation to active thread
      // because temp messages were just added and need to be updated
      if (!preserveMessages) {
        state.messages = [];
      }

      // Reset loading state
      state.messagesLoading = false;

      // Log for debugging
    },

    // initail loading progress for chat
    EnableLoading: (state, action: PayloadAction<boolean>) => {
      state.messagesLoading = action.payload;
    },
    showOldMessagesInChat: (state, action: PayloadAction<MessageContent[]>) => {
      // Action now expects an array of messages directly
      state.messages = action.payload;
      state.messagesLoading = false;
    },

    // Set pending thread (for lazy thread creation)
    setPendingConversation: (
      state,
      action: PayloadAction<{
        grade_id: number;
        subject: string;
        display_name: any;
        term_id: number;
        user_id: string;
      }>
    ) => {
      state.pendingThread = action.payload;
      state.activeThread = undefined; // Clear active thread
      state.placeholderMessage = {
        text: `اسألني أي شيء حول مادة ${action.payload.display_name}!`,
        subject: action.payload.subject,
        display_name: action.payload.display_name,
      };
      state.messages = []; // Clear messages
    },

    // Show placeholder message
    showPlaceholderMessage: (
      state,
      action: PayloadAction<{
        text: string;
        subject: string;
        display_name: string;
      }>
    ) => {
      state.placeholderMessage = action.payload;
    },

    // Clear pending conversation state
    clearPendingConversation: (state) => {
      state.pendingThread = null;
      state.placeholderMessage = null;
    },

    // Add a single message to the chat
    addMessageToChat: (state, action: PayloadAction<MessageContent>) => {
      // Add the new message to the messages array
      state.messages.push(action.payload);
    },

    // Update an existing message in the chat
    updateMessageInChat: (
      state,
      action: PayloadAction<{
        messageId: string;
        updates: Partial<MessageContent>;
      }>
    ) => {
      const { messageId, updates } = action.payload;
      const messageIndex = state.messages.findIndex(
        (msg) => msg.message_id === messageId
      );

      if (messageIndex !== -1) {
        // Update the message with the provided updates
        state.messages[messageIndex] = {
          ...state.messages[messageIndex],
          ...updates,
        };
      }
    },

    // INSTANT MESSAGE ACTION - Add messages immediately to UI (Optimistic Update)
    addMessageInstantly: (
      state,
      action: PayloadAction<{
        message: string;
        inputType: "text" | "audio" | "image";
        audioFile?: File;
        audioUrl?: string;
        audioDuration?: number;
        imagePreviewUrl?: string;
      }>
    ) => {
      const {
        message,
        inputType,
        audioFile,
        audioUrl,
        audioDuration,
        imagePreviewUrl,
      } = action.payload;
      const timestamp = Date.now();

      // Add user message INSTANTLY
      const userMessage: MessageContent = {
        message_id: `temp_user_${timestamp}`,
        content: message,
        role: "user",
        attached_image: imagePreviewUrl || "",
        generated_audio: audioFile ? "audio" : "",
        audio_file: audioFile,
        audioUrl: audioUrl,
        audioDuration: audioDuration,
        isGenerating: false,
      };
      state.messages.push(userMessage);

      // Add AI placeholder message INSTANTLY
      const aiPlaceholder: MessageContent = {
        message_id: `temp_ai_${timestamp}`,
        content: "جاري معالجه الطلب ...",
        role: "assistant",
        attached_image: "",
        generated_audio: "",
        illustrative_images: [],
        isGenerating: true,
      };
      state.messages.push(aiPlaceholder);
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle sendMsgToRAG
      .addCase(sendMsgToRAG.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(sendMsgToRAG.fulfilled, (state, action) => {
        state.messagesLoading = false;
        // Handle successful RAG response if needed
      })
      .addCase(sendMsgToRAG.rejected, (state) => {
        state.messagesLoading = false;
      })
      // Handle addMessageToThread - Background API processing
      .addCase(addMessageToThread.pending, (state, action) => {
        // Messages are already in UI from addMessageInstantly action
        // This pending state is just for tracking the API call
        // Only handle retry cases here
        const retryMessageId = action.meta.arg.retryMessageId;

        if (retryMessageId) {
          // This is a retry attempt - find the error message and update it
          const errorMsgIndex = state.messages.findIndex(
            (msg) => msg?.message_id === retryMessageId && msg.hasError
          );

          if (errorMsgIndex !== -1) {
            // Update the error message to show it's retrying
            state.messages[errorMsgIndex] = {
              ...state.messages[errorMsgIndex],
              content: "جاري معالجه الطلب ...",
              isGenerating: true,
              hasError: false,
            };
          }
        }
      })
      .addCase(addMessageToThread.fulfilled, (state, action) => {
        const retryMessageId = action.payload.retryMessageId;
        const responseData = action.payload.data;

        if (!responseData) return;

        if (retryMessageId) {
          // This is a retry - find the message that's being retried
          // We don't check for isGenerating here to be more flexible
          const retryingMsgIndex = state.messages.findIndex(
            (msg) => msg?.message_id === retryMessageId
          );

          if (retryingMsgIndex !== -1) {
            // Update the retrying message with the successful response
            state.messages[retryingMsgIndex] = {
              message_id: responseData.assistant_message_id || "",
              content: responseData.output_text || responseData.message || "",
              role: "assistant",
              attached_image: "",
              illustrative_images: responseData.illustrative_images || [],
              generated_audio: responseData.generated_audio_file_url || "",
              isGenerating: false,
              hasError: false,
            };
          }
        } else {
          // This is a new message - find and update the temporary AI message
          const tempAiIndex = state.messages.findIndex(
            (msg) =>
              msg?.message_id &&
              typeof msg.message_id === "string" &&
              msg.message_id.startsWith("temp_ai_") &&
              msg.isGenerating
          );

          if (tempAiIndex !== -1) {
            // Update the temporary AI message with real response
            state.messages[tempAiIndex] = {
              message_id: responseData.assistant_message_id,
              content: responseData.output_text || responseData.message || "",
              role: "assistant",
              attached_image: "",
              illustrative_images: responseData.illustrative_images || [],
              generated_audio: responseData.generated_audio_file_url || "",
              isGenerating: false,
            };

            // Update the temporary user message ID to make it permanent
            const tempUserIndex = state.messages.findIndex(
              (msg) =>
                msg?.message_id &&
                typeof msg.message_id === "string" &&
                msg.message_id.startsWith("temp_user_")
            );
            if (tempUserIndex !== -1) {
              state.messages[tempUserIndex].message_id =
                `msg_${Date.now()}_user_${Math.random().toString(36).substring(2, 9)}`;
            }
          }
        }
      })
      .addCase(addMessageToThread.rejected, (state, action) => {
        // Check if this is a retry attempt
        const retryMessageId = action.meta.arg.retryMessageId;

        if (retryMessageId) {
          // This is a retry that failed - find the message that was being retried
          // We don't check for isGenerating here because the message might be in different states
          const retryingMsgIndex = state.messages.findIndex(
            (msg) => msg?.message_id === retryMessageId
          );

          if (retryingMsgIndex !== -1) {
            // Update the retrying message to show error state again
            state.messages[retryingMsgIndex] = {
              ...state.messages[retryingMsgIndex],
              content:
                "Sorry, there was an error processing your message. Click to try again.",
              isGenerating: false,
              hasError: true,
              // Keep the original message and input type for future retries
              originalMessage: action.meta.arg.message,
              inputType: action.meta.arg.inputType,
              threadId: action.meta.arg.threadId,
              error: "Failed to send message",
            };
            return; // Exit early since we've handled the retry case
          }
        }

        // Handle new message failure (not a retry)
        // Find the temporary AI message and update it to show error state
        const tempAiIndex = state.messages.findIndex(
          (msg) =>
            msg?.message_id &&
            typeof msg.message_id === "string" &&
            msg.message_id.startsWith("temp_ai_") &&
            msg.isGenerating
        );

        // Get the original user message for context (needed for retry)
        const userMessageIndex = state.messages.findIndex(
          (msg) =>
            msg?.message_id &&
            typeof msg.message_id === "string" &&
            msg.message_id.startsWith("temp_user_")
        );

        const userMessage =
          userMessageIndex !== -1 ? state.messages[userMessageIndex] : null;
        const errorMessageId = `error_${Date.now()}`;

        // Get detailed error information if available
        const errorDetails = "An error occurred";

        // Create error message content with retry information
        const errorContent = `Sorry, there was an error processing your message. Click to try again. (${errorDetails})`;

        if (tempAiIndex !== -1) {
          // Update the temporary AI message to show error state
          state.messages[tempAiIndex] = {
            ...state.messages[tempAiIndex],
            message_id: errorMessageId, // Give it a proper error ID for retry
            content: errorContent,
            isGenerating: false,
            hasError: true, // Add error flag to indicate this message failed
            originalMessage: userMessage?.content || action.meta.arg.message, // Store original message for retry
            inputType: action.meta.arg.inputType, // Store input type for retry
            threadId: action.meta.arg.threadId, // Store thread ID for retry
            error: errorDetails,
          };
        } else {
          // If no temporary AI message found, add a new error message
          const errorMessage: MessageContent = {
            message_id: errorMessageId,
            content: errorContent,
            role: "assistant",
            attached_image: "",
            generated_audio: "",
            isGenerating: false,
            hasError: true,
            originalMessage: userMessage?.content || action.meta.arg.message,
            inputType: action.meta.arg.inputType,
            threadId: action.meta.arg.threadId,
            error: errorDetails,
          };
          state.messages.push(errorMessage);
        }
      })
      // Handle loadThreadMessages
      .addCase(loadThreadMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(loadThreadMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        // if (action.payload.messages) {
        //   state.messages = action.payload.messages;
        // }
      })
      .addCase(loadThreadMessages.rejected, (state) => {
        state.messagesLoading = false;
      });
  },
});

// Add a new action to handle clicking on error messages for retry
export const handleErrorMessageClick = (errorMessage: MessageContent) => {
  return (dispatch: any) => {
    // Check if this is a valid error message that can be retried
    if (errorMessage.hasError) {
      // Validate required fields
      if (!errorMessage.originalMessage || !errorMessage.threadId) {
        console.error(
          "Cannot retry message: missing required fields",
          errorMessage
        );
        return;
      }

      // Dispatch the retry action
      dispatch(retryFailedMessage(errorMessage));
    } else {
    }
  };
};

export const {
  showOldMessagesInChat,
  startNewChat,
  EnableLoading,
  addMessageToChat,
  updateMessageInChat,
  addMessageInstantly,
  setPendingConversation,
  showPlaceholderMessage,
  clearPendingConversation,
} = chatSlice.actions;

export default chatSlice.reducer;
