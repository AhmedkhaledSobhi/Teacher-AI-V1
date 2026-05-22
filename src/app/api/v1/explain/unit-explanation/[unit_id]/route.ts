import { getAuthTokenServer } from "@/app/api/api-headers/auth-server-utils";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://drsi.ai";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ unit_id: string }> }
) {
  try {
    const { unit_id } = await params;
    const token = await getAuthTokenServer();

    const { searchParams } = new URL(req.url);
    const persona = searchParams.get("persona") ?? "Ahmad";
    const lesson_id = searchParams.get("lesson_id");

    // Backend explanation endpoint — unit_id in query params (no lesson_id path segment)
    const url = new URL(`${BASE_URL}/api/v1/explain/explanation`);
    url.searchParams.set("unit_id", unit_id);
    url.searchParams.set("persona", persona);
    if (lesson_id) url.searchParams.set("lesson_id", lesson_id);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url.toString(), { method: "GET", headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch unit explanation" },
      { status: 500 }
    );
  }
}
