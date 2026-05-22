import { NextRequest, NextResponse } from "next/server";
import apiServer from "@/app/server/utils/ApiServer";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ grade_id: string; subject_id: string }> }
) {
  try {
    const { grade_id, subject_id } = await params;

    if (!grade_id || isNaN(Number(grade_id))) {
      return NextResponse.json(
        { operation_status: "error", message: "Invalid grade ID" },
        { status: 400 }
      );
    }
    if (!subject_id || isNaN(Number(subject_id))) {
      return NextResponse.json(
        { operation_status: "error", message: "Invalid subject ID" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const term_id = searchParams.get("term_id") ?? "2";
    const course_id = searchParams.get("course_id");

    const queryString = new URLSearchParams({ term_id });
    if (course_id) queryString.set("course_id", course_id);

    const response = await apiServer.get(
      `/api/v1/grade/${grade_id}/subject/${subject_id}/units?${queryString.toString()}`
    );
    return NextResponse.json(response.data, {
      status: 200,
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch (error: any) {
    const status = error?.response?.status ?? 500;
    const data = error?.response?.data ?? {
      operation_status: "error",
      message: "Failed to fetch subject units",
    };
    return NextResponse.json(data, { status });
  }
}
