import { NextResponse } from "next/server";

// API 状态检查端点
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "Markdown to HTML API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      convert: "/api/markdown/toHtml",
      demo: "/markdown-demo",
    },
    features: [
      "GitHub Flavored Markdown",
      "Syntax Highlighting",
      "Responsive Tables",
      "External Link Safety",
      "Custom CSS Support",
      "Full Document Mode",
      "CORS Support",
    ],
    limits: {
      maxContentSize: "1MB",
      supportedMethods: ["GET", "POST", "OPTIONS"],
    },
  });
}
