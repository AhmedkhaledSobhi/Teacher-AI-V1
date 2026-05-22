import { NextRequest, NextResponse } from "next/server";
import { makeAuthenticatedAPICall } from "@/app/api/handlers";

/**
 * GET /api/v1/quiz/[quiz_id]
 * Fetch a single quiz with its questions.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ quiz_id: string }> }
) {
  try {
    const { quiz_id } = await params;
    const res = await makeAuthenticatedAPICall(`/api/v1/quiz/${quiz_id}`, {
      method: "GET",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to fetch quiz" }, { status: 500 });
  }
}
