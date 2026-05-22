/**
 * Server actions for curriculum functionality
 * This file provides server actions for curriculum operations
 */

"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";

// Define response types
type ApiResponse<T> = {
  operation_status: "success" | "error";
  message: string;
  data?: T;
  error?: string;
  total_subjects?: number;
  grade?: string;
  grade_id?: number;
};

/**
 * Get curriculum data for a user
 */
export async function getCurriculum(
  user_id: string
): Promise<ApiResponse<any>> {
  try {
    // Get session for authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      console.error(
        "❌ [getCurriculum] No session found - user not authenticated"
      );
      return {
        operation_status: "error",
        message: "Authentication required",
        error: "User must be logged in to fetch curriculum data",
      };
    }

    // Get access token from session (try both locations)
    const accessToken = session.accessToken || session.session?.access_token;
    if (!accessToken) {
      console.error("❌ [getCurriculum] No access token found in session");
      return {
        operation_status: "error",
        message: "Authentication token missing",
        error: "No access token available in session",
      };
    }

    // Validate required fields
    if (!user_id) {
      console.error("❌ [getCurriculum] Validation failed - missing user_id");
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
      console.error("❌ [getCurriculum] Backend URL not configured");
      return {
        operation_status: "error",
        message: "Backend configuration error",
        error: "Backend URL not configured",
      };
    }

    // Build URL using the grade-based subjects endpoint
    const apiUrl = `${backendUrl}/api/v1/grade/${encodeURIComponent(user_id)}/subjects`;

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
      console.error("❌ [getCurriculum] API request failed:", {
        status: response.status,
        statusText: response.statusText,
        errorText,
      });
      return {
        operation_status: "error",
        message: "Failed to fetch curriculum data",
        error: `API request failed with status ${response.status}: ${errorText}`,
      };
    }

    const responseData = await response.json();

    // Check if the response has the expected structure
    if (!responseData.curriculum || !Array.isArray(responseData.curriculum)) {
      console.error(
        "❌ [getCurriculum] Invalid response structure:",
        responseData
      );
      return {
        operation_status: "error",
        message: "Invalid response from backend",
        error: "Backend did not return a valid curriculum array",
      };
    }

    // Return the restructured response format
    return {
      operation_status: "success",
      message: `Successfully retrieved curriculum structure for ${responseData.grade || "Grade 1 Elementary"}`,
      total_subjects: responseData.curriculum.length,
      grade: responseData.grade || "Grade 1 Elementary",
      grade_id: responseData.grade_id || 1,
      data: responseData.curriculum,
    };
  } catch (error) {
    console.error("💥 [getCurriculum] Unexpected error:", error);
    console.error(
      "💥 [getCurriculum] Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );
    return {
      operation_status: "error",
      message: "Internal server error",
      error:
        error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
