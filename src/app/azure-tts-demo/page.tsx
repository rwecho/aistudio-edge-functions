"use client";

import { useState, useEffect } from "react";

interface VoiceInfo {
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
}

interface LanguageInfo {
  code: string;
  name: string;
  displayName: string;
}

export default function AzureTTSDemo() {
  const [text, setText] = useState(
    "Hello, this is a test of Azure Text-to-Speech service with dynamic voice detection."
  );
  const [voices, setVoices] = useState<VoiceInfo[]>([]);
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("general");
  const [rate, setRate] = useState("medium");
  const [pitch, setPitch] = useState("medium");
  const [volume, setVolume] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVoices, setFilteredVoices] = useState<VoiceInfo[]>([]);

  // 获取语音列表和语言列表
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 获取语音列表
        const voicesResponse = await fetch("/api/azure-tts");
        const voicesData = await voicesResponse.json();

        // 获取语言列表
        const languagesResponse = await fetch("/api/azure-tts/languages");
        const languagesData = await languagesResponse.json();

        if (voicesData.success && languagesData.success) {
          setVoices(voicesData.voices);
          setLanguages(languagesData.languages);
          setFilteredVoices(voicesData.voices);

          if (languagesData.languages.length > 0) {
            // 默认选择中文
            const defaultLanguage =
              languagesData.languages.find(
                (lang: LanguageInfo) => lang.code === "zh-CN"
              ) || languagesData.languages[0];
            setSelectedLanguage(defaultLanguage.code);

            // 根据选择的语言过滤语音
            const voicesForLanguage = voicesData.voices.filter(
              (v: VoiceInfo) => v.language === defaultLanguage.code
            );

            if (voicesForLanguage.length > 0) {
              // 默认选择女声
              const defaultVoice =
                voicesForLanguage.find(
                  (v: VoiceInfo) => v.gender === "Female"
                ) || voicesForLanguage[0];
              setSelectedVoice(defaultVoice.name);

              // 设置默认风格
              if (defaultVoice.styles && defaultVoice.styles.length > 0) {
                setSelectedStyle(defaultVoice.styles[0]);
              } else {
                setSelectedStyle("general");
              }
            }
          }
        } else {
          setError("获取数据失败");
        }
      } catch (error) {
        console.error("获取数据失败:", error);
        setError("网络错误");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 根据选择的语言和搜索条件过滤语音
  useEffect(() => {
    let filtered = voices;

    // 按语言过滤
    if (selectedLanguage) {
      filtered = filtered.filter(
        (voice) => voice.language === selectedLanguage
      );
    }

    // 按搜索条件过滤
    if (searchQuery.trim() !== "") {
      filtered = filtered.filter(
        (voice) =>
          voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          voice.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          voice.languageName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          voice.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredVoices(filtered);

    // 如果当前选择的语音不在过滤结果中，重置选择
    if (selectedVoice && !filtered.find((v) => v.name === selectedVoice)) {
      if (filtered.length > 0) {
        const newVoice = filtered[0];
        setSelectedVoice(newVoice.name);

        // 重置风格
        if (newVoice.styles && newVoice.styles.length > 0) {
          setSelectedStyle(newVoice.styles[0]);
        } else {
          setSelectedStyle("general");
        }
      } else {
        setSelectedVoice("");
        setSelectedStyle("general");
      }
    }
  }, [selectedLanguage, searchQuery, voices, selectedVoice]);

  // 预览语音
  const handlePreview = async () => {
    if (!selectedVoice) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/azure-tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text.slice(0, 200), // 限制预览文本长度
          voiceName: selectedVoice,
          style: selectedStyle,
          rate: rate !== "medium" ? rate : undefined,
          pitch: pitch !== "medium" ? pitch : undefined,
          volume: volume !== "medium" ? volume : undefined,
          isPreview: true, // 标记为预览模式
          uploadToCloud: false, // 预览不上传到云端
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "预览失败");
      }
    } catch (error) {
      setError("网络错误");
      console.error("预览错误:", error);
    } finally {
      setLoading(false);
    }
  };

  // 生成完整音频
  const handleGenerate = async () => {
    if (!selectedVoice || !text.trim()) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/azure-tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          voiceName: selectedVoice,
          style: selectedStyle,
          rate: rate !== "medium" ? rate : undefined,
          pitch: pitch !== "medium" ? pitch : undefined,
          volume: volume !== "medium" ? volume : undefined,
          uploadToCloud: false,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAudioUrl(data.url);
      } else {
        setError(data.error || "生成失败");
      }
    } catch (error) {
      setError("网络错误");
      console.error("生成错误:", error);
    } finally {
      setLoading(false);
    }
  };

  // 刷新语音缓存
  const handleRefreshCache = async () => {
    try {
      setLoading(true);

      // 重新获取语音列表（服务端会自动检查缓存是否过期）
      const voicesResponse = await fetch("/api/azure-tts?refresh=true");
      const voicesData = await voicesResponse.json();

      // 重新获取语言列表
      const languagesResponse = await fetch(
        "/api/azure-tts/languages?refresh=true"
      );
      const languagesData = await languagesResponse.json();

      if (voicesData.success && languagesData.success) {
        setVoices(voicesData.voices);
        setFilteredVoices(voicesData.voices);
        setLanguages(languagesData.languages);
        alert("缓存已刷新！");
      } else {
        setError("刷新缓存失败");
      }
    } catch (error) {
      setError("网络错误");
      console.error("刷新缓存错误:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentVoice = voices.find((v) => v.name === selectedVoice);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Azure TTS 动态语音演示
          </h1>
          <p className="text-gray-600 mb-4">
            通过Azure SDK动态获取支持的语言、语音和情感风格
          </p>

          {/* 快速语言切换 */}
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            {[
              "zh-CN",
              "en-US",
              "ja-JP",
              "ko-KR",
              "fr-FR",
              "de-DE",
              "es-ES",
            ].map((langCode) => {
              const lang = languages.find((l) => l.code === langCode);
              if (!lang) return null;

              return (
                <button
                  key={langCode}
                  onClick={() => setSelectedLanguage(langCode)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    selectedLanguage === langCode
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {lang.name}
                </button>
              );
            })}
            <button
              onClick={() => setSelectedLanguage("")}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedLanguage === ""
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              全部
            </button>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={handleRefreshCache}
              disabled={loading}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-400"
            >
              刷新语音缓存
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* 文本输入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              输入文本 (最大5000字符)
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
              maxLength={5000}
              placeholder="输入要转换为语音的文本..."
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {text.length}/5000
            </div>
          </div>

          {/* 语言和语音搜索 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择语言
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                aria-label="选择语言"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">所有语言</option>
                {languages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.name} ({language.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                搜索语音
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="按语音名称、显示名称或描述搜索..."
              />
            </div>
          </div>

          {/* 语音选择 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择语音 ({filteredVoices.length} 个可用)
                {selectedLanguage && (
                  <span className="ml-2 text-blue-600">
                    - {languages.find((l) => l.code === selectedLanguage)?.name}
                  </span>
                )}
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => {
                  setSelectedVoice(e.target.value);
                  // 找到新选择的语音
                  const newVoice = filteredVoices.find(
                    (v) => v.name === e.target.value
                  );
                  // 如果新语音有styles，使用第一个，否则使用general
                  if (
                    newVoice &&
                    newVoice.styles &&
                    newVoice.styles.length > 0
                  ) {
                    setSelectedStyle(newVoice.styles[0]);
                  } else {
                    setSelectedStyle("general");
                  }
                }}
                aria-label="选择语音"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 max-h-40 overflow-y-auto"
                size={Math.min(filteredVoices.length, 10)}
              >
                {filteredVoices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.displayName} ({voice.gender}, {voice.voiceType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择风格
              </label>
              <select
                value={selectedStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                aria-label="选择风格"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                {(currentVoice?.styles || ["general"]).map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 当前语音信息 */}
          {currentVoice && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">
                当前选择的语音:
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium">名称:</span>
                  {currentVoice.displayName}
                </div>
                <div>
                  <span className="font-medium">语言:</span>
                  {currentVoice.languageName}
                </div>
                <div>
                  <span className="font-medium">性别:</span>
                  {currentVoice.gender === "Female" ? "女声" : "男声"}
                </div>
                <div>
                  <span className="font-medium">类型:</span>
                  {currentVoice.voiceType}
                </div>
              </div>
              <div className="mt-2">
                <span className="font-medium">描述:</span>
                {currentVoice.description}
              </div>
              <div className="mt-2">
                <span className="font-medium">支持风格:</span>
                <span className="text-blue-700">
                  {currentVoice.styles.join(", ")}
                </span>
              </div>
            </div>
          )}

          {/* 语音参数 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                语速
              </label>
              <select
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                aria-label="选择语速"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="x-slow">非常慢</option>
                <option value="slow">慢</option>
                <option value="medium">正常</option>
                <option value="fast">快</option>
                <option value="x-fast">非常快</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                音调
              </label>
              <select
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
                aria-label="选择音调"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="x-low">非常低</option>
                <option value="low">低</option>
                <option value="medium">正常</option>
                <option value="high">高</option>
                <option value="x-high">非常高</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                音量
              </label>
              <select
                value={volume}
                onChange={(e) => setVolume(e.target.value)}
                aria-label="选择音量"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="x-soft">非常小</option>
                <option value="soft">小</option>
                <option value="medium">正常</option>
                <option value="loud">大</option>
                <option value="x-loud">非常大</option>
              </select>
            </div>
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handlePreview}
              disabled={loading || !selectedVoice}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "处理中..." : "预览 (前200字符)"}
            </button>

            <button
              onClick={handleGenerate}
              disabled={loading || !selectedVoice || !text.trim()}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "生成中..." : "生成完整音频"}
            </button>
          </div>

          {/* 音频播放器 */}
          {audioUrl && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                生成的音频
              </label>
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/mpeg" />
                您的浏览器不支持音频播放。
              </audio>
              <div className="mt-2">
                <a
                  href={audioUrl}
                  download="generated-speech.mp3"
                  className="text-blue-500 hover:text-blue-700 underline"
                >
                  下载音频文件
                </a>
              </div>
            </div>
          )}

          {/* 统计信息 */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">语音统计</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm text-gray-600">
              <div>
                总语音数: <span className="font-medium">{voices.length}</span>
              </div>
              <div>
                已筛选:
                <span className="font-medium">{filteredVoices.length}</span>
              </div>
              <div>
                支持语言:
                <span className="font-medium">
                  {new Set(voices.map((v) => v.language)).size}
                </span>
              </div>
              <div>
                神经语音:
                <span className="font-medium">
                  {voices.filter((v) => v.voiceType === "Neural").length}
                </span>
              </div>
              {selectedLanguage && (
                <div>
                  {languages.find((l) => l.code === selectedLanguage)?.name}:
                  <span className="font-medium">
                    {
                      voices.filter((v) => v.language === selectedLanguage)
                        .length
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* 返回链接 */}
        <div className="mt-8 text-center">
          <a
            href="/azure-tts-languages"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            查看所有支持的语言
          </a>
        </div>
      </div>
    </div>
  );
}
