import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://drsi.ai";

/**
 * POST /api/v1/form/internal-feedback
 *
 * Proxies the authenticated internal survey feedback to the backend.
 *
 * Request body:
 * {
 *   "responses": { [question: string]: string },
 *   "session_id": string,
 *   "user_type": "البطل عمر" | "ولي الأمر"
 * }
 *
 * Success response (200):
 * { "operation_status": "success", "message": "..." }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { responses, session_id, user_type } = body as {
      responses?: Record<string, string>;
      session_id?: string;
      user_type?: string;
    };

    if (!responses || !user_type) {
      return NextResponse.json(
        {
          operation_status: "fail",
          message: "الردود ونوع المستخدم مطلوبان",
        },
        { status: 422 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/v1/form/internal-feedback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Forward auth cookie if present
          ...(request.headers.get("cookie")
            ? { Cookie: request.headers.get("cookie")! }
            : {}),
        },
        body: JSON.stringify({ responses, session_id, user_type }),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[InternalFeedbackAPI] Error:", error);
    return NextResponse.json(
      {
        operation_status: "fail",
        message: "حدث خطأ داخلي في السيرفر",
      },
      { status: 500 }
    );
  }
}
