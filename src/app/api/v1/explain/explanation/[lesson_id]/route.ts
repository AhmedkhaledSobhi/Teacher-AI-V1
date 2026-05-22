import { getAuthTokenServer } from "@/app/api/api-headers/auth-server-utils";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://drsi.ai";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ lesson_id: string }> }
) {
  try {
    const { lesson_id } = await params;
    const token = await getAuthTokenServer();

    const { searchParams } = new URL(req.url);
    const persona = searchParams.get("persona") ?? "Ahmad";
    const unit_id = searchParams.get("unit_id");

    const url = new URL(`${BASE_URL}/api/v1/explain/explanation/${lesson_id}`);
    url.searchParams.set("persona", persona);
    if (unit_id) url.searchParams.set("unit_id", unit_id);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url.toString(), { method: "GET", headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch lesson explanation" },
      { status: 500 }
    );
  }
}
