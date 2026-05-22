import { NextRequest, NextResponse } from "next/server";
import { makeAuthenticatedAPICall } from "@/app/api/handlers";

/**
 * API Configuration
 */
const API_CONFIG = {
  BACKEND_ENDPOINT: "/api/v1/subjects",
};

/**
 * Validates subject ID parameter
 */
function validateSubjectId(id: string): { valid: boolean; error?: string } {
  if (!id || typeof id !== "string") {
    return { valid: false, error: "Subject ID is required" };
  }

  const trimmedId = id.trim();
  if (!trimmedId) {
    return { valid: false, error: "Subject ID cannot be empty" };
  }

  if (!/^\d+$/.test(trimmedId)) {
    return { valid: false, error: "Subject ID must be a valid number" };
  }

  return { valid: true };
}

/**
 * GET /api/v1/subjects/[id]/details
 *
 * Fetches subject details including units and lessons from backend
 *
 * Parameters:
 * - id: Subject ID (required, numeric)
 *
 * Response:
 * {
 *   "operation_status": "success" | "error",
 *   "message": "...",
 *   "data": [
 *     {
 *       "unit_id": 123,
 *       "unit_title": "Unit Title",
 *       "lessons": [
 *         {
 *           "lesson_id": 456,
 *           "lesson_title": "Lesson Title"
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const requestId = Math.random().toString(36).substring(7);
  const startTime = Date.now();

  try {
    const { id: subjectId } = await params;

    // Validate subject ID
    const validation = validateSubjectId(subjectId);
    if (!validation.valid) {
      console.warn(`[${requestId}] ⚠️ Validation failed: ${validation.error}`);
      return NextResponse.json(
        {
          operation_status: "error",
          message: "Invalid request",
          errors: { subject_id: validation.error },
        },
        {
          status: 400,
          headers: { "X-Request-ID": requestId },
        }
      );
    }

    // Call backend API with authentication

    const backendResponse = await makeAuthenticatedAPICall(
      `${API_CONFIG.BACKEND_ENDPOINT}/${subjectId}/details`,
      { method: "GET" }
    );

    // Parse response
    const backendData = await backendResponse.json();
    const duration = Date.now() - startTime;

    return NextResponse.json(backendData, {
      status: backendData.operation_status === "success" ? 200 : 400,
      headers: {
        "X-Request-ID": requestId,
        "X-Response-Time": `${duration}ms`,
        "Cache-Control": "public, max-age=300", // Cache for 5 minutes
      },
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error(
      `[${requestId}] ❌ Request failed (${duration}ms):`,
      errorMessage
    );

    return NextResponse.json(
      {
        operation_status: "error",
        message: "Failed to fetch subject details",
        errors: { general: errorMessage },
      },
      {
        status: 500,
        headers: {
          "X-Request-ID": requestId,
          "X-Response-Time": `${duration}ms`,
        },
      }
    );
  }
}
