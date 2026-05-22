import { getAuthTokenServer } from "@/app/api/api-headers/auth-server-utils";
import { NextRequest, NextResponse } from "next/server";

const BASE_URL =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "https://drsi.ai";

export async function GET(req: NextRequest) {
  try {
    const token = await getAuthTokenServer();
    const { searchParams } = new URL(req.url);

    const lesson_id = searchParams.get("lesson_id");
    const unit_id = searchParams.get("unit_id");
    const persona = searchParams.get("persona") ?? "Ahmad";

    const url = new URL(`${BASE_URL}/api/v1/explain/get-explanation`);
    if (lesson_id) url.searchParams.set("lesson_id", lesson_id);
    if (unit_id) url.searchParams.set("unit_id", unit_id);
    url.searchParams.set("persona", persona);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const res = await fetch(url.toString(), { method: "GET", headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: "Failed to get stored explanation" },
      { status: 500 }
    );
  }
}
