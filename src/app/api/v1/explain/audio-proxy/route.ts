import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy an external audio URL through the Next.js server so the browser
 * avoids cross-origin (CORS) restrictions on the S3 presigned URL.
 *
 * Usage: /api/v1/explain/audio-proxy?url=<encoded-audio-url>
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const audioUrl = searchParams.get("url");

  if (!audioUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let decodedUrl: string;
  try {
    decodedUrl = decodeURIComponent(audioUrl);
  } catch {
    return NextResponse.json({ error: "Invalid url parameter" }, { status: 400 });
  }

  try {
    const upstream = await fetch(decodedUrl, {
      headers: {
        // Pass a reasonable browser-like Accept so S3 returns the file
        Accept: "audio/*,*/*;q=0.8",
      },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream returned ${upstream.status}` },
        { status: upstream.status }
      );
    }

    const contentType = upstream.headers.get("content-type") ?? "audio/mpeg";
    const contentLength = upstream.headers.get("content-length");

    const responseHeaders: Record<string, string> = {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=3600",
      // Allow the browser to use this response
      "Access-Control-Allow-Origin": "*",
    };
    if (contentLength) responseHeaders["Content-Length"] = contentLength;

    return new NextResponse(upstream.body, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch audio", detail: String(err) },
      { status: 500 }
    );
  }
}
