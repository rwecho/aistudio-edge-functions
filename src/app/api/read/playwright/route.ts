import { NextRequest, NextResponse } from "next/server";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import { getRandomUserAgent } from "@/lib/user-agent";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import TurndownService from "turndown";
import { chromium } from "playwright-core";
import { postProcessImages } from "../v2/article-process";

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

async function processUrlWithPlaywright(
  url: string,
  forwardedHeaders: Record<string, string> = {}
) {
  if (!url) {
    throw new Error("URL is required");
  }

  const playwrightEndpoint = process.env.PLAYWRIGHT_WS_ENDPOINT;
  if (!playwrightEndpoint) {
    throw new Error("PLAYWRIGHT_WS_ENDPOINT environment variable is not set");
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

  console.log(`[Playwright] Fetching ${url}`);

  // Connect to remote Playwright instance
  const browser = await chromium.connect(playwrightEndpoint);

  try {
    const userAgent = getRandomUserAgent();

    const context = await browser.newContext({
      userAgent: userAgent,
      viewport: { width: 1280, height: 720 },
      extraHTTPHeaders: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        Connection: "keep-alive",
        ...forwardedHeaders,
      },
    });

    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 5000 });

    const htmlContent = await page.content();

    await page.close();
    await context.close();

    console.log("Fetched HTML with Playwright for URL:", url);

    const doc = new JSDOM(htmlContent, {
      url: url,
      referrer: url,
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

    const content = fixWeChatArticleImages(article.content, url);

    const turndownService = new TurndownService();
    let markdown = turndownService.turndown(content);

    // Download images and update markdown
    const imgRegex = /!\[.*?\]\((.*?)\)/g;
    let match: RegExpExecArray | null;
    let imageIndex = 0;

    while ((match = imgRegex.exec(markdown)) !== null) {
      const currentMatch = match; // Store the match to avoid null issues
      const imageUrl = new URL(currentMatch[1], url).href;

      if (!imageUrl.startsWith("http")) {
        console.warn(`Skipping invalid image URL: ${imageUrl}`);
        continue;
      }

      const imageName = `image-${imageIndex++}${
        path.extname(imageUrl) || ".jpg"
      }`;
      const imagePath = path.join(articleDir, imageName);
      const relativePath = `./${imageName}`;

      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      const buffer = await response.arrayBuffer();
      fs.writeFileSync(imagePath, Buffer.from(buffer));
      markdown = markdown.replace(currentMatch[1], relativePath);
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

    return {
      articlePath: `/articles/${urlHash}`,
      title: article.title,
      author: article.byline,
      publishedTime: article.publishedTime,
    };
  } finally {
    await browser.close();
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const forwardedHeaders = getForwardedHeaders(req);

    const result = await processUrlWithPlaywright(url || "", forwardedHeaders);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error processing URL with Playwright:", error);
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

    const result = await processUrlWithPlaywright(url, forwardedHeaders);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error processing URL with Playwright:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process URL" },
      { status: error.message === "URL is required" ? 400 : 500 }
    );
  }
}

const fixWeChatArticleImages = (content: string, baseUrl: string): string => {
  // fix image URLs, if the img with data-src and src attributes,
  // and the src is not a valid URL, replace it with the data-src

  debugger;
  const weChatHost = "mp.weixin.qq.com";
  if (!baseUrl.includes(weChatHost)) {
    return content;
  }

  const dom = new JSDOM(content);
  const document = dom.window.document;
  const images = document.querySelectorAll("img");
  images.forEach((img) => {
    const dataSrc = img.getAttribute("data-src");
    const src = img.getAttribute("src");

    if (dataSrc && (!src || !src.startsWith("http"))) {
      img.setAttribute("src", new URL(dataSrc, baseUrl).href);
    }
  });
  return dom.serialize();
};
