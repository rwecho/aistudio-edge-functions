import { NextRequest, NextResponse } from "next/server";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { getFromCache, setCache } from "./article-cache";
import { getRandomUserAgent } from "@/lib/user-agent";
import { capitalize } from "es-toolkit";

function getForwardedHeaders(req: NextRequest): Record<string, string> {
  const forwardedHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key.toLowerCase().startsWith("xr-")) {
      key = key.substring(3);
      const parts = key.split("-").map((part) => {
        part = capitalize(part);
        return part;
      });
      forwardedHeaders[parts.join("-")] = value;
    }
  });
  return forwardedHeaders;
}

async function processUrl(
  url: string,
  forwardedHeaders: Record<string, string> = {},
  noCache: boolean = false
) {
  if (!url) {
    throw new Error("URL is required");
  }

  // 首先检查缓存
  const cachedData = noCache ? null : getFromCache(url, forwardedHeaders);
  if (cachedData) {
    return cachedData;
  }

  console.log(`[Fetch] Fetching ${url}`);

  const baseHeaders = {
    "User-Agent": getRandomUserAgent(),
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
    "Accept-Encoding": "gzip, deflate, br",
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1",
    "Cache-Control": "max-age=0",
  };

  const headers = { ...baseHeaders, ...forwardedHeaders };

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const html = await response.text();

  console.log("Fetched HTML for new URL:", url);

  const doc = new JSDOM(html, {
    url: url,
    referrer: response.url,
    contentType: "text/html",
    includeNodeLocations: true,
    storageQuota: 10000000,
  });

  const reader = new Readability(doc.window.document);
  const article = reader.parse();

  if (!article) {
    throw new Error("Could not parse article content");
  }

  // 将结果存入缓存
  if (!noCache) {
    setCache(url, article, forwardedHeaders);
  }

  return article;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const noCache = searchParams.get("noCache") !== null;
    const forwardedHeaders = getForwardedHeaders(req);

    // 检查是否从缓存获取
    const wasFromCache =
      !noCache && getFromCache(url || "", forwardedHeaders) !== null;
    const article = await processUrl(url || "", forwardedHeaders, noCache);

    return NextResponse.json({
      data: article,
      fromCache: wasFromCache,
    });
  } catch (error: any) {
    console.error("Error processing URL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process URL" },
      { status: error.message === "URL is required" ? 400 : 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { url, noCache } = await req.json();
    const forwardedHeaders = getForwardedHeaders(req);

    // 检查是否从缓存获取
    const wasFromCache =
      !noCache && getFromCache(url, forwardedHeaders) !== null;
    const article = await processUrl(url, forwardedHeaders, noCache);

    return NextResponse.json({
      data: article,
      fromCache: wasFromCache,
    });
  } catch (error: any) {
    console.error("Error processing URL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process URL" },
      { status: error.message === "URL is required" ? 400 : 500 }
    );
  }
}
