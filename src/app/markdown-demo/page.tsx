"use client";

import { useState } from "react";

// highlight.js 主题列表
const codeBlockThemes = [
  { value: "1c-light", label: "1C Light" },
  { value: "a11y-dark", label: "A11y Dark" },
  { value: "a11y-light", label: "A11y Light" },
  { value: "agate", label: "Agate" },
  { value: "an-old-hope", label: "An Old Hope" },
  { value: "androidstudio", label: "Android Studio" },
  { value: "arduino-light", label: "Arduino Light" },
  { value: "arta", label: "Arta" },
  { value: "ascetic", label: "Ascetic" },
  { value: "atom-one-dark-reasonable", label: "Atom One Dark Reasonable" },
  { value: "atom-one-dark", label: "Atom One Dark" },
  { value: "atom-one-light", label: "Atom One Light" },
  { value: "brown-paper", label: "Brown Paper" },
  { value: "codepen-embed", label: "CodePen Embed" },
  { value: "color-brewer", label: "Color Brewer" },
  { value: "dark", label: "Dark" },
  { value: "default", label: "Default" },
  { value: "devibeans", label: "Devibeans" },
  { value: "docco", label: "Docco" },
  { value: "far", label: "FAR" },
  { value: "felipec", label: "Felipec" },
  { value: "foundation", label: "Foundation" },
  { value: "github-dark-dimmed", label: "GitHub Dark Dimmed" },
  { value: "github-dark", label: "GitHub Dark" },
  { value: "github", label: "GitHub" },
  { value: "gml", label: "GML" },
  { value: "googlecode", label: "Google Code" },
  { value: "gradient-dark", label: "Gradient Dark" },
  { value: "gradient-light", label: "Gradient Light" },
  { value: "grayscale", label: "Grayscale" },
  { value: "hybrid", label: "Hybrid" },
  { value: "idea", label: "IntelliJ IDEA" },
  { value: "intellij-light", label: "IntelliJ Light" },
  { value: "ir-black", label: "IR Black" },
  { value: "isbl-editor-dark", label: "ISBL Editor Dark" },
  { value: "isbl-editor-light", label: "ISBL Editor Light" },
  { value: "kimbie-dark", label: "Kimbie Dark" },
  { value: "kimbie-light", label: "Kimbie Light" },
  { value: "lightfair", label: "Lightfair" },
  { value: "lioshi", label: "Lioshi" },
  { value: "magula", label: "Magula" },
  { value: "mono-blue", label: "Mono Blue" },
  { value: "monokai-sublime", label: "Monokai Sublime" },
  { value: "monokai", label: "Monokai" },
  { value: "night-owl", label: "Night Owl" },
  { value: "nnfx-dark", label: "NNFX Dark" },
  { value: "nnfx-light", label: "NNFX Light" },
  { value: "nord", label: "Nord" },
  { value: "obsidian", label: "Obsidian" },
  { value: "panda-syntax-dark", label: "Panda Syntax Dark" },
  { value: "panda-syntax-light", label: "Panda Syntax Light" },
  { value: "paraiso-dark", label: "Paraiso Dark" },
  { value: "paraiso-light", label: "Paraiso Light" },
  { value: "pojoaque", label: "Pojoaque" },
  { value: "purebasic", label: "PureBasic" },
  { value: "qtcreator-dark", label: "Qt Creator Dark" },
  { value: "qtcreator-light", label: "Qt Creator Light" },
  { value: "rainbow", label: "Rainbow" },
  { value: "routeros", label: "RouterOS" },
  { value: "school-book", label: "School Book" },
  { value: "shades-of-purple", label: "Shades of Purple" },
  { value: "srcery", label: "Srcery" },
  { value: "stackoverflow-dark", label: "Stack Overflow Dark" },
  { value: "stackoverflow-light", label: "Stack Overflow Light" },
  { value: "sunburst", label: "Sunburst" },
  { value: "tokyo-night-dark", label: "Tokyo Night Dark" },
  { value: "tokyo-night-light", label: "Tokyo Night Light" },
  { value: "tomorrow-night-blue", label: "Tomorrow Night Blue" },
  { value: "tomorrow-night-bright", label: "Tomorrow Night Bright" },
  { value: "vs", label: "Visual Studio" },
  { value: "vs2015", label: "Visual Studio 2015" },
  { value: "xcode", label: "Xcode" },
  { value: "xt256", label: "XT256" },
];

// 字体选项
const fontFamilyOptions = [
  { value: "system-ui", label: "系统默认" },
  {
    value: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    label: "现代无衬线",
  },
  { value: "Georgia, 'Times New Roman', Times, serif", label: "衬线字体" },
  {
    value: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    label: "Helvetica",
  },
  {
    value: "'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
    label: "中文优化",
  },
  {
    value: "'Source Han Sans', 'Noto Sans CJK', sans-serif",
    label: "思源黑体",
  },
  {
    value: "Consolas, 'Liberation Mono', Menlo, Courier, monospace",
    label: "等宽字体",
  },
];

// 图片标题显示选项
const imageCaptionOptions = [
  { value: "none", label: "不显示标题" },
  { value: "alt", label: "显示 Alt 文本" },
  { value: "title", label: "显示 Title 文本" },
  { value: "alt-title", label: "优先 Alt，备选 Title" },
  { value: "title-alt", label: "优先 Title，备选 Alt" },
];

// 主题色预设选项
const primaryColorOptions = [
  { value: "#000000", label: "经典黑色", color: "#000000" },
  { value: "#1f2937", label: "深灰色", color: "#1f2937" },
  { value: "#3b82f6", label: "蓝色", color: "#3b82f6" },
  { value: "#10b981", label: "绿色", color: "#10b981" },
  { value: "#f59e0b", label: "橙色", color: "#f59e0b" },
  { value: "#ef4444", label: "红色", color: "#ef4444" },
  { value: "#8b5cf6", label: "紫色", color: "#8b5cf6" },
  { value: "#06b6d4", label: "青色", color: "#06b6d4" },
  { value: "#84cc16", label: "lime", color: "#84cc16" },
  { value: "#f97316", label: "橙红色", color: "#f97316" },
];

// Markdown 主题选项
const markdownThemeOptions = [
  {
    value: "default",
    label: "经典默认",
    description: "简洁的黑白主题，适合正式文档",
  },
  {
    value: "github",
    label: "GitHub 风格",
    description: "仿 GitHub README 样式",
  },
  { value: "minimal", label: "简约现代", description: "现代化的简约设计" },
  { value: "academic", label: "学术论文", description: "适合学术写作和论文" },
  { value: "tech", label: "技术文档", description: "专为技术文档设计" },
  { value: "blog", label: "博客文章", description: "适合博客和个人写作" },
];

export default function MarkdownDemo() {
  const [markdown, setMarkdown] = useState(``);
  const [selectedTheme, setSelectedTheme] = useState("github");
  const [markdownTheme, setMarkdownTheme] = useState("default");
  const [isMacCodeBlock, setIsMacCodeBlock] = useState(true);
  const [showReadingTime, setShowReadingTime] = useState(true);
  const [showCiteStatus, setShowCiteStatus] = useState(true);
  const [isUseIndent, setIsUseIndent] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("system-ui");
  const [imageCaption, setImageCaption] = useState("alt");
  const [primaryColor, setPrimaryColor] = useState("#000000");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const convertMarkdown = async () => {
    if (!markdown.trim()) {
      setError("请输入 Markdown 内容");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/markdown/toHtml", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          markdown,
          options: {
            codeBlockTheme: selectedTheme,
            markdownTheme: markdownTheme,
            isMacCodeBlock: isMacCodeBlock,
            countStatus: showReadingTime,
            citeStatus: showCiteStatus,
            isUseIndent: isUseIndent,
            fontSize: fontSize,
            fontFamily: fontFamily,
            legend: imageCaption,
            primaryColor: primaryColor,
          },
        }),
      });

      const data = await response.json();
      debugger;

      if (!response.ok || !data.success) {
        throw new Error(data.error || "转换失败");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  };

  const copyRichText = async () => {
    try {
      const markdownElement = document.querySelector(".markdown-content")!;
      window.getSelection()!.removeAllRanges();
      // 选择内容
      const range = document.createRange();
      range.setStartBefore(markdownElement.firstChild!);
      range.setEndAfter(markdownElement.lastChild!);
      window.getSelection()?.addRange(range);
      const success = document.execCommand("copy");
      // 清理
      // window.getSelection()?.removeAllRanges();

      if (success) {
        alert("已复制富文本格式内容到剪贴板");
      } else {
        throw new Error("execCommand copy failed");
      }
    } catch (err) {
      console.error("复制富文本失败:", err);
      alert("复制富文本失败，请尝试其他复制方式");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            高级 Markdown 转 HTML 工具
          </h1>
          <p className="text-lg text-gray-600">
            支持目录生成、代码高亮、字体字号、图片标题、滚动条美化等高级功能
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 输入区域 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                Markdown 输入
              </h2>
              <div className="flex flex-wrap gap-4 pt-4">
                {/* Markdown 主题选择 */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="markdown-theme-select"
                    className="text-sm font-medium text-gray-700"
                  >
                    文档主题:
                  </label>
                  <select
                    id="markdown-theme-select"
                    value={markdownTheme}
                    onChange={(e) => setMarkdownTheme(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {markdownThemeOptions.map((theme) => (
                      <option
                        key={theme.value}
                        value={theme.value}
                        title={theme.description}
                      >
                        {theme.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 主题选择 */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="theme-select"
                    className="text-sm font-medium text-gray-700"
                  >
                    代码主题:
                  </label>
                  <select
                    id="theme-select"
                    value={selectedTheme}
                    onChange={(e) => setSelectedTheme(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {codeBlockThemes.map((theme) => (
                      <option key={theme.value} value={theme.value}>
                        {theme.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mac 装饰开关 */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="mac-toggle"
                    className="text-sm font-medium text-gray-700"
                  >
                    Mac 装饰:
                  </label>
                  <input
                    id="mac-toggle"
                    type="checkbox"
                    checked={isMacCodeBlock}
                    onChange={(e) => setIsMacCodeBlock(e.target.checked)}
                    className="rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 阅读时间开关 */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="reading-time-toggle"
                    className="text-sm font-medium text-gray-700"
                  >
                    字数统计:
                  </label>
                  <input
                    id="reading-time-toggle"
                    type="checkbox"
                    checked={showReadingTime}
                    onChange={(e) => setShowReadingTime(e.target.checked)}
                    className="rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 引用状态开关 */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="cite-status-toggle"
                    className="text-sm font-medium text-gray-700"
                  >
                    引用链接:
                  </label>
                  <input
                    id="cite-status-toggle"
                    type="checkbox"
                    checked={showCiteStatus}
                    onChange={(e) => setShowCiteStatus(e.target.checked)}
                    className="rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 缩进开关 */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="indent-toggle"
                    className="text-sm font-medium text-gray-700"
                  >
                    段落缩进:
                  </label>
                  <input
                    id="indent-toggle"
                    type="checkbox"
                    checked={isUseIndent}
                    onChange={(e) => setIsUseIndent(e.target.checked)}
                    className="rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* 字体和字号控制 */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                {/* 字号控制 */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="font-size-range"
                    className="text-sm font-medium text-gray-700"
                  >
                    字号:
                  </label>
                  <input
                    id="font-size-range"
                    type="range"
                    min="12"
                    max="24"
                    step="1"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-gray-600 min-w-[3rem]">
                    {fontSize}px
                  </span>
                </div>

                {/* 字体选择 */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="font-family-select"
                    className="text-sm font-medium text-gray-700"
                  >
                    字体:
                  </label>
                  <select
                    id="font-family-select"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {fontFamilyOptions.map((font) => (
                      <option key={font.value} value={font.value}>
                        {font.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 图片标题选择 */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="image-caption-select"
                    className="text-sm font-medium text-gray-700"
                  >
                    图片标题:
                  </label>
                  <select
                    id="image-caption-select"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {imageCaptionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 主题色 */}
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="primary-color-select"
                    className="text-sm font-medium text-gray-700"
                  >
                    主题色:
                  </label>
                  <select
                    id="primary-color-select"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {primaryColorOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-96 p-4 border border-gray-300 rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="在这里输入你的 Markdown 内容..."
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={convertMarkdown}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "转换中..." : "转换为 HTML"}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>

          {/* 输出区域 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800">HTML 输出</h2>
              {result && (
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={copyRichText}
                    className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                    title="复制富文本格式，可直接粘贴到Word等应用"
                  >
                    复制富文本
                  </button>
                </div>
              )}
            </div>

            {result && (
              <div className="space-y-4 ">
                {/* 预览区域 */}
                <div className="border border-gray-200 rounded-md">
                  <div className=" p-4 min-h-96 max-h-128 overflow-auto">
                    <section
                      className="markdown-content"
                      dangerouslySetInnerHTML={{ __html: result.html }}
                    ></section>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
