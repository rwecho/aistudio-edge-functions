"use client";

import { useState, useEffect } from "react";

interface LanguageInfo {
  code: string;
  name: string;
  displayName: string;
}

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

export default function AzureTTSLanguages() {
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [voicesByLanguage, setVoicesByLanguage] = useState<
    Record<string, VoiceInfo[]>
  >({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedLanguages, setExpandedLanguages] = useState<Set<string>>(
    new Set()
  );

  // 获取语言列表
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 获取语言列表
        const languagesResponse = await fetch("/api/azure-tts/languages");
        const languagesData = await languagesResponse.json();

        // 获取按语言分组的语音
        const voicesResponse = await fetch("/api/azure-tts/voices-by-language");
        const voicesData = await voicesResponse.json();

        if (languagesData.success && voicesData.success) {
          setLanguages(languagesData.languages);
          setVoicesByLanguage(voicesData.voicesByLanguage);
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

  // 切换语言展开状态
  const toggleLanguage = (languageCode: string) => {
    const newExpanded = new Set(expandedLanguages);
    if (newExpanded.has(languageCode)) {
      newExpanded.delete(languageCode);
    } else {
      newExpanded.add(languageCode);
    }
    setExpandedLanguages(newExpanded);
  };

  // 展开所有语言
  const expandAll = () => {
    setExpandedLanguages(new Set(languages.map((lang) => lang.code)));
  };

  // 收起所有语言
  const collapseAll = () => {
    setExpandedLanguages(new Set());
  };

  // 获取语音统计
  const getVoiceStats = (languageCode: string) => {
    const voices = voicesByLanguage[languageCode] || [];
    const maleVoices = voices.filter((v) => v.gender === "Male").length;
    const femaleVoices = voices.filter((v) => v.gender === "Female").length;
    const neuralVoices = voices.filter((v) => v.voiceType === "Neural").length;

    return {
      total: voices.length,
      male: maleVoices,
      female: femaleVoices,
      neural: neuralVoices,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Azure TTS 支持的语言和语音
          </h1>
          <p className="text-gray-600 mb-6">
            动态获取的所有支持的语言、语音和情感风格
          </p>

          {/* 操作按钮 */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              onClick={expandAll}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              展开所有
            </button>
            <button
              onClick={collapseAll}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              收起所有
            </button>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">
                {languages.length}
              </div>
              <div className="text-gray-600">支持语言</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(voicesByLanguage).reduce(
                  (total, voices) => total + voices.length,
                  0
                )}
              </div>
              <div className="text-gray-600">总语音数</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">
                {Object.values(voicesByLanguage).reduce(
                  (total, voices) =>
                    total +
                    voices.filter((v) => v.voiceType === "Neural").length,
                  0
                )}
              </div>
              <div className="text-gray-600">神经语音</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(voicesByLanguage).reduce(
                  (total, voices) =>
                    total +
                    voices.reduce(
                      (styleCount, voice) => styleCount + voice.styles.length,
                      0
                    ),
                  0
                )}
              </div>
              <div className="text-gray-600">风格总数</div>
            </div>
          </div>
        </div>

        {/* 错误信息 */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* 语言列表 */}
        <div className="space-y-4">
          {languages.map((language) => {
            const voices = voicesByLanguage[language.code] || [];
            const stats = getVoiceStats(language.code);
            const isExpanded = expandedLanguages.has(language.code);

            return (
              <div
                key={language.code}
                className="bg-white rounded-lg shadow-lg"
              >
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleLanguage(language.code)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {language.code}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {language.name}
                        </h3>
                        <div className="text-sm text-gray-600 mt-1">
                          共 {stats.total} 个语音 • 男声 {stats.male} 个 • 女声{" "}
                          {stats.female} 个 • 神经语音 {stats.neural} 个
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl text-gray-400">
                      {isExpanded ? "−" : "+"}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-6 pb-6">
                    <div className="border-t pt-4">
                      <div className="grid gap-4">
                        {voices.map((voice) => (
                          <div
                            key={voice.name}
                            className="p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-gray-900">
                                    {voice.displayName}
                                  </h4>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      voice.gender === "Female"
                                        ? "bg-pink-100 text-pink-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {voice.gender === "Female"
                                      ? "女声"
                                      : "男声"}
                                  </span>
                                  <span
                                    className={`px-2 py-1 text-xs rounded-full ${
                                      voice.voiceType === "Neural"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {voice.voiceType}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  <strong>名称:</strong> {voice.name}
                                </div>
                                <div className="text-sm text-gray-600 mb-2">
                                  <strong>描述:</strong> {voice.description}
                                </div>
                                <div className="text-sm text-gray-600">
                                  <strong>支持风格:</strong>{" "}
                                  <span className="text-blue-600">
                                    {voice.styles.join(", ")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 返回链接 */}
        <div className="mt-8 text-center">
          <a
            href="/azure-tts-demo"
            className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            返回TTS演示
          </a>
        </div>
      </div>
    </div>
  );
}
