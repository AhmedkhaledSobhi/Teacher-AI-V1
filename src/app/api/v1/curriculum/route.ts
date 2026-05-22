import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/auth";
import apiServer from "@/app/server/utils/ApiServer";

/**
 * GET /api/v1/curriculum
 * Proxies to backend GET /api/v1/grade/{grade_id}/subjects
 * Returns subjects for the authenticated student's grade.
 */
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const gradeId = (session?.user as any)?.grade_id ?? 1;

    const response = await apiServer.get(`/api/v1/grade/${gradeId}/subjects`);
    return NextResponse.json(response.data, {
      status: 200,
      headers: { "Cache-Control": "private, max-age=300" },
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
