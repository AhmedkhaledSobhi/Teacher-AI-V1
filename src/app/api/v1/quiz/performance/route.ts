import { NextRequest, NextResponse } from "next/server";
import { makeAuthenticatedAPICall } from "@/app/api/handlers";

// Backend API configuration
const BACKEND_URL = process.env.BACKEND_URL || "https://drsi.ai";

/**
 * GET /api/v1/quiz/performance
 * Get performance dashboard data for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    // Make authenticated API call to backend
    const backendResponse = await makeAuthenticatedAPICall(
      "/api/v1/quiz/performance-dashboard",
      {
        method: "GET",
      }
    );

    // Parse the backend response
    const backendData = await backendResponse.json();

    // Return the backend response
    return NextResponse.json(backendData, { status: 200 });
  } catch (error) {
    console.error("❌ Error fetching performance:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        operation_status: "error",
        message: "Failed to fetch performance data",
        errors: { general: errorMessage },
      },
      { status: 500 }
    );
  }
}
