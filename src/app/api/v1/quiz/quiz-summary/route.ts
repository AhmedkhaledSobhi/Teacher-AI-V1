import { NextRequest, NextResponse } from "next/server";
import { makeAuthenticatedAPICall } from "@/app/api/handlers";

export async function GET(_req: NextRequest) {
  try {
    const res = await makeAuthenticatedAPICall("/api/v1/quiz/quiz-summary");
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to fetch quiz summary" }, { status: 500 });
  }
}
