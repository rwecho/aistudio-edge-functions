import { NextRequest, NextResponse } from "next/server";
import AzureTTSService, {
  VoiceName,
  VoiceStyle,
} from "@/app/services/azure-tts";
import { uploadToAliyun } from "@/app/services/aliyun";
import { v4 as uuidv4 } from "uuid";

// 文本长度限制
const MAX_TEXT_LENGTH = 5000;
const MIN_TEXT_LENGTH = 1;
const MAX_PREVIEW_TEXT_LENGTH = 200; // 预览文本长度限制

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      voiceName,
      style = "general",
      rate,
      pitch,
      volume,
      uploadToCloud = false,
      isPreview = false, // 新增预览模式参数
    } = body;

    // 参数验证
    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "文本参数是必需的且必须是字符串" },
        { status: 400 }
      );
    }

    // 根据是否是预览模式使用不同的文本长度限制
    const maxLength = isPreview ? MAX_PREVIEW_TEXT_LENGTH : MAX_TEXT_LENGTH;

    if (text.length < MIN_TEXT_LENGTH || text.length > maxLength) {
      return NextResponse.json(
        {
          error: `文本长度必须在 ${MIN_TEXT_LENGTH} 到 ${maxLength} 字符之间${
            isPreview ? "（预览模式）" : ""
          }`,
        },
        { status: 400 }
      );
    }

    if (!voiceName || typeof voiceName !== "string") {
      return NextResponse.json(
        { error: "语音名称参数是必需的" },
        { status: 400 }
      );
    }

    // 验证语音名称和风格
    const isValid = await AzureTTSService.validateVoiceAndStyle(
      voiceName,
      style
    );
    if (!isValid) {
      return NextResponse.json(
        { error: "不支持的语音名称或风格" },
        { status: 400 }
      );
    }

    // 创建TTS服务实例
    const ttsService = new AzureTTSService();

    // 合成语音
    const audioBuffer = await ttsService.synthesizeSpeech({
      text,
      voiceName: voiceName as VoiceName,
      style: style as VoiceStyle,
      rate,
      pitch,
      volume,
    });

    if (uploadToCloud && !isPreview) {
      // 上传到阿里云OSS（仅非预览模式）
      const fileName = `tts/${Date.now()}-${uuidv4()}.mp3`;
      await uploadToAliyun(audioBuffer, fileName);

      const fileUrl = `${process.env.ALIYUN_OSS_DOMAIN}/${fileName}`;

      return NextResponse.json({
        success: true,
        url: fileUrl,
        fileName,
        size: audioBuffer.length,
        voiceName,
        style,
        isPreview: false,
      });
    } else {
      // 直接返回音频文件（预览模式或不上传云端）
      const headers: Record<string, string> = {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
      };

      // 预览模式设置较短的缓存时间，完整模式可以下载
      headers[
        "Content-Disposition"
      ] = `attachment; filename="tts-${Date.now()}.mp3"`;

      return new NextResponse(audioBuffer, {
        status: 200,
        headers,
      });
    }
  } catch (error) {
    console.error("Azure TTS API 错误:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "内部服务器错误" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // 检查是否需要强制刷新缓存
    const url = new URL(request.url);
    const shouldRefresh = url.searchParams.get("refresh") === "true";

    if (shouldRefresh) {
      // 清除缓存
      AzureTTSService.clearCache();
    }

    // 返回支持的语音列表（会自动使用缓存或重新获取）
    const voices = await AzureTTSService.getSupportedVoices();

    return NextResponse.json({
      success: true,
      voices,
      totalCount: voices.length,
      fromCache: !shouldRefresh,
    });
  } catch (error) {
    console.error("获取语音列表错误:", error);

    return NextResponse.json({ error: "获取语音列表失败" }, { status: 500 });
  }
}
