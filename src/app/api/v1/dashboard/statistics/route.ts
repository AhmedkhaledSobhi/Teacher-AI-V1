import { NextRequest, NextResponse } from "next/server";
import { makeAuthenticatedAPICall } from "@/app/api/handlers";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const period = searchParams.get("period") ?? "all_time";

    const res = await makeAuthenticatedAPICall(
      `/api/v1/dashboard/statistics?period=${period}`,
      {
        method: "GET",
      }
    );

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
