import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ success: false, message: "URL parameter is required" }, { status: 400 });
  }

  try {
    const start = Date.now();
    
    // We use a short timeout (5s) for health checks
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(targetUrl, {
      method: "GET",
      signal: controller.signal,
      cache: "no-store",
      headers: {
        "User-Agent": "SewDigital-Admin-Proxy/1.0",
        "ngrok-skip-browser-warning": "69420"
      }
    });

    clearTimeout(timeoutId);
    const latency = Date.now() - start;

    // Attempt to forward the body (health endpoints return JSON diagnostics)
    let body: any = null;
    try {
      body = await response.json();
    } catch {
      // Non-JSON body — that's fine, just skip it
    }

    return NextResponse.json({
      success: true,
      status: response.status,
      ok: response.ok,
      latency,
      body
    });
  } catch (err: any) {
    console.error(`[Proxy-Ping] Error for ${targetUrl}:`, err.message);
    return NextResponse.json({
      success: false,
      message: err.name === "AbortError" ? "Request Timed Out" : "Unreachable",
      latency: 0,
      ok: false
    });
  }
}
