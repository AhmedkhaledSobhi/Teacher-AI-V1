import { NextRequest, NextResponse } from "next/server";
import { makeAuthenticatedAPICall } from "@/app/api/handlers";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ quiz_id: string }> }
) {
  try {
    const { quiz_id } = await params;
    const res = await makeAuthenticatedAPICall(`/api/v1/quiz/${quiz_id}/start`, {
      method: "POST",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Failed to start quiz" }, { status: 500 });
  }
}
