import { NextRequest, NextResponse } from "next/server";
import AzureTTSService from "@/app/services/azure-tts";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get("language");
    const shouldRefresh = searchParams.get("refresh") === "true";

    if (shouldRefresh) {
      // 清除缓存
      AzureTTSService.clearCache();
    }

    if (language) {
      // 如果指定了语言，只返回该语言的语音
      const languageVoices = await AzureTTSService.getVoicesByLanguageCode(
        language
      );

      if (languageVoices.length === 0) {
        return NextResponse.json(
          { error: "不支持的语言代码或该语言暂无可用语音" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        language,
        voices: languageVoices,
        totalCount: languageVoices.length,
        fromCache: !shouldRefresh,
      });
    } else {
      // 返回所有语言的语音列表
      const voicesByLanguage = await AzureTTSService.getVoicesByLanguage();
      const languages = Object.keys(voicesByLanguage);
      const totalVoices = Object.values(voicesByLanguage).reduce(
        (acc, voices) => acc + voices.length,
        0
      );

      return NextResponse.json({
        success: true,
        voicesByLanguage,
        languages,
        totalLanguages: languages.length,
        totalVoices,
        fromCache: !shouldRefresh,
      });
    }
  } catch (error) {
    console.error("获取分组语音列表错误:", error);

    return NextResponse.json(
      { error: "获取分组语音列表失败" },
      { status: 500 }
    );
  }
}
