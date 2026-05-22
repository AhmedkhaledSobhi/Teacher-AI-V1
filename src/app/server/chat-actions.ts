/**
 * Server actions for chat functionality
 * This file provides server actions for chat thread operations
 */

"use server";

import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import { fetchWithAuth, handleApiResponse } from "./api-utils";

// Define response types
type ApiResponse<T> = {
  operation_status: "success" | "error";
  message: string;
  data?: T;
  error?: string;
};

// Search result thread type
interface SearchedThread {
  thread_id: string;
  thread_name: string;
  [key: string]: any;
}

// Define thread initialization request
interface InitializeThreadParams {
  //grade_id: number;
  subject: string;
  term_id: number;
  user_id: string;
}

// Define thread message
interface ThreadMessage {
  id: string;
  content: string;
  role: "user" | "assistant";
  created_at: string;
}

/**
 * Initialize a new chat thread
 */
export async function initializeThread(
  params: InitializeThreadParams
): Promise<ApiResponse<{ thread_id: string }>> {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        operation_status: "error",
        message: "Authentication required",
        error: "User must be logged in to initialize a thread",
      };
    }

    // Get access token from session (try both locations)
    const accessToken = session.accessToken || session.session?.access_token;
    if (!accessToken) {
      return {
        operation_status: "error",
        message: "Authentication token missing",
        error: "No access token available in session",
      };
    }

    // Validate required fields
    if (!params.subject || !params.term_id || !params.user_id) {
      return {
        operation_status: "error",
        message: "Missing required fields",
        error: "All fields (grade_id, subject, term_id, user_id) are required",
      };
    }

    // Get backend URL from environment
    const backendUrl =
      process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return {
        operation_status: "error",
        message: "Backend configuration error",
        error: "Backend URL not configured",
      };
    }

    const apiUrl = `${backendUrl}/api/v1/rag/initialize_thread`;

    // Prepare request payload
    const requestPayload = {
      // grade_id: params.grade_id,
      subject: params.subject,
      term_id: params.term_id,
      user_id: params.user_id,
    };

    // Prepare headers with authentication
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    // Make API call to backend using our utility function
    const response = await fetchWithAuth(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      // Handle 401 responses (will redirect to login)
      if (response.status === 401) {
        await handleApiResponse(response);
        // This code won't execute if handleApiResponse redirects
      }

      const errorText = await response.text();
      return {
        operation_status: "error",
        message: "Failed to initialize thread",
        error: `API request failed with status ${response.status}: ${errorText}`,
      };
    }

    const responseData = await response.json();

    // Check if the response has the expected structure
    if (!responseData.thread_id) {
      return {
        operation_status: "error",
        message: "Invalid response from backend",
        error: "Backend did not return a thread_id",
      };
    }

    return {
      operation_status: "success",
      message: "Thread initialized successfully",
      data: { thread_id: responseData.thread_id },
    };
  } catch (error) {
    return {
      operation_status: "error",
      message: "Internal server error",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Define thread type
interface Thread {
  thread_id: string;
  thread_name: string;
  subject?: string; // Subject/curriculum the thread belongs to
  created_at?: string;
  display_name?: string;
  subject_name?: string;
}

/**
 * Get user threads
 */
export async function getUserThreads(
  user_id: string
): Promise<ApiResponse<{ threads: Thread[] }>> {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        operation_status: "error",
        message: "Authentication required",
        error: "User must be logged in to fetch threads",
      };
    }

    // Get access token from session (try both locations)
    const accessToken = session.accessToken || session.session?.access_token;
    if (!accessToken) {
      return {
        operation_status: "error",
        message: "Authentication token missing",
        error: "No access token available in session",
      };
    }

    // Validate required fields
    if (!user_id) {
      return {
        operation_status: "error",
        message: "Missing required fields",
        error: "user_id is required",
      };
    }

    // Get backend URL from environment
    const backendUrl =
      process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return {
        operation_status: "error",
        message: "Backend configuration error",
        error: "Backend URL not configured",
      };
    }

    const apiUrl = `${backendUrl}/api/v1/rag/user_threads`;

    // Prepare request payload
    const requestPayload = {
      user_id: user_id,
    };

    // Prepare headers with authentication
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    // Make API call to backend using our utility function
    const response = await fetchWithAuth(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      // Handle 401 responses (will redirect to login)
      if (response.status === 401) {
        await handleApiResponse(response);
        // This code won't execute if handleApiResponse redirects
      }

      const errorText = await response.text();
      return {
        operation_status: "error",
        message: "Failed to fetch user threads",
        error: `API request failed with status ${response.status}: ${errorText}`,
      };
    }

    const responseData = await response.json();

    // Check if the response has the expected structure
    if (!responseData.threads || !Array.isArray(responseData.threads)) {
      return {
        operation_status: "error",
        message: "Invalid response from backend",
        error: "Backend did not return a valid threads array",
      };
    }

    return {
      operation_status: "success",
      message: "The threads has been retrieved successfully",
      data: { threads: responseData.threads },
    };
  } catch (error) {
    return {
      operation_status: "error",
      message: "Internal server error",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Get messages from a thread
 */
export async function getThreadMessages(
  thread_id: string
): Promise<ApiResponse<{ thread_messages: ThreadMessage[] }>> {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        operation_status: "error",
        message: "Authentication required",
        error: "User must be logged in to fetch thread messages",
      };
    }

    // Get access token from session (try both locations)
    const accessToken = session.accessToken || session.session?.access_token;
    if (!accessToken) {
      return {
        operation_status: "error",
        message: "Authentication token missing",
        error: "No access token available in session",
      };
    }

    // Validate required fields
    if (!thread_id) {
      return {
        operation_status: "error",
        message: "Missing required fields",
        error: "thread_id is required",
      };
    }

    // Get backend URL from environment
    const backendUrl =
      process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return {
        operation_status: "error",
        message: "Backend configuration error",
        error: "Backend URL not configured",
      };
    }

    const apiUrl = `${backendUrl}/api/v1/rag/thread_messages`;

    // Prepare request payload as JSON
    const requestPayload = {
      thread_id: thread_id,
    };

    // Prepare headers with authentication
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    // Make API call to backend
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        operation_status: "error",
        message: "Failed to fetch thread messages",
        error: `API request failed with status ${response.status}: ${errorText}`,
      };
    }

    const responseData = await response.json();

    // Check if the response has the expected structure
    if (
      !responseData.thread_messages ||
      !Array.isArray(responseData.thread_messages)
    ) {
      return {
        operation_status: "error",
        message: "Invalid response from backend",
        error: "Backend did not return a valid thread_messages array",
      };
    }
    return {
      operation_status: "success",
      message: responseData.message || "Thread messages retrieved successfully",
      data: { thread_messages: responseData.thread_messages },
    };
  } catch (error) {
    return {
      operation_status: "error",
      message: "Internal server error",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

// Define the backend response structure
interface RagResponse {
  illustrative_images: string[];
  message_id: string;
  assistant_message_id: string;
  contain_output_audio_file: boolean;
  generated_audio_file_url: string;
  input_type: string;
  message: string;
  operation_status: string;
  output_text: string;
  partial_errors: string[];
  sources: Array<{
    lesson_title: string;
    page_number: number;
    unit_title: string;
  }>;
}

/**
 * Add a message to a thread and get AI response
 */
export async function addMessageToThread(
  thread_id: string,
  input_type: string,
  query: string,
  audioFile?: File,
  imageFile?: File
): Promise<ApiResponse<RagResponse>> {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        operation_status: "error",
        message: "Authentication required",
        error: "User must be logged in to send messages",
      };
    }

    // Get access token from session (try both locations)
    const accessToken = session.accessToken || session.session?.access_token;
    if (!accessToken) {
      return {
        operation_status: "error",
        message: "Authentication token missing",
        error: "No access token available in session",
      };
    }

    // Validate required fields
    if (!thread_id || !input_type) {
      return {
        operation_status: "error",
        message: "Missing required fields",
        error: "thread_id, input_type, are required",
      };
    }

    // Get backend URL from environment
    const backendUrl =
      process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return {
        operation_status: "error",
        message: "Backend configuration error",
        error: "Backend URL not configured",
      };
    }

    const apiUrl = `${backendUrl}/api/v1/rag/`;

    // Prepare request

    // Prepare request payload as FormData
    const formData = new FormData();
    formData.append("thread_id", thread_id);
    formData.append("input_type", input_type);

    // Add text query if provided
    if (query || input_type === "text") {
      formData.append("query", query);
    }

    // Add audio file if provided
    if (audioFile && input_type === "audio") {
      formData.append("audio_file", audioFile, "voice_message.WAV");
    }

    // Add image file if provided
    if (imageFile && input_type === "image") {
      formData.append("image_file", imageFile, imageFile.name);
    }

    // Prepare headers with authentication (don't set Content-Type for FormData)
    const headers = {
      Authorization: `Bearer ${accessToken}`,
    };

    // Make API call to backend
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        operation_status: "error",
        message: "Failed to send message",
        error: `API request failed with status ${response.status}: ${errorText}`,
      };
    }

    const responseData: RagResponse = await response.json();

    // Check if the response has the expected structure
    if (!responseData.output_text && !responseData.message) {
      return {
        operation_status: "error",
        message: "Invalid response from backend",
        error: "Backend did not return expected response structure",
      };
    }

    return {
      operation_status: "success",
      message: "Message sent successfully",
      data: responseData,
    };
  } catch (error) {
    return {
      operation_status: "error",
      message: "Internal server error",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Delete a chat thread
 */
export async function deleteThread(
  thread_id: string
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        operation_status: "error",
        message: "Authentication required",
        error: "User must be logged in to delete a thread",
      };
    }

    // Get access token from session (try both locations)
    const accessToken = session.accessToken || session.session?.access_token;
    if (!accessToken) {
      return {
        operation_status: "error",
        message: "Authentication token missing",
        error: "No access token available in session",
      };
    }

    // Validate required fields
    if (!thread_id) {
      return {
        operation_status: "error",
        message: "Missing required fields",
        error: "thread_id is required",
      };
    }

    // Get backend URL from environment
    const backendUrl =
      process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return {
        operation_status: "error",
        message: "Backend configuration error",
        error: "Backend URL not configured",
      };
    }

    const apiUrl = `${backendUrl}/api/v1/rag/delete_chat_history`;

    // Prepare request payload
    const requestPayload = {
      thread_id: thread_id,
    };

    // Prepare headers with authentication
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    // Make API call to backend
    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        operation_status: "error",
        message: "Failed to delete thread",
        error: `API request failed with status ${response.status}: ${errorText}`,
      };
    }

    const responseData = await response.json();

    return {
      operation_status: "success",
      message: "Thread deleted successfully",
      data: { success: true },
    };
  } catch (error) {
    return {
      operation_status: "error",
      message: "Internal server error",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Search through user's chat conversations
 * POST /api/v1/rag/search-chats  { keyword: string }
 */
export async function searchChats(
  keyword: string
): Promise<ApiResponse<{ threads: SearchedThread[] }>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return {
        operation_status: "error",
        message: "Authentication required",
        error: "Not logged in",
      };
    }
    const accessToken = session.accessToken || session.session?.access_token;
    if (!accessToken) {
      return {
        operation_status: "error",
        message: "Authentication token missing",
        error: "No access token",
      };
    }
    const backendUrl =
      process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return {
        operation_status: "error",
        message: "Backend configuration error",
        error: "Backend URL not configured",
      };
    }
    const apiUrl = `${backendUrl}/api/v1/rag/search-chats`;
    const response = await fetchWithAuth(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ keyword }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      return {
        operation_status: "error",
        message: "Search failed",
        error: `Status ${response.status}: ${errorText}`,
      };
    }
    const responseData = await response.json();
    // The API returns a plain string or an array — normalise to threads array
    const threads: SearchedThread[] = Array.isArray(responseData)
      ? responseData
      : Array.isArray(responseData?.threads)
        ? responseData.threads
        : [];
    return {
      operation_status: "success",
      message: "Search completed",
      data: { threads },
    };
  } catch (error) {
    return {
      operation_status: "error",
      message: "Internal server error",
      error: error instanceof Error ? error.message : "Unexpected error",
    };
  }
}

/**
 * Get curriculum data
 */
export async function getCurriculum(): Promise<
  ApiResponse<{ curriculum: any[] }>
> {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        operation_status: "error",
        message: "Authentication required",
        error: "User must be logged in to fetch curriculum data",
      };
    }

    // Get access token from session (try both locations)
    const accessToken = session.accessToken || session.session?.access_token;
    if (!accessToken) {
      return {
        operation_status: "error",
        message: "Authentication token missing",
        error: "No access token available in session",
      };
    }

    // Get backend URL from environment
    const backendUrl =
      process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      return {
        operation_status: "error",
        message: "Backend configuration error",
        error: "Backend URL not configured",
      };
    }

    // Get grade_id from the authenticated session — no hardcoded fallback
    const gradeId = (session?.user as any)?.grade_id;

    // Build URL using the grade-based subjects endpoint
    const apiUrl = `${backendUrl}/api/v1/grade/${gradeId}/subjects`;

    // Prepare headers with authentication
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    // Make API call to backend
    const response = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        operation_status: "error",
        message: "Failed to fetch curriculum data",
        error: `API request failed with status ${response.status}: ${errorText}`,
      };
    }

    const responseData = await response.json();
    const items: any[] = Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(responseData?.subjects)
        ? responseData.subjects
        : Array.isArray(responseData)
          ? responseData
          : [];

    return {
      operation_status: "success",
      message: "The curriculum data has been retrieved successfully",
      data: { curriculum: items },
    };
  } catch (error) {
    return {
      operation_status: "error",
      message: "Internal server error",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
