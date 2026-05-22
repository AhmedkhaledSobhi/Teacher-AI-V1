import { NextRequest, NextResponse } from "next/server";
import { makeAuthenticatedAPICall } from "@/app/api/handlers";

// POST /api/v1/quiz/lesson-quiz
// Body: { lesson_id, unit_id, quiz_category: "basic" | "smart" }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await makeAuthenticatedAPICall("/api/v1/quiz/lesson-quiz", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
