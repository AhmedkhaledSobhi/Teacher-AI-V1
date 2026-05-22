import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "https://drsi.ai";

/**
 * POST /api/v1/form/contact
 *
 * Proxies the contact / support form to the backend.
 *
 * Request body:
 * {
 *   "name": string,
 *   "email": string,
 *   "inquiry_type": "تقني" | "تعليمي" | "آخر",
 *   "message": string
 * }
 *
 * Success response (200):
 * { "operation_status": "success", "message": "..." }
 *
 * Error response (422):
 * { "operation_status": "fail", "error_code": "...", "message": "..." }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { name, email, inquiry_type, message } = body as {
      name?: string;
      email?: string;
      inquiry_type?: string;
      message?: string;
    };

    // Basic validation
    if (!name || !email || !message) {
      return NextResponse.json(
        {
          operation_status: "fail",
          message: "الاسم والبريد الإلكتروني والرسالة مطلوبة",
        },
        { status: 422 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/v1/form/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ name, email, inquiry_type, message }),
    });

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("[ContactAPI] Error:", error);
    return NextResponse.json(
      {
        operation_status: "fail",
        message: "حدث خطأ داخلي في السيرفر",
      },
      { status: 500 }
    );
  }
}
