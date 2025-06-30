# Azure Text-to-Speech API 使用指南

本项目集成了 Azure 认知服务的文本转语音 (TTS) 功能，可以根据文字、语音名称和情感等参数生成对应的语音文件。

## 功能特点

- 🎯 支持多种语音和语言（中文、英文等）
- 🎭 支持多种情感风格（开心、悲伤、愤怒等）
- ⚡ 支持语速、音调、音量调节
- 🌐 自动上传到阿里云 OSS 或直接返回音频文件
- 🎵 支持预览功能，快速试听效果

## 环境配置

### 1. Azure 语音服务配置

在 `.env.local` 文件中添加以下配置：

```env
# Azure Speech Services Configuration
AZURE_SPEECH_KEY=your_azure_speech_key_here
AZURE_SPEECH_REGION=your_azure_speech_region_here
```

### 2. 阿里云 OSS 配置（可选）

如果需要将生成的音频文件上传到云存储：

```env
# Aliyun OSS Configuration
ALIYUN_OSS_REGION=your_aliyun_oss_region
ALIYUN_OSS_ENDPOINT=your_aliyun_oss_endpoint
ALIYUN_OSS_ACCESS_KEY=your_aliyun_oss_access_key
ALIYUN_OSS_SECRET_KEY=your_aliyun_oss_secret_key
ALIYUN_OSS_BUCKET_NAME=your_aliyun_oss_bucket_name
ALIYUN_OSS_DOMAIN=your_aliyun_oss_domain
```

## API 接口

### 1. 获取支持的语音列表

```http
GET /api/azure-tts
```

**响应示例：**

```json
{
  "success": true,
  "voices": [
    {
      "name": "zh-CN-XiaoxiaoNeural",
      "language": "zh-CN",
      "gender": "Female",
      "styles": [
        "general",
        "assistant",
        "chat",
        "cheerful",
        "customerservice",
        "newscast",
        "affectionate",
        "angry",
        "calm",
        "fearful",
        "gentle",
        "lyrical",
        "sad"
      ]
    }
  ],
  "totalCount": 6
}
```

### 2. 文本转语音

```http
POST /api/azure-tts
```

**请求参数：**

```json
{
  "text": "要转换的文本",
  "voiceName": "zh-CN-XiaoxiaoNeural",
  "style": "cheerful",
  "rate": "medium",
  "pitch": "medium",
  "volume": "medium",
  "uploadToCloud": true
}
```

**参数说明：**

- `text` (必填): 要转换的文本，最大 5000 字符
- `voiceName` (必填): 语音名称，参考支持的语音列表
- `style` (可选): 情感风格，默认 "general"
- `rate` (可选): 语速，支持 "x-slow", "slow", "medium", "fast", "x-fast" 或百分比如 "+20%"
- `pitch` (可选): 音调，支持 "x-low", "low", "medium", "high", "x-high" 或相对值如 "+2st"
- `volume` (可选): 音量，支持 "silent", "x-soft", "soft", "medium", "loud", "x-loud" 或相对值如 "+6dB"
- `uploadToCloud` (可选): 是否上传到云存储，默认 true

**响应示例（上传到云存储）：**

```json
{
  "success": true,
  "url": "https://your-domain.com/tts/filename.mp3",
  "fileName": "tts/1234567890-uuid.mp3",
  "size": 12345,
  "voiceName": "zh-CN-XiaoxiaoNeural",
  "style": "cheerful"
}
```

**响应示例（直接返回音频）：**

```
Content-Type: audio/mpeg
Content-Length: 12345
Content-Disposition: attachment; filename="tts-1234567890.mp3"

[音频二进制数据]
```

### 3. 语音预览

```http
POST /api/azure-tts/preview
```

**请求参数：**

```json
{
  "text": "预览文本（可选，最大200字符）",
  "voiceName": "zh-CN-XiaoxiaoNeural",
  "style": "cheerful",
  "rate": "medium",
  "pitch": "medium",
  "volume": "medium"
}
```

**响应：**
直接返回音频文件，用于快速预览。

## 支持的语音

### 中文语音

- **zh-CN-XiaoxiaoNeural** (女声): 支持多种情感风格
- **zh-CN-YunxiNeural** (男声): 支持平静、恐惧、开心等风格
- **zh-CN-YunyangNeural** (男声): 支持客服、叙述等风格

### 英文语音

- **en-US-AriaNeural** (女声): 支持丰富的情感表达
- **en-US-JennyNeural** (女声): 适合助理和客服场景
- **en-US-GuyNeural** (男声): 适合新闻播报等场景

## 使用示例

### JavaScript/TypeScript 调用示例

```typescript
// 获取语音列表
const getVoices = async () => {
  const response = await fetch("/api/azure-tts");
  const data = await response.json();
  return data.voices;
};

// 生成语音文件
const generateSpeech = async (options: {
  text: string;
  voiceName: string;
  style?: string;
  rate?: string;
  pitch?: string;
  volume?: string;
}) => {
  const response = await fetch("/api/azure-tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...options,
      uploadToCloud: true,
    }),
  });

  const data = await response.json();
  return data;
};

// 预览语音
const previewSpeech = async (options: {
  text?: string;
  voiceName: string;
  style?: string;
}) => {
  const response = await fetch("/api/azure-tts/preview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(options),
  });

  if (response.ok) {
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    return audioUrl;
  }

  throw new Error("预览失败");
};
```

### cURL 调用示例

```bash
# 获取语音列表
curl -X GET http://localhost:3000/api/azure-tts

# 生成语音文件
curl -X POST http://localhost:3000/api/azure-tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "你好，这是一个测试。",
    "voiceName": "zh-CN-XiaoxiaoNeural",
    "style": "cheerful",
    "uploadToCloud": true
  }'

# 预览语音
curl -X POST http://localhost:3000/api/azure-tts/preview \
  -H "Content-Type: application/json" \
  -d '{
    "text": "预览文本",
    "voiceName": "zh-CN-XiaoxiaoNeural",
    "style": "cheerful"
  }' \
  --output preview.mp3
```

## 演示页面

访问 `/azure-tts-demo` 可以体验完整的 TTS 功能演示页面，包括：

- 语音选择和风格配置
- 实时参数调节
- 语音预览
- 完整音频生成
- 音频播放和下载

## 错误处理

API 会返回详细的错误信息，常见错误：

- `400`: 参数错误（文本为空、语音不支持等）
- `500`: 服务器错误（Azure 配置错误、网络问题等）

## 注意事项

1. 确保 Azure 语音服务的配额充足
2. 文本长度限制：预览 200 字符，完整生成 5000 字符
3. 生成的音频文件为 MP3 格式，16kHz 32kbps
4. 上传到云存储的文件会自动生成唯一文件名

## 技术架构

- **前端**: Next.js + React + TypeScript
- **后端**: Next.js API Routes
- **TTS 服务**: Azure 认知服务
- **存储**: 阿里云 OSS
- **音频格式**: MP3 (16kHz 32kbps)
