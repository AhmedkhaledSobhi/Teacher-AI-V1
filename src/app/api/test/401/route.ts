import { NextResponse } from "next/server";

/**
 * Test endpoint that returns 401 Unauthorized
 * Use this to test 401 handling and redirect behavior
 *
 * @example
 * // In browser console or component:
 */
export async function GET() {
  return NextResponse.json(
    {
      error: "Unauthorized",
      message: "This is a test 401 response",
      detail: "Use this endpoint to test 401 handling and redirect behavior",
    },
    { status: 401 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: "Unauthorized",
      message: "This is a test 401 response",
      detail: "Use this endpoint to test 401 handling and redirect behavior",
    },
    { status: 401 }
  );
}
