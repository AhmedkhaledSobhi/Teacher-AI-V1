import { NextRequest, NextResponse } from "next/server";
import apiServer from "@/app/server/utils/ApiServer";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ grade_id: string }> }
) {
  try {
    const { grade_id } = await params;

    if (!grade_id || isNaN(Number(grade_id))) {
      return NextResponse.json(
        { operation_status: "error", message: "Invalid grade ID" },
        { status: 400 }
      );
    }

    const response = await apiServer.get(`/api/v1/grade/${grade_id}/subjects`);
    return NextResponse.json(response.data, {
      status: 200,
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const data = error?.response?.data ?? {
      operation_status: "error",
      message: "Failed to fetch grade subjects",
    };
    return NextResponse.json(data, { status });
  }
}
