import { NextRequest, NextResponse } from "next/server";
import craftApi from "../wechat-article-api";
import z from "zod";
import { WeChatArticleSchema } from "../schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 使用 Zod 校验请求数据
    const validationResult = WeChatArticleSchema.safeParse(body);

    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: "请求参数校验失败",
          details: errors,
        },
        { status: 400 }
      );
    }

    debugger;
    const articleData = validationResult.data;
    const result = await craftApi.postCraft(articleData);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API处理错误:", error);
    // 如果是 Zod 校验错误
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));

      return NextResponse.json(
        {
          error: "数据校验失败",
          details: errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "服务器内部错误" },
      { status: 500 }
    );
  }
}
