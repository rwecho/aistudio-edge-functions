import * as sdk from "microsoft-cognitiveservices-speech-sdk";

// 动态获取的语音信息接口
export interface VoiceInfo {
  name: string;
  language: string;
  languageName: string;
  gender: "Male" | "Female" | "Unknown";
  displayName: string;
  description: string;
  styles: string[];
  locale: string;
  shortName: string;
  voiceType: string;
  status: string;
  wordPerMinute?: string;
}

// 语言信息接口
export interface LanguageInfo {
  code: string;
  name: string;
  displayName: string;
}

export type VoiceName = string;
export type VoiceStyle = string;

export interface TTSOptions {
  text: string;
  voiceName: VoiceName;
  style?: VoiceStyle;
  rate?: string; // 语速: x-slow, slow, medium, fast, x-fast 或百分比如 "+20%"
  pitch?: string; // 音调: x-low, low, medium, high, x-high 或相对值如 "+2st"
  volume?: string; // 音量: silent, x-soft, soft, medium, loud, x-loud 或相对值如 "+6dB"
  outputFormat?: sdk.SpeechSynthesisOutputFormat;
}

export class AzureTTSService {
  private speechConfig: sdk.SpeechConfig;
  private static voicesCache: VoiceInfo[] | null = null;
  private static cacheExpiry: number = 0;
  private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存

  constructor() {
    const subscriptionKey = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!subscriptionKey || !region) {
      throw new Error(
        "Azure Speech 配置不完整，请检查环境变量 AZURE_SPEECH_KEY 和 AZURE_SPEECH_REGION"
      );
    }

    this.speechConfig = sdk.SpeechConfig.fromSubscription(
      subscriptionKey,
      region
    );
  }

  /**
   * 从Azure SDK获取所有可用的语音
   */
  static async getVoicesFromAzure(): Promise<VoiceInfo[]> {
    // 检查缓存
    if (this.voicesCache && Date.now() < this.cacheExpiry) {
      return this.voicesCache;
    }

    const subscriptionKey = process.env.AZURE_SPEECH_KEY;
    const region = process.env.AZURE_SPEECH_REGION;

    if (!subscriptionKey || !region) {
      throw new Error(
        "Azure Speech 配置不完整，请检查环境变量 AZURE_SPEECH_KEY 和 AZURE_SPEECH_REGION"
      );
    }

    return new Promise((resolve, reject) => {
      const speechConfig = sdk.SpeechConfig.fromSubscription(
        subscriptionKey,
        region
      );
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig);

      synthesizer.getVoicesAsync().then(
        (result: sdk.SynthesisVoicesResult) => {
          if (result.reason === sdk.ResultReason.VoicesListRetrieved) {
            const voices: VoiceInfo[] = result.voices.map(
              (voice: sdk.VoiceInfo) => {
                // 解析语音样式（从voice的StyleList中获取）
                const styles = (voice as any).styleList || ["general"];

                // 解析语言名称
                const languageName = this.getLanguageDisplayName(voice.locale);

                return {
                  name: voice.name,
                  language: voice.locale,
                  languageName,
                  gender:
                    voice.gender === sdk.SynthesisVoiceGender.Female
                      ? "Female"
                      : voice.gender === sdk.SynthesisVoiceGender.Male
                      ? "Male"
                      : "Unknown",
                  displayName: voice.localName || voice.shortName,
                  description: this.generateDescription(voice),
                  styles,
                  locale: voice.locale,
                  shortName: voice.shortName,
                  voiceType:
                    (voice as any).voiceType === 1 ? "Neural" : "Standard", // 1 = Neural
                  status: "Available",
                  wordPerMinute: (voice as any).wordsPerMinute?.toString(),
                };
              }
            );

            // 缓存结果
            this.voicesCache = voices;
            this.cacheExpiry = Date.now() + this.CACHE_DURATION;

            synthesizer.close();
            resolve(voices);
          } else {
            const error = `获取语音列表失败: ${result.reason}`;
            console.error(error);
            synthesizer.close();
            reject(new Error(error));
          }
        },
        (error: string) => {
          console.error("获取语音列表错误:", error);
          synthesizer.close();
          reject(new Error(error));
        }
      );
    });
  }

  /**
   * 生成语音描述
   */
  private static generateDescription(voice: sdk.VoiceInfo): string {
    const genderText =
      voice.gender === sdk.SynthesisVoiceGender.Female ? "女声" : "男声";
    const typeText = (voice as any).voiceType === 1 ? "神经语音" : "标准语音"; // 1 = Neural
    return `${genderText}，${typeText}`;
  }

  /**
   * 获取语言显示名称
   */
  private static getLanguageDisplayName(locale: string): string {
    const languageMap: Record<string, string> = {
      "zh-CN": "中文（简体）",
      "zh-TW": "中文（繁体-台湾）",
      "zh-HK": "中文（繁体-香港）",
      "en-US": "英语（美国）",
      "en-GB": "英语（英国）",
      "en-AU": "英语（澳大利亚）",
      "en-CA": "英语（加拿大）",
      "en-IN": "英语（印度）",
      "ja-JP": "日语",
      "ko-KR": "韩语",
      "fr-FR": "法语",
      "fr-CA": "法语（加拿大）",
      "de-DE": "德语",
      "es-ES": "西班牙语（西班牙）",
      "es-MX": "西班牙语（墨西哥）",
      "es-US": "西班牙语（美国）",
      "it-IT": "意大利语",
      "pt-BR": "葡萄牙语（巴西）",
      "pt-PT": "葡萄牙语（葡萄牙）",
      "ru-RU": "俄语",
      "ar-SA": "阿拉伯语（沙特）",
      "ar-EG": "阿拉伯语（埃及）",
      "hi-IN": "印地语（印度）",
      "th-TH": "泰语",
      "vi-VN": "越南语",
      "id-ID": "印尼语",
      "ms-MY": "马来语",
      "tr-TR": "土耳其语",
      "pl-PL": "波兰语",
      "nl-NL": "荷兰语",
      "da-DK": "丹麦语",
      "sv-SE": "瑞典语",
      "no-NO": "挪威语",
      "fi-FI": "芬兰语",
      "cs-CZ": "捷克语",
      "hu-HU": "匈牙利语",
      "ro-RO": "罗马尼亚语",
      "bg-BG": "保加利亚语",
      "hr-HR": "克罗地亚语",
      "sk-SK": "斯洛伐克语",
      "sl-SI": "斯洛文尼亚语",
      "et-EE": "爱沙尼亚语",
      "lv-LV": "拉脱维亚语",
      "lt-LT": "立陶宛语",
      "mt-MT": "马耳他语",
      "ga-IE": "爱尔兰语",
      "cy-GB": "威尔士语",
    };

    return languageMap[locale] || locale;
  }

  /**
   * 生成SSML格式的文本
   */
  private async generateSSML(options: TTSOptions): Promise<string> {
    const { text, voiceName, style = "general", rate, pitch, volume } = options;

    // 从语音名称中提取语言代码
    const languageMatch = voiceName.match(/^([a-z]{2}-[A-Z]{2})/);
    const language = languageMatch ? languageMatch[1] : "en-US";

    // 获取语音信息以检查是否支持指定的style
    const voiceInfo = await AzureTTSService.getVoiceInfo(voiceName);
    const supportsStyle = voiceInfo && voiceInfo.styles.includes(style);
    const shouldUseStyle = style && style !== "general" && supportsStyle;

    let ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis"`;
    if (shouldUseStyle) {
      ssml += ` xmlns:mstts="https://www.w3.org/2001/mstts"`;
    }
    ssml += ` xml:lang="${language}">`;
    ssml += `<voice name="${voiceName}">`;

    // 如果支持指定的风格，使用mstts:express-as
    if (shouldUseStyle) {
      ssml += `<mstts:express-as style="${style}">`;
    }

    // 如果指定了语速、音调或音量，使用prosody
    if (rate || pitch || volume) {
      ssml += `<prosody`;
      if (rate) ssml += ` rate="${rate}"`;
      if (pitch) ssml += ` pitch="${pitch}"`;
      if (volume) ssml += ` volume="${volume}"`;
      ssml += `>`;
    }

    // 转义文本中的特殊字符
    const escapedText = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

    ssml += escapedText;

    // 关闭标签
    if (rate || pitch || volume) {
      ssml += `</prosody>`;
    }

    if (shouldUseStyle) {
      ssml += `</mstts:express-as>`;
    }

    ssml += `</voice></speak>`;

    return ssml;
  }

  /**
   * 文本转语音
   */
  async synthesizeSpeech(options: TTSOptions): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // 设置输出格式
        this.speechConfig.speechSynthesisOutputFormat =
          options.outputFormat ||
          sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

        // 生成SSML
        const ssml = await this.generateSSML(options);
        console.log("Generated SSML:", ssml);

        // 创建语音合成器
        const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, null);

        synthesizer.speakSsmlAsync(
          ssml,
          (result) => {
            if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
              const audioData = Buffer.from(result.audioData);
              synthesizer.close();
              resolve(audioData);
            } else {
              const error = `语音合成失败: ${result.reason}`;
              console.error(error, result.errorDetails);
              synthesizer.close();
              reject(new Error(error));
            }
          },
          (error) => {
            console.error("语音合成错误:", error);
            synthesizer.close();
            reject(error);
          }
        );
      } catch (error) {
        console.error("生成SSML时出错:", error);
        reject(error);
      }
    });
  }

  /**
   * 获取支持的语音列表
   */
  static async getSupportedVoices(): Promise<VoiceInfo[]> {
    return await this.getVoicesFromAzure();
  }

  /**
   * 按语言分组获取语音列表
   */
  static async getVoicesByLanguage(): Promise<Record<string, VoiceInfo[]>> {
    const voices = await this.getVoicesFromAzure();
    const voicesByLanguage: Record<string, VoiceInfo[]> = {};

    voices.forEach((voice) => {
      if (!voicesByLanguage[voice.language]) {
        voicesByLanguage[voice.language] = [];
      }
      voicesByLanguage[voice.language].push(voice);
    });

    return voicesByLanguage;
  }

  /**
   * 获取支持的语言列表
   */
  static async getSupportedLanguages(): Promise<LanguageInfo[]> {
    const voices = await this.getVoicesFromAzure();
    const languagesSet = new Set<string>();
    const languageInfoMap: Record<string, LanguageInfo> = {};

    voices.forEach((voice) => {
      if (!languagesSet.has(voice.language)) {
        languagesSet.add(voice.language);
        languageInfoMap[voice.language] = {
          code: voice.language,
          name: voice.languageName,
          displayName: voice.languageName,
        };
      }
    });

    return Object.values(languageInfoMap).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  /**
   * 根据语言获取语音列表
   */
  static async getVoicesByLanguageCode(
    languageCode: string
  ): Promise<VoiceInfo[]> {
    const voices = await this.getVoicesFromAzure();
    return voices.filter((voice) => voice.language === languageCode);
  }

  /**
   * 验证语音名称和风格是否支持
   */
  static async validateVoiceAndStyle(
    voiceName: string,
    style?: string
  ): Promise<boolean> {
    try {
      const voices = await this.getVoicesFromAzure();
      const voice = voices.find((v) => v.name === voiceName);

      if (!voice) return false;

      // 如果没有指定style或者style是general，总是允许
      if (!style || style === "general") return true;

      // 如果指定了style但语音不支持，我们仍然允许（会忽略style）
      // 这样可以避免因为style不支持而完全失败
      return true;
    } catch (error) {
      console.error("验证语音时出错:", error);
      return false;
    }
  }

  /**
   * 根据语音名称获取语音信息
   */
  static async getVoiceInfo(voiceName: string): Promise<VoiceInfo | null> {
    try {
      const voices = await this.getVoicesFromAzure();
      return voices.find((v) => v.name === voiceName) || null;
    } catch (error) {
      console.error("获取语音信息时出错:", error);
      return null;
    }
  }

  /**
   * 搜索语音
   */
  static async searchVoices(query: string): Promise<VoiceInfo[]> {
    try {
      const voices = await this.getVoicesFromAzure();
      const lowerQuery = query.toLowerCase();

      return voices.filter(
        (voice) =>
          voice.name.toLowerCase().includes(lowerQuery) ||
          voice.displayName.toLowerCase().includes(lowerQuery) ||
          voice.languageName.toLowerCase().includes(lowerQuery) ||
          voice.description.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error("搜索语音时出错:", error);
      return [];
    }
  }

  /**
   * 清除缓存
   */
  static clearCache(): void {
    this.voicesCache = null;
    this.cacheExpiry = 0;
  }
}

export default AzureTTSService;
