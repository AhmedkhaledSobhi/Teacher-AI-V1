/**
 * Utility functions for chat API operations
 * This file provides client-side functions for interacting with the chat API
 */

import api from "./api";

// Define types
export interface InitializeThreadRequest {
  grade_id: number;
  subject: string;
  term_id: number;
  user_id: string;
}

export interface InitializeThreadResponse {
  operation_status: "success" | "error";
  message: string;
  thread_id?: string;
  error?: string;
}

export interface ThreadMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
}

export interface ThreadMessagesResponse {
  operation_status: "success" | "error";
  message: string;
  thread_messages?: ThreadMessage[];
  error?: string;
}

export interface SubmitDataRequest {
  input_type: "text" | "audio" | "image";
  query: string;
  thread_id?: string;
  user_id?: string;
  grade_id?: number;
  subject?: string;
  term_id?: number;
}

export interface SubmitDataResponse {
  operation_status: "success" | "error";
  message: string;
  thread_id?: string;
  message_id?: string;
  ai_response?: string;
  error?: string;
}

/**
 * Initialize a new chat thread
 */
export const initializeThread = async (
  params: InitializeThreadRequest
): Promise<InitializeThreadResponse> => {
  try {
    return await api.post<InitializeThreadResponse>(
      "/api/v1/rag/initialize_thread",
      params
    );
  } catch (error) {
    console.error("Error initializing thread:", error);
    return {
      operation_status: "error",
      message: "Failed to initialize thread",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

/**
 * Get messages from a thread
 */
export const getThreadMessages = async (
  thread_id: string
): Promise<ThreadMessagesResponse> => {
  try {
    return await api.post<ThreadMessagesResponse>(
      "/api/v1/rag/thread_messages",
      { thread_id }
    );
  } catch (error) {
    console.error("Error getting thread messages:", error);
    return {
      operation_status: "error",
      message: "Failed to get thread messages",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

/**
 * Submit data to RAG system (supports text, audio, image)
 */
export const submitDataToRAG = async (
  params: SubmitDataRequest
): Promise<SubmitDataResponse> => {
  try {
    return await api.post<SubmitDataResponse>("/api/v1/rag/", params);
  } catch (error) {
    console.error("Error submitting data to RAG:", error);
    return {
      operation_status: "error",
      message: "Failed to submit data to RAG system",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

/**
 * Add a message to a thread (this would be implemented in a future API)
 */
export const addMessageToThread = async (
  thread_id: string,
  content: string,
  role: "user" | "assistant" = "user"
): Promise<any> => {
  try {
    // This endpoint doesn't exist yet, but we're preparing the function for future use
    return await api.post<any>("/api/v1/rag/add_message", {
      thread_id,
      content,
      role,
    });
  } catch (error) {
    console.error("Error adding message to thread:", error);
    return {
      operation_status: "error",
      message: "Failed to add message to thread",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

export interface GenerateAudioRequest {
  message_id: string;
}

export interface GenerateAudioResponse {
  operation_status: "success" | "error";
  message: string;
  generated_audio_file_url?: string;
  error?: string;
}

/**
 * Generate audio for a message using text-to-speech
 * Uses direct fetch for client-side rendering and network visibility
 */
export const generateAudioForMessage = async (
  message_id: string
): Promise<GenerateAudioResponse> => {
  try {
    // Only run on client side
    if (typeof window === "undefined") {
      throw new Error("This function can only be called on the client side");
    }

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
    const url = `https://drsi.ai/api/v1/rag/audio_button`;

    // Get session for authentication (if available)
    let authHeaders: Record<string, string> = {};
    try {
      const { getSession } = await import("next-auth/react");
      const session = await getSession();
      const accessToken =
        session?.accessToken || session?.session?.access_token;
      const userId =
        session?.user?.id || "7961297e-2738-43d2-b48e-80a12f116ccd";

      if (accessToken) {
        authHeaders = {
          Authorization: `Bearer ${accessToken}`,
          "X-User-ID": userId,
        };
      } else if (userId) {
        authHeaders = {
          Authorization: `Bearer ${userId}`,
          "X-User-ID": userId,
        };
      }
    } catch (error) {
      console.warn("Failed to get session for authentication:", error);
      // Fallback to hardcoded user ID
      const fallbackUserId = "7961297e-2738-43d2-b48e-80a12f116ccd";
      authHeaders = {
        Authorization: `Bearer ${fallbackUserId}`,
        "X-User-ID": fallbackUserId,
      };
    }

    // Make direct fetch request (visible in network tab)
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ message_id }),
    });

    // Check content type
    const contentType = response.headers.get("content-type");
    const isJson = contentType && contentType.includes("application/json");

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;

      if (isJson) {
        const errorData = await response.json().catch(() => ({}));
        errorMessage = errorData.message || errorMessage;
      } else {
        const errorText = await response.text().catch(() => "");
        console.error("Non-JSON error response:", errorText.substring(0, 200));
        errorMessage = `Server error: ${response.status} ${response.statusText}`;
      }

      return {
        operation_status: "error",
        message: errorMessage,
        error: errorMessage,
      };
    }

    // Parse JSON response
    if (isJson) {
      return await response.json();
    } else {
      const responseText = await response.text();
      console.error(
        "Expected JSON response but got:",
        responseText.substring(0, 200)
      );
      return {
        operation_status: "error",
        message: "Server returned non-JSON response",
        error: "Invalid response format",
      };
    }
  } catch (error) {
    console.error("Error generating audio for message:", error);
    return {
      operation_status: "error",
      message: "Failed to generate audio",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
};

// Export all functions as a default object
export default {
  initializeThread,
  getThreadMessages,
  submitDataToRAG,
  addMessageToThread,
  generateAudioForMessage,
};
