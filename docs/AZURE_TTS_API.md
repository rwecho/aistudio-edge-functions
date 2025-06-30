# Azure TTS API 接口文档

Azure Text-to-Speech API 提供了完整的语音合成功能，支持多种语言和语音角色。

## API 接口列表

### 1. 获取支持的语言列表

**接口地址:** `GET /api/azure-tts/languages`

**功能:** 获取所有支持的语言列表

**响应示例:**

```json
{
  "success": true,
  "languages": [
    {
      "code": "zh-CN",
      "name": "中文（简体）"
    },
    {
      "code": "zh-TW",
      "name": "中文（繁体-台湾）"
    },
    {
      "code": "en-US",
      "name": "英语（美国）"
    }
  ],
  "totalCount": 22
}
```

### 2. 获取所有语音列表

**接口地址:** `GET /api/azure-tts`

**功能:** 获取所有支持的语音详细信息

**响应示例:**

```json
{
  "success": true,
  "voices": [
    {
      "name": "zh-CN-XiaoxiaoNeural",
      "language": "zh-CN",
      "languageName": "中文（简体）",
      "gender": "Female",
      "displayName": "晓晓",
      "description": "通用女声，支持多种情感风格",
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
  "totalCount": 50
}
```

### 3. 按语言分组获取语音

**接口地址:** `GET /api/azure-tts/voices-by-language`

**功能:** 按语言分组获取语音列表

**查询参数:**

- `language` (可选): 指定语言代码，如 `zh-CN`

**响应示例（所有语言）:**

```json
{
  "success": true,
  "voicesByLanguage": {
    "zh-CN": [
      {
        "name": "zh-CN-XiaoxiaoNeural",
        "gender": "Female",
        "displayName": "晓晓",
        "description": "通用女声，支持多种情感风格",
        "styles": ["general", "assistant", "chat", "cheerful"],
        "languageName": "中文（简体）"
      }
    ]
  },
  "languages": ["zh-CN", "zh-TW", "en-US"],
  "totalLanguages": 22,
  "totalVoices": 50
}
```

**响应示例（指定语言）:**

```json
{
  "success": true,
  "language": "zh-CN",
  "voices": [
    {
      "name": "zh-CN-XiaoxiaoNeural",
      "gender": "Female",
      "displayName": "晓晓",
      "description": "通用女声，支持多种情感风格",
      "styles": ["general", "assistant", "chat"],
      "languageName": "中文（简体）"
    }
  ],
  "totalCount": 5
}
```

### 4. 文本转语音

**接口地址:** `POST /api/azure-tts`

**功能:** 将文本转换为语音文件

**请求参数:**

```json
{
  "text": "要转换的文本（必填，最大5000字符）",
  "voiceName": "语音名称（必填）",
  "style": "情感风格（可选，默认 general）",
  "rate": "语速（可选，默认 medium）",
  "pitch": "音调（可选，默认 medium）",
  "volume": "音量（可选，默认 medium）",
  "uploadToCloud": "是否上传到云存储（可选，默认 true）"
}
```

**响应示例（上传到云存储）:**

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

### 5. 语音预览

**接口地址:** `POST /api/azure-tts/preview`

**功能:** 快速预览语音效果（限制 200 字符）

**请求参数:**

```json
{
  "text": "预览文本（可选，最大200字符）",
  "voiceName": "语音名称（必填）",
  "style": "情感风格（可选）",
  "rate": "语速（可选）",
  "pitch": "音调（可选）",
  "volume": "音量（可选）"
}
```

**响应:** 直接返回 MP3 音频文件

## 支持的语言和语音

### 中文语音

| 语音名称             | 显示名称 | 性别 | 支持风格  | 描述                   |
| -------------------- | -------- | ---- | --------- | ---------------------- |
| zh-CN-XiaoxiaoNeural | 晓晓     | 女   | 13 种风格 | 通用女声，支持多种情感 |
| zh-CN-YunxiNeural    | 云希     | 男   | 8 种风格  | 通用男声，适合多种场景 |
| zh-CN-YunyangNeural  | 云扬     | 男   | 4 种风格  | 专业男声，适合客服播报 |
| zh-CN-YunxiaNeural   | 云夏     | 男   | 1 种风格  | 青年男声               |
| zh-CN-XiaohanNeural  | 晓涵     | 女   | 5 种风格  | 温和女声               |

### 繁体中文语音

| 语音名称            | 显示名称 | 性别 | 地区 |
| ------------------- | -------- | ---- | ---- |
| zh-TW-HsiaoyuNeural | 曉雨     | 女   | 台湾 |
| zh-TW-YunJheNeural  | 雲哲     | 男   | 台湾 |
| zh-HK-HiuMaanNeural | 曉曼     | 女   | 香港 |
| zh-HK-WanLungNeural | 雲龍     | 男   | 香港 |

### 英语语音

| 语音名称            | 显示名称 | 性别 | 地区     | 支持风格  |
| ------------------- | -------- | ---- | -------- | --------- |
| en-US-AriaNeural    | Aria     | 女   | 美国     | 16 种风格 |
| en-US-JennyNeural   | Jenny    | 女   | 美国     | 16 种风格 |
| en-US-GuyNeural     | Guy      | 男   | 美国     | 13 种风格 |
| en-US-DavisNeural   | Davis    | 男   | 美国     | 2 种风格  |
| en-US-AmberNeural   | Amber    | 女   | 美国     | 1 种风格  |
| en-GB-SoniaNeural   | Sonia    | 女   | 英国     | 3 种风格  |
| en-GB-RyanNeural    | Ryan     | 男   | 英国     | 2 种风格  |
| en-AU-NatashaNeural | Natasha  | 女   | 澳大利亚 | 1 种风格  |
| en-AU-WilliamNeural | William  | 男   | 澳大利亚 | 1 种风格  |

### 其他语言语音

| 语言             | 语音数量 | 语言代码 |
| ---------------- | -------- | -------- |
| 日语             | 2 个     | ja-JP    |
| 韩语             | 2 个     | ko-KR    |
| 法语             | 2 个     | fr-FR    |
| 德语             | 2 个     | de-DE    |
| 西班牙语         | 2 个     | es-ES    |
| 意大利语         | 2 个     | it-IT    |
| 俄语             | 2 个     | ru-RU    |
| 葡萄牙语（巴西） | 2 个     | pt-BR    |
| 阿拉伯语         | 2 个     | ar-SA    |
| 印度语           | 2 个     | hi-IN    |
| 泰语             | 2 个     | th-TH    |
| 越南语           | 2 个     | vi-VN    |
| 印尼语           | 2 个     | id-ID    |
| 马来语           | 2 个     | ms-MY    |

## 支持的情感风格

### 通用风格

- `general`: 通用/标准
- `chat`: 聊天/对话
- `assistant`: 助理
- `customerservice`: 客服
- `newscast`: 新闻播报

### 情感风格

- `cheerful`: 开心/愉快
- `sad`: 悲伤
- `angry`: 愤怒
- `calm`: 平静
- `fearful`: 恐惧
- `gentle`: 温柔
- `hopeful`: 充满希望
- `friendly`: 友好
- `excited`: 兴奋
- `empathetic`: 同情/理解

### 语调风格

- `whispering`: 耳语
- `shouting`: 大声
- `terrified`: 恐怖
- `unfriendly`: 不友好
- `lyrical`: 抒情
- `affectionate`: 深情

### 专业风格

- `serious`: 严肃
- `depressed`: 沮丧
- `narration-relaxed`: 轻松叙述

## 参数说明

### 语速 (rate)

- `x-slow`: 非常慢
- `slow`: 慢
- `medium`: 正常（默认）
- `fast`: 快
- `x-fast`: 非常快
- 或百分比值，如 `+20%`、`-10%`

### 音调 (pitch)

- `x-low`: 非常低
- `low`: 低
- `medium`: 正常（默认）
- `high`: 高
- `x-high`: 非常高
- 或相对值，如 `+2st`、`-1st`

### 音量 (volume)

- `silent`: 静音
- `x-soft`: 非常小
- `soft`: 小
- `medium`: 正常（默认）
- `loud`: 大
- `x-loud`: 非常大
- 或相对值，如 `+6dB`、`-3dB`

## 使用示例

### JavaScript/TypeScript

```typescript
// 获取语言列表
const languages = await fetch("/api/azure-tts/languages").then((r) => r.json());

// 获取中文语音
const chineseVoices = await fetch(
  "/api/azure-tts/voices-by-language?language=zh-CN"
).then((r) => r.json());

// 生成语音
const result = await fetch("/api/azure-tts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    text: "你好，欢迎使用Azure TTS服务！",
    voiceName: "zh-CN-XiaoxiaoNeural",
    style: "cheerful",
    rate: "medium",
  }),
});
```

### cURL

```bash
# 获取语言列表
curl http://localhost:3000/api/azure-tts/languages

# 获取中文语音
curl http://localhost:3000/api/azure-tts/voices-by-language?language=zh-CN

# 生成语音
curl -X POST http://localhost:3000/api/azure-tts \
  -H "Content-Type: application/json" \
  -d '{
    "text": "你好，世界！",
    "voiceName": "zh-CN-XiaoxiaoNeural",
    "style": "cheerful"
  }'
```

## 演示页面

- `/azure-tts-demo`: TTS 功能演示页面
- `/azure-tts-languages`: 支持的语言和语音列表页面

## 注意事项

1. 需要配置 Azure Speech 服务的 API 密钥和区域
2. 文本长度限制：预览 200 字符，完整生成 5000 字符
3. 生成的音频格式为 MP3，16kHz 32kbps
4. 支持上传到阿里云 OSS 或直接返回音频文件
5. 不是所有语音都支持所有情感风格，请参考具体语音的 styles 列表
