import { NextRequest, NextResponse } from "next/server";
import AzureTTSService, {
  VoiceName,
  VoiceStyle,
} from "@/app/services/azure-tts";

// 预览文本长度限制（较短）
const MAX_PREVIEW_TEXT_LENGTH = 200;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text = "这是一个语音预览示例。",
      voiceName,
      style = "general",
      rate,
      pitch,
      volume,
    } = body;

    // 参数验证
    if (!voiceName || typeof voiceName !== "string") {
      return NextResponse.json(
        { error: "语音名称参数是必需的" },
        { status: 400 }
      );
    }

    if (text.length > MAX_PREVIEW_TEXT_LENGTH) {
      return NextResponse.json(
        { error: `预览文本长度不能超过 ${MAX_PREVIEW_TEXT_LENGTH} 字符` },
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

    // 直接返回音频数据，用于预览
    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.length.toString(),
        "Cache-Control": "public, max-age=300", // 缓存5分钟
      },
    });
  } catch (error) {
    console.error("Azure TTS 预览 API 错误:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ error: "内部服务器错误" }, { status: 500 });
  }
}
