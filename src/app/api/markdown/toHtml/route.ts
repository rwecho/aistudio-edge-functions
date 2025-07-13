import { NextRequest, NextResponse } from "next/server";
import { renderToHtmlWithTheme } from "./markdown";

// POST 请求处理
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { markdown, options } = body;

    // 如果提供了选项，使用带主题的渲染函数
    const html = await renderToHtmlWithTheme(markdown, options);

    return NextResponse.json({
      success: true,
      html,
      type: "document",
    });

    // 返回结果
  } catch (error) {
    console.error("Markdown 转换错误:", error);
    return NextResponse.json(
      {
        success: false,
        error: "转换过程中发生错误",
        details: error instanceof Error ? error.message : "未知错误",
      },
      { status: 500 }
    );
  }
}
