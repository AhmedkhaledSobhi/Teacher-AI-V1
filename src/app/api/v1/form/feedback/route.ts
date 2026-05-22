import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://drsi.ai";

/**
 * POST /api/v1/form/feedback
 *
 * Proxies the satisfaction survey / feedback form to the backend.
 *
 * Request body:
 * {
 *   "device_type": string,       // e.g. "Desktop/Chrome"
 *   "duration_seconds": number,  // seconds spent on the page
 *   "liked_features": string,    // free-text: features the user liked
 *   "rating": number,            // 1-5 star rating
 *   "session_id": string         // UUID for the browser session
 * }
 *
 * Success response (200):
 * { "message": "...", "operation_status": "success" }
 *
 * Validation error response (422):
 * { "detail": [ { "loc": [...], "msg": "string", "type": "string" } ] }
 *
 * Server error response (500):
 * { "operation_status": "fail", "message": "..." }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      device_type,
      duration_seconds,
      liked_features,
      rating,
      session_id,
    } = body as {
      device_type?: string;
      duration_seconds?: number;
      liked_features?: string;
      rating?: number;
      session_id?: string;
    };

    // Basic validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        {
          operation_status: "fail",
          message: "يرجى إدخال تقييم صحيح بين 1 و 5",
        },
        { status: 422 }
      );
    }

    const payload = {
      device_type: device_type ?? "unknown",
      duration_seconds: duration_seconds ?? 0,
      liked_features: liked_features ?? "",
      rating,
      session_id: session_id ?? crypto.randomUUID(),
    };

    const response = await fetch(`${BACKEND_URL}/api/v1/form/feedback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[FeedbackAPI] Error:", error);
    return NextResponse.json(
      {
        operation_status: "fail",
        message: "حدث خطأ داخلي في السيرفر",
      },
      { status: 500 }
    );
  }
}
