import { NextRequest, NextResponse } from "next/server";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { getRandomUserAgent } from "@/lib/user-agent";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import TurndownService from "turndown";
import { postProcessImages } from "./article-process";

const ARTICLES_DIR = path.join(process.cwd(), "articles");

if (!fs.existsSync(ARTICLES_DIR)) {
  fs.mkdirSync(ARTICLES_DIR, { recursive: true });
}

function getForwardedHeaders(req: NextRequest): Record<string, string> {
  const forwardedHeaders: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    if (key.toLowerCase().startsWith("xr-")) {
      const newKey = key.substring(3);
      forwardedHeaders[newKey] = value;
    }
  });
  return forwardedHeaders;
}

async function processUrl(
  url: string,
  forwardedHeaders: Record<string, string> = {}
) {
  if (!url) {
    throw new Error("URL is required");
  }

  const urlHash = crypto.createHash("md5").update(url).digest("hex");
  const articleDir = path.join(ARTICLES_DIR, urlHash);
  const articlePath = path.join(articleDir, "index.md");

  if (fs.existsSync(articlePath)) {
    console.log(`[Cache] HIT: Article found at ${articlePath}`);
    return {
      id: urlHash,
      article: postProcessImages(
        urlHash,
        fs.readFileSync(articlePath, "utf-8")
      ),
    };
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

  if (!article || !article.content) {
    throw new Error("Could not parse article content");
  }

  if (!fs.existsSync(articleDir)) {
    fs.mkdirSync(articleDir, { recursive: true });
  }

  const turndownService = new TurndownService();
  let markdown = turndownService.turndown(article.content);

  // Download images and update markdown
  const imgRegex = /!\[.*?\]\((.*?)\)/g;
  let match: RegExpExecArray | null;
  let imageIndex = 0;

  while ((match = imgRegex.exec(markdown)) !== null) {
    const imageUrl = new URL(match[1], url).href;
    const imageName = `image-${imageIndex++}${getExtName(imageUrl) || ".jpg"}`;
    const imagePath = path.join(articleDir, imageName);
    const relativePath = `./${imageName}`;

    const response = await fetch(imageUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(imagePath, Buffer.from(buffer));
    console.log(`Downloaded image: ${imageUrl} -> ${imagePath}`);
    markdown = markdown.replace(match[1], relativePath);
  }

  // Add metadata to markdown
  const articleMetadata = `---
title: ${article.title || "Untitled"}
url: ${url}
author: ${article.byline || "Unknown"}
published: ${article.publishedTime || new Date().toISOString()}
processed: ${new Date().toISOString()}
---

`;
  const fullMarkdown = articleMetadata + markdown;

  fs.writeFileSync(articlePath, fullMarkdown, "utf-8");
  console.log(`Saved markdown to ${articlePath}`);

  return { id: urlHash, article: postProcessImages(urlHash, fullMarkdown) };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const forwardedHeaders = getForwardedHeaders(req);

    const result = await processUrl(url || "", forwardedHeaders);

    return NextResponse.json(result);
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
    const { url } = await req.json();
    const forwardedHeaders = getForwardedHeaders(req);

    const result = await processUrl(url, forwardedHeaders);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error processing URL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process URL" },
      { status: error.message === "URL is required" ? 400 : 500 }
    );
  }
}

const getExtName = (url: string): string => {
  const ext = path.extname(url).split("?")[0];
  return ext ? ext : "jpg";
};
