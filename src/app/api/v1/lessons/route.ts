import { NextRequest, NextResponse } from "next/server";
import apiServer from "@/app/server/utils/ApiServer";

/**
 * GET /api/v1/lessons?unit_ids=12&unit_ids=13
 *
 * Fetches lessons for one or more units in parallel by calling
 * GET /api/v1/unit/{unit_id}/lessons for each unit ID provided.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const unitIds = searchParams
      .getAll("unit_ids")
      .filter((id) => /^\d+$/.test(id));

    if (unitIds.length === 0) {
      return NextResponse.json(
        {
          operation_status: "error",
          message: "At least one numeric unit_ids param is required",
        },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      unitIds.map((id) =>
        apiServer
          .get(`/api/v1/unit/${id}/lessons`)
          .then((r: any) => {
            const items: any[] = Array.isArray(r.data?.data)
              ? r.data.data
              : Array.isArray(r.data?.lessons)
                ? r.data.lessons
                : [];
            return items.map((l: any) => ({
              lesson_id: l.lesson_id ?? l.id,
              lesson_title: l.lesson_title ?? l.title ?? l.name ?? "",
              unit_id: l.unit_id ?? Number(id),
            }));
          })
          .catch(() => [] as any[])
      )
    );

    return NextResponse.json(
      { operation_status: "success", data: results.flat() },
      { status: 200, headers: { "Cache-Control": "public, max-age=300" } }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        operation_status: "error",
        message: error?.message ?? "Failed to fetch lessons",
      },
      { status: 500 }
    );
  }
}
