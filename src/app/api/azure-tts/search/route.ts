import { NextRequest, NextResponse } from "next/server";
import AzureTTSService from "@/app/services/azure-tts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "搜索查询参数 'q' 是必需的" },
        { status: 400 }
      );
    }

    // 搜索语音
    const voices = await AzureTTSService.searchVoices(query.trim());

    return NextResponse.json({
      success: true,
      query: query.trim(),
      voices,
      totalCount: voices.length,
    });
  } catch (error) {
    console.error("搜索语音错误:", error);

    return NextResponse.json({ error: "搜索语音失败" }, { status: 500 });
  }
}
