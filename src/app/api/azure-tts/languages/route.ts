import { NextRequest, NextResponse } from "next/server";
import AzureTTSService from "@/app/services/azure-tts";

export async function GET(request: NextRequest) {
  try {
    // 检查是否需要强制刷新缓存
    const url = new URL(request.url);
    const shouldRefresh = url.searchParams.get("refresh") === "true";

    if (shouldRefresh) {
      // 清除缓存
      AzureTTSService.clearCache();
    }

    // 从Azure SDK动态获取支持的语言列表
    const languages = await AzureTTSService.getSupportedLanguages();

    return NextResponse.json({
      success: true,
      languages,
      totalCount: languages.length,
      fromCache: !shouldRefresh,
    });
  } catch (error) {
    console.error("获取语言列表错误:", error);

    return NextResponse.json({ error: "获取语言列表失败" }, { status: 500 });
  }
}
