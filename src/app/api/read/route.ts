import { NextRequest, NextResponse } from "next/server";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";

async function processUrl(url: string) {
  if (!url) {
    throw new Error("URL is required");
  }

  const response = await fetch(url);
  const html = await response.text();

  console.log("Fetched HTML:", html);

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

  return article;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    const article = await processUrl(url || "");
    return NextResponse.json({ data: article });
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
    const article = await processUrl(url);
    return NextResponse.json({ data: article });
  } catch (error: any) {
    console.error("Error processing URL:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process URL" },
      { status: error.message === "URL is required" ? 400 : 500 }
    );
  }
}
