import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

// 处理预检请求(OPTIONS)
export async function OPTIONS(request: NextRequest) {
  // 获取请求来源
  const origin = request.headers.get("origin") || "*";

  // 获取请求头中的 Access-Control-Request-Headers
  const requestHeaders =
    request.headers.get("access-control-request-headers") || "";

  // 返回支持CORS的响应
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers":
        requestHeaders || "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Max-Age": "86400", // 24小时
    },
  });
}

// 设置CORS头部的辅助函数
function setCorsHeaders(response: NextResponse, request: NextRequest) {
  const origin = request.headers.get("origin") || "*";

  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.headers.set("Access-Control-Allow-Credentials", "true");

  if (origin !== "*") {
    response.headers.set("Vary", "Origin");
  }

  return response;
}

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
      const errorResponse = NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
      return setCorsHeaders(errorResponse, request);
    }

    // 获取原始响应的内容类型
    const contentType =
      response.headers.get("content-type") || "application/octet-stream";

    // 读取响应体为 ArrayBuffer
    const data = await response.arrayBuffer();

    // 创建一个新的响应
    const nextResponse = new NextResponse(data, {
      headers: {
        "content-type": contentType,
        "cache-control": "public, max-age=86400",
      },
    });

    return setCorsHeaders(nextResponse, request);
  } catch (error) {
    console.error("Proxy error:", error);
    const errorResponse = NextResponse.json(
      { error: `Error proxying request: ${(error as any).message}` },
      { status: 500 }
    );
    return setCorsHeaders(errorResponse, request);
  }
}
