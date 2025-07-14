"use client";

import { useState, useEffect, useCallback } from "react";

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

// 背景样式选项
const backgroundOptions = [
  {
    value: "none",
    label: "纯净白底",
    description: "纯白背景，最佳阅读体验",
    css: { background: "#ffffff" },
  },
  {
    value: "gradient",
    label: "淡雅渐变",
    description: "柔和渐变，护眼舒适",
    css: {
      "background-image": "linear-gradient(135deg, #fafafa 0%, #f0f4f8 100%)",
    },
  },
  {
    value: "grid",
    label: "淡雅网格",
    description: "超淡网格线，不干扰阅读",
    css: {
      "background-image":
        "linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(180deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)",
      "background-size": "24px 24px",
      "background-position": "center center",
      "background-color": "#fefefe",
    },
  },
  {
    value: "dots",
    label: "微点纹理",
    description: "极淡点状，增加层次感",
    css: {
      "background-color": "#fefefe",
      "background-image":
        "radial-gradient(circle, rgba(0,0,0,0.04) 0.5px, transparent 0.5px)",
      "background-size": "16px 16px",
    },
  },
  {
    value: "lines",
    label: "轻柔斜纹",
    description: "若隐若现的斜线纹理",
  },
  {
    value: "waves",
    label: "淡雅波纹",
    description: "微妙波纹，柔和视觉",
  },
  {
    value: "paper",
    label: "纸质肌理",
    description: "仿纸张质感，护眼阅读",
  },
  {
    value: "graph",
    label: "淡雅方格",
    description: "超淡方格线，专业感",
  },
  {
    value: "shadow",
    label: "柔和阴影",
    description: "内阴影效果，增加深度",
  },
  {
    value: "fabric",
    label: "织物质感",
    description: "极淡织物纹理，温暖舒适",
  },
];

export default function MarkdownDemo() {
  const [markdown, setMarkdown] = useState(`# Markdown 编辑器演示

[toc]

## 1. 简介

这是一个功能强大的 Markdown 编辑器，支持实时预览、代码高亮、目录生成等功能。

## 2. 基础语法

### 2.1 标题

支持 6 级标题，通过 \`#\` 符号表示：

\`\`\`markdown
# 一级标题
## 二级标题
### 三级标题
\`\`\`

### 2.2 强调

可以使用 **粗体** 和 *斜体* 来强调文本。

### 2.3 列表

#### 无序列表：
- 第一项
- 第二项
  - 嵌套项目
  - 另一个嵌套项目

#### 有序列表：
1. 第一步
2. 第二步
3. 第三步

### 2.4 引用

> 这是一个引用块
> 
> 可以包含多行内容

### 2.5 代码

行内代码：\`console.log('Hello World')\`

代码块：

\`\`\`javascript
function hello() {
  console.log('Hello, Markdown!');
  return 'success';
}

hello();
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))
\`\`\`

### 2.6 表格

| 功能 | 支持 | 备注 |
|------|------|------|
| 实时预览 | ✅ | 快速响应 |
| 代码高亮 | ✅ | 多种主题 |
| 目录生成 | ✅ | 自动锚点 |
| 字体控制 | ✅ | 多种字体 |

### 2.7 链接

[GitHub](https://github.com) | [官方文档](https://markdown-it.github.io/)

### 2.8 图片

![Markdown Logo](https://markdown-here.com/img/icon256.png)

## 3. 高级功能

### 3.1 数学公式

内联公式：$E = mc^2$

块级公式：

$$
\\frac{1}{n} \\sum_{i=1}^{n} x_i = \\bar{x}
$$

### 3.2 任务列表

- [x] 完成基础功能
- [x] 添加代码高亮
- [x] 实现目录生成
- [ ] 添加更多主题
- [ ] 支持插件系统

### 3.3 脚注

这里有一个脚注[^1]。

[^1]: 这是脚注的内容

## 4. 结语

感谢使用这个 Markdown 编辑器！如果您有任何建议或问题，欢迎反馈。

---

**提示：** 尝试修改顶部菜单栏设置来自定义预览效果！`);
  const [selectedTheme, setSelectedTheme] = useState("github");
  const [markdownTheme, setMarkdownTheme] = useState("default");
  const [isMacCodeBlock, setIsMacCodeBlock] = useState(true);
  const [showReadingTime, setShowReadingTime] = useState(true);
  const [showCiteStatus, setShowCiteStatus] = useState(true);
  const [isUseIndent, setIsUseIndent] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState("system-ui");
  const [primaryColor, setPrimaryColor] = useState("#000000");
  const [background, setBackground] = useState("none");

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tocItems, setTocItems] = useState<
    Array<{ id: string; text: string; level: number }>
  >([]);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // 从 HTML 中提取目录
  const extractTocFromHtml = useCallback((html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6");

    const items = Array.from(headings).map((heading) => ({
      id: heading.id || "",
      text: heading.textContent || "",
      level: parseInt(heading.tagName.substring(1)),
    }));

    setTocItems(items);
  }, []);

  const convertMarkdown = useCallback(async () => {
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
            legend: "alt",
            primaryColor: primaryColor,
            background: background,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "转换失败");
      }

      setResult(data);

      // 提取目录
      if (data.html) {
        extractTocFromHtml(data.html);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "未知错误");
    } finally {
      setLoading(false);
    }
  }, [
    markdown,
    selectedTheme,
    markdownTheme,
    isMacCodeBlock,
    showReadingTime,
    showCiteStatus,
    isUseIndent,
    fontSize,
    fontFamily,
    primaryColor,
    background,
    extractTocFromHtml,
  ]);

  // 自动转换内容 - 防抖处理
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (markdown.trim()) {
        convertMarkdown();
      }
    }, 500); // 500ms 防抖延迟

    return () => clearTimeout(timeoutId);
  }, [
    markdown,
    selectedTheme,
    markdownTheme,
    isMacCodeBlock,
    showReadingTime,
    showCiteStatus,
    isUseIndent,
    fontSize,
    fontFamily,
    primaryColor,
    background,
    convertMarkdown,
  ]); // 当任何相关选项变化时都会自动转换

  // 点击外部区域关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (activeMenu && !target.closest("[data-menu]")) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenu]);

  const copyHtml = async () => {
    try {
      await navigator.clipboard.writeText(result?.html || "");
      alert("已复制 HTML 格式内容到剪贴板");
    } catch (err) {
      console.error("复制 HTML 失败:", err);
      alert("复制 HTML 失败，请尝试其他复制方式");
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
      window.getSelection()?.removeAllRanges();

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
    <div className="min-h-screen bg-gray-50">
      {/* 顶部菜单栏 - 类似现代编辑器样式 */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-2">
          {/* 左侧标题和菜单 */}
          <div className="flex items-center gap-1">
            <h1 className="text-lg font-semibold text-gray-900 mr-4">
              Markdown 编辑器
            </h1>

            {/* 主菜单项 */}
            <div className="flex items-center" data-menu>
              {/* 文件菜单 */}
              <div className="relative">
                <button
                  onClick={() =>
                    setActiveMenu(activeMenu === "file" ? null : "file")
                  }
                  className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  文件
                </button>
                {activeMenu === "file" && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          copyRichText();
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        复制富文本
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 格式菜单 */}
              <div className="relative">
                <button
                  onClick={() =>
                    setActiveMenu(activeMenu === "format" ? null : "format")
                  }
                  className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  格式
                </button>
                {activeMenu === "format" && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="p-3 space-y-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          字体
                        </label>
                        <select
                          value={fontFamily}
                          onChange={(e) => setFontFamily(e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          title="选择字体"
                        >
                          {fontFamilyOptions.map((font) => (
                            <option key={font.value} value={font.value}>
                              {font.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          字号: {fontSize}px
                        </label>
                        <input
                          type="range"
                          min="12"
                          max="24"
                          step="1"
                          value={fontSize}
                          onChange={(e) => setFontSize(Number(e.target.value))}
                          className="w-full"
                          title="调整字体大小"
                          aria-label="字体大小"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          主题色
                        </label>
                        <select
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          title="选择主题色"
                        >
                          {primaryColorOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="p-3 space-y-3">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isMacCodeBlock}
                          onChange={(e) => setIsMacCodeBlock(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-gray-700">Mac装饰</span>
                      </label>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={showReadingTime}
                          onChange={(e) => setShowReadingTime(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-gray-700">字数统计</span>
                      </label>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={showCiteStatus}
                          onChange={(e) => setShowCiteStatus(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-gray-700">引用链接</span>
                      </label>

                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={isUseIndent}
                          onChange={(e) => setIsUseIndent(e.target.checked)}
                          className="rounded"
                        />
                        <span className="text-gray-700">段落缩进</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* 转换主题菜单 */}
              <div className="relative">
                <button
                  onClick={() =>
                    setActiveMenu(activeMenu === "theme" ? null : "theme")
                  }
                  className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  转换主题
                </button>
                {activeMenu === "theme" && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="p-3 space-y-2">
                      {markdownThemeOptions.map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => {
                            setMarkdownTheme(theme.value);
                            setActiveMenu(null);
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            markdownTheme === theme.value
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="font-medium">{theme.label}</div>
                          <div className="text-xs text-gray-500">
                            {theme.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 代码主题菜单 */}
              <div className="relative">
                <button
                  onClick={() =>
                    setActiveMenu(activeMenu === "code" ? null : "code")
                  }
                  className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  代码主题
                </button>
                {activeMenu === "code" && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-80 overflow-y-auto">
                    <div className="p-2">
                      <div className="grid grid-cols-2 gap-1">
                        {codeBlockThemes.map((theme) => (
                          <button
                            key={theme.value}
                            onClick={() => {
                              setSelectedTheme(theme.value);
                              setActiveMenu(null);
                            }}
                            className={`text-left px-2 py-1 rounded text-xs transition-colors ${
                              selectedTheme === theme.value
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            {theme.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 背景样式菜单 */}
              <div className="relative">
                <button
                  onClick={() =>
                    setActiveMenu(
                      activeMenu === "background" ? null : "background"
                    )
                  }
                  className="px-3 py-1 text-sm text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  背景
                </button>
                {activeMenu === "background" && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="p-3 space-y-2">
                      {backgroundOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setBackground(option.value);
                            setActiveMenu(null);
                          }}
                          className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                            background === option.value
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-500">
                            {option.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧状态和操作 */}
          <div className="flex items-center gap-3">
            {/* 状态指示器 */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-blue-600">
                <div className="animate-spin w-3 h-3 border border-blue-600 border-t-transparent rounded-full"></div>
                <span>转换中</span>
              </div>
            )}

            {/* 错误提示 */}
            {error && (
              <div
                className="text-xs text-red-600 max-w-xs truncate"
                title={error}
              >
                错误: {error}
              </div>
            )}

            <button
              onClick={copyRichText}
              className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              title="复制富文本格式"
            >
              复制富文本
            </button>

            <button
              onClick={copyHtml}
              className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
              title="复制 HTML 格式"
            >
              复制 HTML
            </button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-48px)]">
        {/* 左侧编辑区域 */}
        <div className="w-1/2 bg-white border-r border-gray-200 flex flex-col">
          {/* 编辑器区域 */}
          <div className="flex-1 p-4">
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-full p-4 border border-gray-300 rounded-md font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="在这里输入你的 Markdown 内容..."
            />
          </div>
        </div>

        {/* 右侧预览区域 */}
        <div className="w-1/2 bg-white flex">
          {/* 预览内容 */}
          <div className="flex-1 flex flex-col">
            {/* 预览内容区域 */}
            <div className="flex-1 overflow-auto p-6">
              {result ? (
                <section
                  className="markdown-content"
                  dangerouslySetInnerHTML={{ __html: result.html }}
                />
              ) : (
                <div className="text-center text-gray-500 mt-20">
                  <p>请在左侧输入 Markdown 内容</p>
                  <p className="text-sm mt-2">内容将自动转换为 HTML 预览</p>
                </div>
              )}
            </div>
          </div>

          {/* 右侧目录（TOC） */}
          {result && (
            <div className="w-64 border-l border-gray-200 bg-gray-50">
              <div className="p-3 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-800">目录</h3>
              </div>
              <div className="p-3 text-xs overflow-auto max-h-full">
                {tocItems.length > 0 ? (
                  <nav className="space-y-1">
                    {tocItems.map((item, index) => (
                      <a
                        key={index}
                        href={`#${item.id}`}
                        className={`block py-1 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors ${
                          item.level === 1
                            ? "font-semibold"
                            : item.level === 2
                            ? "ml-2"
                            : item.level === 3
                            ? "ml-4 text-xs"
                            : item.level === 4
                            ? "ml-6 text-xs"
                            : item.level === 5
                            ? "ml-8 text-xs"
                            : "ml-10 text-xs"
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          const element = document.getElementById(item.id);
                          if (element) {
                            element.scrollIntoView({ behavior: "smooth" });
                          }
                        }}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                ) : (
                  <div className="text-gray-500">
                    <p className="mb-2">暂无目录</p>
                    <p className="text-xs">转换 Markdown 后将显示标题目录</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
