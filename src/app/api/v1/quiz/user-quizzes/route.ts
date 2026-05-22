import { NextRequest, NextResponse } from "next/server";
import { makeAuthenticatedAPICall } from "@/app/api/handlers";
import { getAuthFullSessionServer } from "@/app/api/api-headers/auth-server-utils";

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthFullSessionServer();
    const userId =
      (session as any)?.user?.id ||
      (session as any)?.session?.user_id ||
      (session as any)?.userId ||
      "";

    // Get body from request if provided, otherwise use session userId
    let body = { user_id: userId };
    try {
      const requestBody = await req.json();
      body = { ...body, ...requestBody };
    } catch {
      // If no body provided, use default userId from session
    }

    const res = await makeAuthenticatedAPICall("/api/v1/quiz/user_quizzes", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}
