import { NextRequest, NextResponse } from "next/server";
import apiServer from "@/app/server/utils/ApiServer";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ unit_id: string }> }
) {
  try {
    const { unit_id } = await params;

    if (!unit_id || isNaN(Number(unit_id))) {
      return NextResponse.json(
        { operation_status: "error", message: "Invalid unit ID" },
        { status: 400 }
      );
    }

    const response = await apiServer.get(`/api/v1/unit/${unit_id}/lessons`);
    return NextResponse.json(response.data, {
      status: 200,
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const data = error?.response?.data ?? {
      operation_status: "error",
      message: "Failed to fetch unit lessons",
    };
    return NextResponse.json(data, { status });
  }
}
