import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ url: string[] }> }
) {
  try {
    // 从参数中获取目标 URL 的各部分
    const urlParts = (await params).url;

    // 获取请求的查询字符串
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    // 重新组合 URL 参数
    let targetUrl = urlParts.join("/");

    // 处理协议部分（确保包含 https:// 或 http://）
    if (urlParts[0] === "https:" || urlParts[0] === "http:") {
      targetUrl = `${urlParts[0]}//${urlParts.slice(1).join("/")}`;
    } else {
      targetUrl = `https://${targetUrl}`;
    }

    // 添加查询字符串到目标URL
    if (queryString) {
      targetUrl += `?${queryString}`;
    }

    const referrer =
      urlParts[0] === targetUrl
        ? request.headers.get("referer") || ""
        : request.headers.get("origin") || "";
    const userAgent = request.headers.get("user-agent");
    const accept = request.headers.get("accept");

    // 请求目标 URL
    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": userAgent || "",
        Accept: accept || "",
        Referer: referrer || "",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // 获取原始响应的内容类型
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";

    // 读取响应体为 ArrayBuffer
    const data = await response.arrayBuffer();

    // 创建一个新的响应
    return new NextResponse(data, {
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=86400",
        "access-control-allow-origin": "*",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: `Error proxying request: ${(error as any).message}` },
      { status: 500 }
    );
  }
}
