import { NextRequest, NextResponse } from "next/server";
import { makeAuthenticatedAPICall } from "@/app/api/handlers";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: unitId } = await params;

    if (!unitId || isNaN(Number(unitId))) {
      return NextResponse.json(
        { operation_status: "error", message: "Invalid unit ID" },
        { status: 400 }
      );
    }

    // Backend endpoint: /api/v1/unit/{unit_id}/lessons (singular "unit")
    const response = await makeAuthenticatedAPICall(
      `/api/v1/unit/${unitId}/lessons`,
      { method: "GET" }
    );
    const data = await response.json();
    return NextResponse.json(data, {
      status: 200,
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (error: any) {
    const msg = error?.message ?? "Failed to fetch unit lessons";
    try {
      const parsed = JSON.parse(msg);
      return NextResponse.json(parsed, { status: parsed.status ?? 500 });
    } catch {
      return NextResponse.json(
        { operation_status: "error", message: msg },
        { status: 500 }
      );
    }
  }
}
