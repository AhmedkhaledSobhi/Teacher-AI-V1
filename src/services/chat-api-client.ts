/**
 * CLIENT-SIDE Chat API Service
 * Makes direct fetch calls to backend - visible in browser network tab
 * NO Next.js API routes - shows actual backend URLs
 */

import { getSession } from "next-auth/react";

let _isHandlingUnauthorized = false;

/**
 * If a response comes back with 403, hard-navigate to the next-auth signout
 * endpoint. Using window.location.href avoids calling next-auth's fetch-based
 * signOut() which triggers CLIENT_FETCH_ERROR when the session is already gone.
 */
function handleUnauthorized(status: number): void {
  if (status !== 403 || _isHandlingUnauthorized) return;
  _isHandlingUnauthorized = true;

  if (typeof window !== "undefined") {
    const locale = window.location.pathname.split("/")[1] || "ar";
    window.location.href = `/api/auth/signout?callbackUrl=/${locale}/login`;
  }
}

// Backend URL - uses public env var (visible to client)
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://drsi.ai";

// ===========================
// TYPE DEFINITIONS
// ===========================

export interface ApiResponse<T = any> {
  operation_status: "success" | "error";
  message: string;
  data?: T;
  error?: string;
}

export interface InitializeThreadRequest {
  subject: string;
  term_id: number;
  user_id: string;
  grade_id: number;
}

export interface InitializeThreadResponse {
  thread_id: string;
}

export interface AddMessageRequest {
  thread_id: string;
  input_type: "text" | "audio" | "image";
  query?: string;
  audio_file?: File;
  image_file?: File;
  teacher_name?: string;
  study_and_learn?: boolean;
  selected_course?: string | null;
  selected_unit?: string | null;
  selected_lesson?: string | null;
  selected_page?: string | null;
}

export interface RagResponse {
  assistant_message_id: string;
  generated_audio_file_url: string;
  illustrative_images: string[];
  message: string;
  message_id: string;
  operation_status: string;
  output_text: string;
  partial_errors: string[];
  sources: Array<{
    lesson_title: string;
    page_number: number;
    unit_title: string;
  }>;
}

export interface ThreadMessage {
  message_id: string;
  content: string;
  role: "user" | "assistant";
  attached_image: string;
  generated_audio: string;
  illustrative_images?: string[];
  created_at?: string;
}

export interface Thread {
  thread_id: string;
  thread_name: string;
  subject?: string;
  subject_name?: string;
  display_name?: string;
  created_at?: string;
  updated_at?: string;
}

// ===========================
// AUTHENTICATION HELPER
// ===========================

/**
 * Get authentication headers for API calls
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const session = await getSession();
    const accessToken = session?.accessToken || session?.session?.access_token;

    if (!accessToken) {
      console.warn("⚠️ No access token found in session");
      return {};
    }

    return {
      Authorization: `Bearer ${accessToken}`,
    };
  } catch (error) {
    console.error("❌ Failed to get auth headers:", error);
    return {};
  }
}

// ===========================
// API FUNCTIONS
// ===========================

/**
 * Initialize a new chat thread
 * Direct backend call - visible in network tab
 */
export async function initializeThreadClient(
  params: InitializeThreadRequest
): Promise<ApiResponse<InitializeThreadResponse>> {
  const url = `${BACKEND_URL}/api/v1/rag/initialize_thread`;

  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      handleUnauthorized(response.status);
      const errorText = await response.text();
      console.error("❌ [CLIENT API] Request failed:", errorText);

      return {
        operation_status: "error",
        message: "Failed to initialize thread",
        error: `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      operation_status: "success",
      message: "Thread initialized successfully",
      data: { thread_id: data.thread_id },
    };
  } catch (error) {
    console.error("❌ [CLIENT API] Exception:", error);
    return {
      operation_status: "error",
      message: "Failed to initialize thread",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Add message to thread and get AI response
 * Direct backend call - visible in network tab
 * Supports text, audio, and image inputs
 */
export async function addMessageToThreadClient(
  params: AddMessageRequest
): Promise<ApiResponse<RagResponse>> {
  const url = `${BACKEND_URL}/api/v1/rag/`;

  try {
    const authHeaders = await getAuthHeaders();

    // Prepare FormData for file uploads
    const formData = new FormData();
    formData.append("thread_id", params.thread_id);
    formData.append("input_type", params.input_type);

    // Add text query if provided
    if (params.query || params.input_type === "text") {
      formData.append("query", params.query || "");
    }

    // Add teacher_name parameter (required)
    if (params.teacher_name) {
      formData.append("teacher_name", params.teacher_name);
    }

    // Add study_and_learn parameter (boolean)
    if (params.study_and_learn !== undefined) {
      formData.append("study_and_learn", String(params.study_and_learn));
    }

    // Add context parameters
    if (params.selected_course !== undefined) {
      formData.append("selected_course", params.selected_course || "");
    }
    if (params.selected_unit !== undefined) {
      formData.append("selected_unit", params.selected_unit || "");
    }
    if (params.selected_lesson !== undefined) {
      formData.append("selected_lesson", params.selected_lesson || "");
    }
    if (params.selected_page !== undefined) {
      formData.append("selected_page", params.selected_page || "");
    }

    // Add audio file if provided
    if (params.audio_file && params.input_type === "audio") {
      formData.append("audio_file", params.audio_file, "voice_message.WAV");
    }

    // Add image file if provided
    if (params.image_file && params.input_type === "image") {
      formData.append("image_file", params.image_file, params.image_file.name);
    }

    // Make direct fetch call (visible in network tab!)
    const response = await fetch(url, {
      method: "POST",
      headers: {
        // Don't set Content-Type for FormData - browser sets it with boundary
        ...authHeaders,
      },
      body: formData,
    });

    if (!response.ok) {
      handleUnauthorized(response.status);
      const errorText = await response.text();
      console.error("❌ [CLIENT API] Request failed:", errorText);

      return {
        operation_status: "error",
        message: "Failed to add message",
        error: `Request failed with status ${response.status}`,
      };
    }

    const data: RagResponse = await response.json();

    return {
      operation_status: "success",
      message: "Message added successfully",
      data,
    };
  } catch (error) {
    console.error("❌ [CLIENT API] Exception:", error);
    return {
      operation_status: "error",
      message: "Failed to add message",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get messages from a thread
 * Direct backend call - visible in network tab
 */
export async function getThreadMessagesClient(
  thread_id: string
): Promise<ApiResponse<{ thread_messages: ThreadMessage[] }>> {
  const url = `${BACKEND_URL}/api/v1/rag/thread_messages`;

  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ thread_id }),
    });

    if (!response.ok) {
      handleUnauthorized(response.status);
      const errorText = await response.text();
      console.error("❌ [CLIENT API] Request failed:", errorText);

      return {
        operation_status: "error",
        message: "Failed to get thread messages",
        error: `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      operation_status: "success",
      message: "Messages retrieved successfully",
      data: { thread_messages: data.thread_messages || [] },
    };
  } catch (error) {
    console.error("❌ [CLIENT API] Exception:", error);
    return {
      operation_status: "error",
      message: "Failed to get thread messages",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get user threads
 * Direct backend call - visible in network tab
 */
export async function getUserThreadsClient(
  user_id: string
): Promise<ApiResponse<{ threads: Thread[] }>> {
  const url = `${BACKEND_URL}/api/v1/rag/user_threads`;

  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ user_id }),
    });

    if (!response.ok) {
      handleUnauthorized(response.status);
      const errorText = await response.text();
      console.error("❌ [CLIENT API] Request failed:", errorText);

      return {
        operation_status: "error",
        message: "Failed to get user threads",
        error: `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();

    // The API may return threads as a flat array OR as a grouped object
    // { Today: [...], Yesterday: [...], "Last Week": [...], Older: [...] }
    let threads: Thread[] = [];
    const raw = data.threads;
    if (Array.isArray(raw)) {
      threads = raw;
    } else if (raw && typeof raw === "object") {
      // Flatten grouped response, preserving order: Today → Yesterday → Last Week → Older
      const order = ["Today", "Yesterday", "Last Week", "Older"] as const;
      for (const key of order) {
        const group = (raw as Record<string, Thread[]>)[key];
        if (Array.isArray(group)) {
          threads.push(...group);
        }
      }
    }

    return {
      operation_status: "success",
      message: "Threads retrieved successfully",
      data: { threads },
    };
  } catch (error) {
    console.error("❌ [CLIENT API] Exception:", error);
    return {
      operation_status: "error",
      message: "Failed to get user threads",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Generate audio for a message
 * Direct backend call - visible in network tab
 */
export async function generateAudioClient(
  message_id: string
): Promise<ApiResponse<{ generated_audio_file_url: string }>> {
  const url = `${BACKEND_URL}/api/v1/rag/audio_button`;

  try {
    const authHeaders = await getAuthHeaders();

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
      },
      body: JSON.stringify({ message_id }),
    });

    if (!response.ok) {
      handleUnauthorized(response.status);
      const errorText = await response.text();
      console.error("❌ [CLIENT API] Request failed:", errorText);

      return {
        operation_status: "error",
        message: "Failed to generate audio",
        error: `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();

    return {
      operation_status: "success",
      message: "Audio generated successfully",
      data: { generated_audio_file_url: data.generated_audio_file_url },
    };
  } catch (error) {
    console.error("❌ [CLIENT API] Exception:", error);
    return {
      operation_status: "error",
      message: "Failed to generate audio",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Export all as default for convenience
export default {
  initializeThread: initializeThreadClient,
  addMessageToThread: addMessageToThreadClient,
  getThreadMessages: getThreadMessagesClient,
  getUserThreads: getUserThreadsClient,
  generateAudio: generateAudioClient,
};
