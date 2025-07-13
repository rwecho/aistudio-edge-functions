import { MarkedExtension, Tokens } from "marked";

interface TocItem {
  level: number;
  text: string;
  id: string;
}

interface TocOptions {
  tocTitle?: string;
  maxDepth?: number;
}

export default function markedToc(options: TocOptions = {}): MarkedExtension {
  const { tocTitle = "目录", maxDepth = 6 } = options;
  const tocItems: TocItem[] = [];
  let hasTocMarker = false;

  // 生成锚点ID
  const generateTocId = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, "") // 保留中文、英文、数字、空格和连字符
      .replace(/\s+/g, "-") // 空格转连字符
      .replace(/^-+|-+$/g, "") // 去掉开头和结尾的连字符
      .replace(/-+/g, "-"); // 多个连字符合并为一个
  };

  // 构建目录HTML
  const buildTocHtml = (): string => {
    if (!hasTocMarker || tocItems.length === 0) {
      return "";
    }

    let tocHtml = `<div class="markdown-toc">
  <h4 class="toc-title">${tocTitle}</h4>
  <ul class="toc-list">`;

    tocItems.forEach((item) => {
      if (item.level <= maxDepth) {
        const indent = "  ".repeat(item.level);
        tocHtml += `
${indent}<li class="toc-item toc-level-${item.level}">
${indent}  <a href="#${item.id}" class="toc-link">${item.text}</a>
${indent}</li>`;
      }
    });

    tocHtml += `
  </ul>
</div>

<style>
.markdown-toc {
  margin: 1.5em 0;
  padding: 1em;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  background-color: #f6f8fa;
}

.toc-title {
  margin: 0 0 0.5em 0;
  font-size: 1.1em;
  font-weight: bold;
  color: #24292e;
}

.toc-list {
  margin: 0;
  padding-left: 0;
  list-style: none;
}

.toc-item {
  margin: 0.25em 0;
  line-height: 1.5;
}

.toc-level-1 { padding-left: 0; }
.toc-level-2 { padding-left: 1em; }
.toc-level-3 { padding-left: 2em; }
.toc-level-4 { padding-left: 3em; }
.toc-level-5 { padding-left: 4em; }
.toc-level-6 { padding-left: 5em; }

.toc-link {
  color: #0366d6;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-bottom-color 0.2s;
}

.toc-link:hover {
  text-decoration: none;
  border-bottom-color: #0366d6;
}
</style>`;

    return tocHtml;
  };

  return {
    extensions: [
      {
        name: "tocMarker",
        level: "block",
        start(src: string) {
          return src.match(/^\[toc\]/i)?.index;
        },
        tokenizer(src: string) {
          const rule = /^\[toc\]/i;
          const match = src.match(rule);
          if (match) {
            hasTocMarker = true;
            return {
              type: "tocMarker",
              raw: match[0],
            };
          }
          return undefined;
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        renderer(_token: Tokens.Generic) {
          // [toc] 标记位置插入TOC占位符，实际内容在postprocess中替换
          return "<!--TOC_PLACEHOLDER-->";
        },
      },
    ],
    hooks: {
      preprocess(markdown: string) {
        // 清空TOC项目和标记状态
        tocItems.length = 0;
        hasTocMarker = false;
        return markdown;
      },
      postprocess(html: string) {
        // 第一步：从HTML中提取所有标题信息
        if (hasTocMarker) {
          const headingRegex = /<h([1-6])([^>]*?)>(.*?)<\/h[1-6]>/gi;
          let match;

          while ((match = headingRegex.exec(html)) !== null) {
            const level = parseInt(match[1]);
            const attributes = match[2];
            const content = match[3];

            // 提取纯文本内容（去除HTML标签）
            const text = content.replace(/<[^>]*>/g, "");

            if (level <= maxDepth && text.trim()) {
              // 生成ID
              const id = generateTocId(text);
              tocItems.push({ level, text, id });

              // 如果标题还没有ID，为其添加ID
              if (!attributes.includes("id=")) {
                const newHeading = `<h${level} id="${id}"${attributes}>${content}</h${level}>`;
                html = html.replace(match[0], newHeading);
              }
            }
          }

          // 第二步：生成TOC并替换占位符
          const tocHtml = buildTocHtml();
          if (tocHtml) {
            html = html.replace("<!--TOC_PLACEHOLDER-->", tocHtml);
          } else {
            html = html.replace("<!--TOC_PLACEHOLDER-->", "");
          }
        } else {
          // 如果没有[toc]标记，移除占位符
          html = html.replace("<!--TOC_PLACEHOLDER-->", "");
        }

        return html;
      },
    },
  };
}
