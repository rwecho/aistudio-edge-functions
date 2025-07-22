import { marked } from "marked";
import hljs from "highlight.js";
import frontMatter from "front-matter";
import type { ReadTimeResults } from "reading-time";
import readingTime from "reading-time";
import type { RendererObject, Tokens } from "marked";
import type { PropertiesHyphen } from "csstype";
import { defaultTheme, getTheme } from "./theme";
import { toMerged } from "es-toolkit";
import markedSlider from "./MDSlider";
import markedAnnotation from "./MDAnnotation";
import { ServerMDKatex } from "./ServerMDKatex";
import markedToc from "./MDToc";
import { JSDOM } from "jsdom";
import juice from "juice";

// highlight.js 主题配置
const codeBlockUrlPrefix = `https://cdn-doocs.oss-cn-shenzhen.aliyuncs.com/npm/highlightjs/11.11.1/styles/`;
const codeBlockThemeList = [
  `1c-light`,
  `a11y-dark`,
  `a11y-light`,
  `agate`,
  `an-old-hope`,
  `androidstudio`,
  `arduino-light`,
  `arta`,
  `ascetic`,
  `atom-one-dark-reasonable`,
  `atom-one-dark`,
  `atom-one-light`,
  `brown-paper`,
  `codepen-embed`,
  `color-brewer`,
  `dark`,
  `default`,
  `devibeans`,
  `docco`,
  `far`,
  `felipec`,
  `foundation`,
  `github-dark-dimmed`,
  `github-dark`,
  `github`,
  `gml`,
  `googlecode`,
  `gradient-dark`,
  `gradient-light`,
  `grayscale`,
  `hybrid`,
  `idea`,
  `intellij-light`,
  `ir-black`,
  `isbl-editor-dark`,
  `isbl-editor-light`,
  `kimbie-dark`,
  `kimbie-light`,
  `lightfair`,
  `lioshi`,
  `magula`,
  `mono-blue`,
  `monokai-sublime`,
  `monokai`,
  `night-owl`,
  `nnfx-dark`,
  `nnfx-light`,
  `nord`,
  `obsidian`,
  `panda-syntax-dark`,
  `panda-syntax-light`,
  `paraiso-dark`,
  `paraiso-light`,
  `pojoaque`,
  `purebasic`,
  `qtcreator-dark`,
  `qtcreator-light`,
  `rainbow`,
  `routeros`,
  `school-book`,
  `shades-of-purple`,
  `srcery`,
  `stackoverflow-dark`,
  `stackoverflow-light`,
  `sunburst`,
  `tokyo-night-dark`,
  `tokyo-night-light`,
  `tomorrow-night-blue`,
  `tomorrow-night-bright`,
  `vs`,
  `vs2015`,
  `xcode`,
  `xt256`,
];

type GFMBlock =
  | `blockquote_note`
  | `blockquote_tip`
  | `blockquote_info`
  | `blockquote_important`
  | `blockquote_warning`
  | `blockquote_caution`
  | `blockquote_title`
  | `blockquote_title_note`
  | `blockquote_title_tip`
  | `blockquote_title_info`
  | `blockquote_title_important`
  | `blockquote_title_warning`
  | `blockquote_title_caution`
  | `blockquote_p`
  | `blockquote_p_note`
  | `blockquote_p_tip`
  | `blockquote_p_info`
  | `blockquote_p_important`
  | `blockquote_p_warning`
  | `blockquote_p_caution`;

export type Block =
  | `container`
  | `h1`
  | `h2`
  | `h3`
  | `h4`
  | `h5`
  | `h6`
  | `p`
  | `blockquote`
  | `blockquote_p`
  | `code_pre`
  | `code`
  | `image`
  | `ol`
  | `ul`
  | `footnotes`
  | `figure`
  | `hr`
  | `block_katex`
  | GFMBlock;

export type Inline =
  | `listitem`
  | `codespan`
  | `link`
  | `wx_link`
  | `strong`
  | `table`
  | `thead`
  | `td`
  | `footnote`
  | `figcaption`
  | `em`
  | `inline_katex`;

interface CustomCSSProperties {
  [`--md-primary-color`]?: string;
  [key: `--${string}`]: string | undefined;
}

export type ExtendedProperties = PropertiesHyphen & CustomCSSProperties;

export type ThemeStyles = Record<Block | Inline, ExtendedProperties>;

export interface Theme {
  base: ExtendedProperties;
  block: Record<Block, ExtendedProperties>;
  inline: Record<Inline, ExtendedProperties>;
}

/**
 * 将 CSS 字符串转换为 JSON 对象
 *
 * @param {string} css - CSS 字符串
 * @returns {object} - JSON 格式的 CSS
 */
export function css2json(
  css: string
): Partial<Record<Block | Inline, PropertiesHyphen>> {
  // 去除所有 CSS 注释
  css = css.replace(/\/\*[\s\S]*?\*\//g, ``);

  const json: Partial<Record<Block | Inline, PropertiesHyphen>> = {};

  // 辅助函数：将声明数组转换为对象
  const toObject = (array: any[]) =>
    array.reduce<{ [k: string]: string }>((obj, item) => {
      const [property, ...value] = item
        .split(`:`)
        .map((part: string) => part.trim());
      if (property) obj[property] = value.join(`:`);
      return obj;
    }, {});

  while (css.includes(`{`) && css.includes(`}`)) {
    const lbracket = css.indexOf(`{`);
    const rbracket = css.indexOf(`}`);

    // 获取声明块并转换为对象
    const declarations = css
      .substring(lbracket + 1, rbracket)
      .split(`;`)
      .map((e) => e.trim())
      .filter(Boolean);

    // 获取选择器并去除空格
    const selectors = css
      .substring(0, lbracket)
      .split(`,`)
      .map((selector) => selector.trim()) as (Block | Inline)[];

    const declarationObj = toObject(declarations);

    // 将声明对象关联到相应的选择器
    selectors.forEach((selector) => {
      json[selector] = { ...(json[selector] || {}), ...declarationObj };
    });

    // 处理下一个声明块
    css = css.slice(rbracket + 1).trim();
  }

  return json;
}

export interface MarkdownOptions {
  theme: Theme;
  isUseIndent: boolean;
  legend: "alt" | "title" | "none" | "alt-title" | "title-alt" | string; // 图片标题显示选项
  citeStatus: boolean;
  countStatus: boolean;
  isMacCodeBlock?: boolean;
  codeBlockTheme?: string; // highlight.js 主题名称
  fontSize?: number; // 基础字号，单位为 px
  fontFamily?: string; // 字体族
  primaryColor?: string; // 主题色
  markdownTheme?: string; // Markdown 主题名称
  background?: string; // 背景样式
}

interface ParseResult {
  yamlData: Record<string, any>;
  markdownContent: string;
  readingTime: ReadTimeResults;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, `&amp;`) // 转义 &
    .replace(/</g, `&lt;`) // 转义 <
    .replace(/>/g, `&gt;`) // 转义 >
    .replace(/"/g, `&quot;`) // 转义 "
    .replace(/'/g, `&#39;`) // 转义 '
    .replace(/`/g, `&#96;`); // 转义 `
}

function mergeCss(html: string): string {
  return juice(html, {
    inlinePseudoElements: true,
    preserveImportant: true,
  });
}

function modifyHtmlStructure(document: Document, htmlString: string): string {
  const tempDiv = document.createElement(`div`);
  tempDiv.innerHTML = htmlString;

  // 移动 `li > ul` 和 `li > ol` 到 `li` 后面
  tempDiv.querySelectorAll(`li > ul, li > ol`).forEach((originalItem) => {
    originalItem.parentElement!.insertAdjacentElement(`afterend`, originalItem);
  });

  return tempDiv.innerHTML;
}

function transform(
  legend: string,
  text: string | null,
  title: string | null
): string {
  // legend 选项说明：
  // "alt" - 显示图片的 alt 文本
  // "title" - 显示图片的 title 文本
  // "none" - 不显示任何文本
  // "alt-title" - 优先显示 alt，如果没有则显示 title
  // "title-alt" - 优先显示 title，如果没有则显示 alt

  switch (legend.toLowerCase()) {
    case "alt":
      return text || "";
    case "title":
      return title || "";
    case "none":
      return "";
    case "alt-title":
      return text || title || "";
    case "title-alt":
      return title || text || "";
    default:
      // 保持向后兼容，解析旧的格式（如 "alt-title"）
      const options = legend.split(`-`);
      for (const option of options) {
        if (option === `alt` && text) {
          return text;
        }
        if (option === `title` && title) {
          return title;
        }
      }
      return ``;
  }
}

const macCodeSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="45px" height="13px" viewBox="0 0 450 130">
    <ellipse cx="50" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)" />
    <ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)" />
    <ellipse cx="400" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)" />
  </svg>
`.trim();

const fnMap = new Map<string, MapContent>();
interface MapContent {
  index: number;
  text: string;
}

const markedFootnotes = () => {
  return {
    extensions: [
      {
        name: `footnoteDef`,
        level: `block`,
        start(src: string) {
          fnMap.clear();
          return src.match(/^\[\^/)?.index;
        },
        tokenizer(src: string) {
          const match = src.match(/^\[\^(.*)\]:(.*)/);
          if (match) {
            const [raw, fnId, text] = match;
            const index = fnMap.size + 1;
            fnMap.set(fnId, { index, text });
            return {
              type: `footnoteDef`,
              raw,
              fnId,
              index,
              text,
            };
          }
          return undefined;
        },
        renderer(token: Tokens.Generic) {
          const { index, text, fnId } = token;
          const fnInner = `
                <code>${index}.</code> 
                <span>${text}</span> 
                    <a id="fnDef-${fnId}" href="#fnRef-${fnId}" style="color: var(--md-primary-color);">\u21A9\uFE0E</a>
                <br>`;
          if (index === 1) {
            return `
            <p style="font-size: 80%;margin: 0.5em 8px;word-break:break-all;">${fnInner}`;
          }
          if (index === fnMap.size) {
            return `${fnInner}</p>`;
          }
          return fnInner;
        },
      },
      {
        name: `footnoteRef`,
        level: `inline`,
        start(src: string) {
          return src.match(/\[\^/)?.index;
        },
        tokenizer(src: string) {
          const match = src.match(/^\[\^(.*?)\]/);
          if (match) {
            const [raw, fnId] = match;
            if (fnMap.has(fnId)) {
              return {
                type: `footnoteRef`,
                raw,
                fnId,
              };
            }
          }
        },
        renderer(token: Tokens.Generic) {
          const { fnId } = token;
          const { index } = fnMap.get(fnId) as MapContent;
          return `<sup style="color: var(--md-primary-color);">
                    <a href="#fnDef-${fnId}" id="fnRef-${fnId}">\[${index}\]</a>
                </sup>`;
        },
      },
    ],
  };
};

export function customizeTheme(
  theme: Theme,
  options: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    background?: string;
  }
) {
  const newTheme = JSON.parse(JSON.stringify(theme));
  const { fontSize, fontFamily, color, background } = options;

  // 定义背景样式映射 - 优化阅读体验
  const backgroundStyles: Record<string, any> = {
    none: {
      background: "#ffffff",
    },
    gradient: {
      "background-image": "linear-gradient(135deg, #fafafa 0%, #f0f4f8 100%)",
    },
    grid: {
      "background-image":
        "linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(180deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px)",
      "background-size": "24px 24px",
      "background-position": "center center",
      "background-color": "#fefefe",
    },
    dots: {
      "background-color": "#fefefe",
      "background-image":
        "radial-gradient(circle, rgba(0,0,0,0.04) 0.5px, transparent 0.5px)",
      "background-size": "16px 16px",
    },
    lines: {
      "background-color": "#fefefe",
      "background-image":
        "repeating-linear-gradient(45deg, transparent, transparent 12px, rgba(0,0,0,0.015) 12px, rgba(0,0,0,0.015) 24px)",
    },
    waves: {
      "background-color": "#fefefe",
      "background-image":
        "linear-gradient(90deg, rgba(0,0,0,0.015) 50%, transparent 50%)",
      "background-size": "32px 32px",
    },
    paper: {
      "background-color": "#fefefe",
      "background-image":
        "linear-gradient(90deg, rgba(100,100,100,0.01) 50%, transparent 50%), linear-gradient(180deg, rgba(100,100,100,0.01) 50%, transparent 50%)",
      "background-size": "1px 1px",
    },
    graph: {
      "background-color": "#fefefe",
      "background-image":
        "linear-gradient(rgba(0,0,0,0.03) 0.5px, transparent 0.5px), linear-gradient(90deg, rgba(0,0,0,0.03) 0.5px, transparent 0.5px)",
      "background-size": "20px 20px",
    },
    shadow: {
      background: "#ffffff",
      "box-shadow": "inset 0 0 120px rgba(0,0,0,0.015)",
    },
    fabric: {
      "background-color": "#fafafa",
      "background-image":
        "repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,0.008) 3px, rgba(0,0,0,0.008) 6px)",
    },
  };

  // 设置字号
  if (fontSize) {
    // 设置基础字号
    newTheme.base["font-size"] = `${fontSize}px`;

    // 调整标题字号
    for (let i = 1; i <= 6; i++) {
      const currentSize = newTheme.block[`h${i}`][`font-size`];
      if (currentSize) {
        const multiplier = Number.parseFloat(currentSize);
        newTheme.block[`h${i}`][`font-size`] = `${fontSize * multiplier}px`;
      }
    }

    // 调整段落字号
    newTheme.block.p["font-size"] = `${fontSize}px`;
    newTheme.block.blockquote_p["font-size"] = `${fontSize}px`;
  }

  // 设置字体族
  if (fontFamily) {
    newTheme.base["font-family"] = fontFamily;
    // 段落和引用也使用相同字体
    newTheme.block.p["font-family"] = fontFamily;
    newTheme.block.blockquote_p["font-family"] = fontFamily;
    newTheme.inline.listitem["font-family"] = fontFamily;
  }

  if (color) {
    newTheme.base[`--md-primary-color`] = color;
  }

  // 设置背景样式
  if (background && backgroundStyles[background]) {
    const bgStyles = backgroundStyles[background];
    // 清除可能存在的旧背景样式
    delete newTheme.block.container["background-image"];
    delete newTheme.block.container["background-size"];
    delete newTheme.block.container["background-position"];
    delete newTheme.block.container["background"];
    delete newTheme.block.container["background-color"];
    delete newTheme.block.container["box-shadow"];

    // 应用新的背景样式
    Object.assign(newTheme.block.container, bgStyles);
  }

  return newTheme as Theme;
}

export function customCssWithTemplate(
  jsonString: Partial<Record<Block | Inline, PropertiesHyphen>>,
  color: string,
  theme: Theme
) {
  const newTheme = customizeTheme(theme, { color });

  const mergeProperties = <T extends Block | Inline = Block>(
    target: Record<T, PropertiesHyphen>,
    source: Partial<Record<Block | Inline, PropertiesHyphen>>,
    keys: T[]
  ) => {
    keys.forEach((key) => {
      if (source[key]) {
        target[key] = Object.assign(target[key] || {}, source[key]);
      }
    });
  };

  const blockKeys: Block[] = [
    `container`,
    `h1`,
    `h2`,
    `h3`,
    `h4`,
    `h5`,
    `h6`,
    `code`,
    `code_pre`,
    `p`,
    `hr`,
    `blockquote`,
    `blockquote_note`,
    `blockquote_tip`,
    `blockquote_important`,
    `blockquote_warning`,
    `blockquote_caution`,
    `blockquote_p`,
    `blockquote_p_note`,
    `blockquote_p_tip`,
    `blockquote_p_important`,
    `blockquote_p_warning`,
    `blockquote_p_caution`,
    `blockquote_title`,
    `blockquote_title_note`,
    `blockquote_title_tip`,
    `blockquote_title_important`,
    `blockquote_title_warning`,
    `blockquote_title_caution`,
    `image`,
    `ul`,
    `ol`,
    `block_katex`,
  ];
  const inlineKeys: Inline[] = [
    `listitem`,
    `codespan`,
    `link`,
    `wx_link`,
    `strong`,
    `table`,
    `thead`,
    `td`,
    `footnote`,
    `figcaption`,
    `em`,
    `inline_katex`,
  ];

  mergeProperties(newTheme.block, jsonString, blockKeys);
  mergeProperties(newTheme.inline, jsonString, inlineKeys);
  return newTheme;
}

export function getStyleString(style: ExtendedProperties): string {
  return Object.entries(style ?? {})
    .map(([key, value]) => `${key}: ${value}`)
    .join(`; `);
}

function getStyles(
  styleMapping: ThemeStyles,
  tokenName: string,
  addition: string = ``
): string {
  const dict = styleMapping[tokenName as keyof ThemeStyles];
  if (!dict) {
    return ``;
  }
  const styles = getStyleString(dict);
  return `style="${styles}${addition}"`;
}

function buildTheme(isUseIndent: boolean, theme: Theme): ThemeStyles {
  const base = toMerged(theme.base, {});
  if (isUseIndent) {
    theme.block.p = {
      "text-indent": `2em`,
      ...theme.block.p,
    };
  }
  const mergeStyles = (
    styles: Record<string, PropertiesHyphen>
  ): Record<string, ExtendedProperties> =>
    Object.fromEntries(
      Object.entries(styles).map(([ele, style]) => [ele, toMerged(base, style)])
    );
  return {
    ...mergeStyles(theme.inline),
    ...mergeStyles(theme.block),
  } as ThemeStyles;
}

const initRenderer = (options: MarkdownOptions) => {
  // 根据选项自定义主题
  let customizedTheme = options.theme;
  if (
    options.fontSize ||
    options.fontFamily ||
    options.primaryColor ||
    options.background
  ) {
    customizedTheme = customizeTheme(options.theme, {
      fontSize: options.fontSize,
      fontFamily: options.fontFamily,
      color: options.primaryColor,
      background: options.background,
    });
  }

  // 状态变量
  let footnoteIndex = 0;
  let footnotes: [number, string, string][] = [];
  let listOrderedStack: boolean[] = [];
  let listCounters: number[] = [];
  const styleMapping: ThemeStyles = buildTheme(
    options.isUseIndent,
    customizedTheme
  );

  // 辅助函数
  const styles = (tag: string, addition: string = ``): string => {
    return getStyles(styleMapping, tag, addition);
  };

  const styledContent = (
    styleLabel: string,
    content: string,
    tagName?: string
  ): string => {
    const tag = tagName ?? styleLabel;
    return `<${tag} ${/^h\d$/.test(tag) ? `data-heading="true"` : ``} ${styles(
      styleLabel
    )}>${content}</${tag}>`;
  };

  const addFootnote = (title: string, link: string): number => {
    footnotes.push([++footnoteIndex, title, link]);
    return footnoteIndex;
  };

  const buildFootnotes = (): string => {
    if (!footnotes.length) {
      return ``;
    }
    return (
      styledContent(`h4`, `引用链接`) +
      styledContent(`footnotes`, buildFootnoteArray(footnotes), `p`)
    );
  };

  const buildFootnoteArray = (
    footnotes: [number, string, string][]
  ): string => {
    return footnotes
      .map(([index, title, link]) =>
        link === title
          ? `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code>: <i style="word-break: break-all">${title}</i><br/>`
          : `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code> ${title}: <i style="word-break: break-all">${link}</i><br/>`
      )
      .join(`\n`);
  };

  const buildAddition = (): string => {
    // 获取代码块主题
    const codeTheme = options.codeBlockTheme || "github";
    const isValidTheme = codeBlockThemeList.includes(codeTheme);
    const themeUrl = isValidTheme
      ? `${codeBlockUrlPrefix}${codeTheme}.min.css`
      : `${codeBlockUrlPrefix}github.min.css`;

    return `
    <style>
      .preview-wrapper pre::before {
        position: absolute;
        top: 0;
        right: 0;
        color: #ccc;
        text-align: center;
        font-size: 0.8em;
        padding: 5px 10px 0;
        line-height: 15px;
        height: 15px;
        font-weight: 600;
      }

      /* 代码块容器样式 */
      .code__pre {
        position: relative;
        border-radius: 4px;
        border: 1px solid #e1e4e8;
        overflow-x: auto;
        background-color: #f6f8fa;
      }

      .code__pre code {
        display: block;
        padding: 1em;
        line-height: 1.45;
        font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 85%;
      }

      /* Mac 风格的代码块装饰 */
      .mac-sign {
        display: block !important;
        position: absolute;
        top: 8px;
        left: 12px;
        z-index: 1;
      }

      .mac-sign svg {
        width: 54px;
        height: 14px;
      }

      /* 当显示 Mac 装饰时，代码内容需要留出空间 */
      .code__pre:has(.mac-sign:not([hidden])) code {
        padding-top: 2.5em;
      }

      /* 美化滚动条样式 */
      * {
        scrollbar-width: thin;
        scrollbar-color: var(--md-primary-color) transparent;
      }

      /* WebKit 浏览器滚动条样式 */
      ::-webkit-scrollbar {
        width: 8px;
        height: 8px;
      }

      ::-webkit-scrollbar-track {
        background: transparent;
        border-radius: 4px;
      }

      ::-webkit-scrollbar-thumb {
        background: var(--md-primary-color);
        border-radius: 4px;
        opacity: 0.7;
      }

      ::-webkit-scrollbar-thumb:hover {
        background: #333333;
        opacity: 1;
      }

      ::-webkit-scrollbar-corner {
        background: transparent;
      }

      /* 代码块专用滚动条样式 */
      .code__pre::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      .code__pre::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 3px;
      }

      .code__pre::-webkit-scrollbar-thumb:hover {
        background: rgba(255, 255, 255, 0.5);
      }
    </style>
    
    <!-- 动态加载 highlight.js 主题 CSS -->
    <link rel="stylesheet" href="${themeUrl}">
  `;
  };

  const parseFrontMatterAndContent = (markdownText: string): ParseResult => {
    try {
      const parsed = frontMatter(markdownText);
      const yamlData = parsed.attributes;
      const markdownContent = parsed.body;
      const readingTimeResult = readingTime(markdownContent);

      return {
        yamlData: yamlData as Record<string, any>,
        markdownContent,
        readingTime: readingTimeResult,
      };
    } catch (error) {
      console.error(`Error parsing front-matter:`, error);
      return {
        yamlData: {},
        markdownContent: markdownText,
        readingTime: readingTime(markdownText),
      };
    }
  };

  const renderReadingTime = (readingTime: ReadTimeResults): string => {
    if (!options.countStatus) {
      return ``;
    }
    if (!readingTime.words) {
      return ``;
    }
    return `
      <blockquote ${styles(`blockquote`)}>
        <p ${styles(`blockquote_p`)}>字数 ${
      readingTime?.words
    }，阅读大约需 ${Math.ceil(readingTime?.minutes)} 分钟</p>
      </blockquote>
    `;
  };

  const sanitizeHtml = (html: string, primaryColor: string): string => {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const modifiedHtml = modifyHtmlStructure(
      document,
      mergeCss(document.documentElement.innerHTML)
    );

    const replacedHtml = modifiedHtml
      .replace(/([^-])top:(.*?)em/g, `$1transform: translateY($2em)`)
      .replace(/hsl\(var\(--foreground\)\)/g, `#3f3f3f`)
      .replace(/var\(--blockquote-background\)/g, `#f7f7f7`)
      .replace(/var\(--md-primary-color\)/g, primaryColor)
      .replace(/--md-primary-color:.+?;/g, ``)
      .replace(
        /<span class="nodeLabel"([^>]*)><p[^>]*>(.*?)<\/p><\/span>/g,
        `<span class="nodeLabel"$1>$2</span>`
      )
      .replace(
        /<span class="edgeLabel"([^>]*)><p[^>]*>(.*?)<\/p><\/span>/g,
        `<span class="edgeLabel"$1>$2</span>`
      );

    document.documentElement.innerHTML = replacedHtml;

    const images = document.getElementsByTagName(`img`);

    Array.from(images).forEach((image) => {
      const width = image.getAttribute(`width`)!;
      const height = image.getAttribute(`height`)!;
      image.removeAttribute(`width`);
      image.removeAttribute(`height`);
      image.style.width = width;
      image.style.height = height;
    });

    const createEmptyNode = (): HTMLElement => {
      const node = document.createElement(`p`);
      node.style.fontSize = `0`;
      node.style.lineHeight = `0`;
      node.style.margin = `0`;
      node.innerHTML = `&nbsp;`;
      return node;
    };
    // 添加空白节点用于兼容 SVG 复制
    const beforeNode = createEmptyNode();
    const afterNode = createEmptyNode();

    document.body.insertBefore(beforeNode, document.body.firstChild);
    document.body.appendChild(afterNode);

    return document.body.innerHTML;
  };

  // 创建渲染器
  const renderer: RendererObject = {
    heading({ tokens, depth }: Tokens.Heading) {
      const text = this.parser.parseInline(tokens);
      const tag = `h${depth}`;
      return styledContent(tag, text);
    },
    paragraph({ tokens }: Tokens.Paragraph): string {
      const text = this.parser.parseInline(tokens);
      const isFigureImage = text.includes(`<figure`) && text.includes(`<img`);
      const isEmpty = text.trim() === ``;
      if (isFigureImage || isEmpty) {
        return text;
      }
      return styledContent(`p`, text);
    },

    blockquote({ tokens }: Tokens.Blockquote): string {
      let text = this.parser.parse(tokens);
      text = text.replace(/<p .*?>/g, `<p ${styles(`blockquote_p`)}>`);
      return styledContent(`blockquote`, text);
    },

    code({ text, lang = `` }: Tokens.Code): string {
      if (lang.startsWith(`mermaid`)) {
        return `<pre class="mermaid">${text}</pre>`;
      }
      const langText = lang.split(` `)[0];
      const language = hljs.getLanguage(langText) ? langText : `plaintext`;
      const highlighted = hljs.highlight(text, { language }).value;

      // 根据选项决定是否显示 Mac 风格装饰
      const macDecoration = options.isMacCodeBlock
        ? `<span class="mac-sign">${macCodeSvg}</span>`
        : ``;

      const code = `<code class="language-${langText} hljs">${highlighted}</code>`;
      return `<pre class="hljs code__pre" ${styles(
        `code_pre`
      )}>${macDecoration}${code}</pre>`;
    },

    codespan({ text }: Tokens.Codespan): string {
      const escapedText = escapeHtml(text);
      return styledContent(`codespan`, escapedText, `code`);
    },

    list({ ordered, items, start = 1 }: Tokens.List) {
      listOrderedStack.push(ordered);
      listCounters.push(Number(start));

      const html = items.map((item) => this.listitem(item)).join(``);

      listOrderedStack.pop();
      listCounters.pop();

      return styledContent(ordered ? `ol` : `ul`, html);
    },

    listitem(token: Tokens.ListItem) {
      // const ordered = listOrderedStack[listOrderedStack.length - 1];
      const idx = listCounters[listCounters.length - 1]!;

      // 准备下一个
      listCounters[listCounters.length - 1] = idx + 1;

      // const prefix = ordered ? `${idx}. ` : ``;

      // 渲染内容：优先 inline，fallback 去掉 <p> 包裹
      let content: string;
      try {
        content = this.parser.parseInline(token.tokens);
      } catch {
        content = this.parser
          .parse(token.tokens)
          .replace(/^<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/, `$1`);
      }

      return styledContent(`listitem`, `${content}`, `li`);
      // return styledContent(`listitem`, `${prefix}${content}`, `li`);
    },

    image({ href, title, text }: Tokens.Image): string {
      const subText = styledContent(
        `figcaption`,
        transform(options.legend!, text, title)
      );
      const figureStyles = styles(`figure`);
      const imgStyles = styles(`image`);
      return `<figure ${figureStyles}><img ${imgStyles} src="${href}" title="${title}" alt="${text}"/>${subText}</figure>`;
    },

    link({ href, title, text, tokens }: Tokens.Link): string {
      const parsedText = this.parser.parseInline(tokens);
      if (href.startsWith(`https://mp.weixin.qq.com`)) {
        return `<a href="${href}" title="${title || text}" ${styles(
          `wx_link`
        )}>${parsedText}</a>`;
      }
      if (href === text) {
        return parsedText;
      }
      if (options.citeStatus) {
        const ref = addFootnote(title || text, href);
        return `<span ${styles(
          `link`
        )}>${parsedText}<sup>[${ref}]</sup></span>`;
      }
      return styledContent(`link`, parsedText, `span`);
    },

    strong({ tokens }: Tokens.Strong): string {
      return styledContent(`strong`, this.parser.parseInline(tokens));
    },

    em({ tokens }: Tokens.Em): string {
      return styledContent(`em`, this.parser.parseInline(tokens), `span`);
    },

    table({ header, rows }: Tokens.Table): string {
      const headerRow = header.map((cell) => this.tablecell(cell)).join(``);
      const body = rows
        .map((row) => {
          const rowContent = row.map((cell) => this.tablecell(cell)).join(``);
          return styledContent(`tr`, rowContent);
        })
        .join(``);
      return `
        <section style="padding:0 8px; max-width: 100%; overflow: auto">
          <table class="preview-table">
            <thead ${styles(`thead`)}>${headerRow}</thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `;
    },

    tablecell(token: Tokens.TableCell): string {
      const text = this.parser.parseInline(token.tokens);
      return styledContent(`td`, text);
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    hr(_: Tokens.Hr): string {
      return styledContent(`hr`, ``);
    },
  };

  // 配置 marked
  marked.use({ renderer });
  marked.use(markedSlider({ styles: styleMapping }));
  marked.use(markedAnnotation());
  marked.use(
    markedToc({
      tocTitle: "目录",
      maxDepth: 3,
    })
  );
  marked.use(
    ServerMDKatex(
      { nonStandard: true },
      styles(`inline_katex`, `;vertical-align: middle; line-height: 1;`),
      styles(
        `block_katex`,
        `;text-align: center; abc: hello; justify-items: center;`
      )
    )
  );
  marked.use(markedFootnotes());

  const render = async (markdown: string): Promise<string> => {
    // 重置状态
    footnoteIndex = 0;
    footnotes = [];
    listOrderedStack = [];
    listCounters = [];

    const { markdownContent, readingTime } =
      parseFrontMatterAndContent(markdown);

    const readingTimeHtml = renderReadingTime(readingTime);
    const markdownHtml = await marked(markdownContent);

    const footnotesHtml = buildFootnotes();
    const additionHtml = buildAddition();
    const html = readingTimeHtml + markdownHtml + footnotesHtml + additionHtml;

    const sanitizedHtml = sanitizeHtml(
      styledContent(`container`, html, `section`),
      options.primaryColor ?? `#0969da`
    );
    return sanitizedHtml;
  };

  return {
    render,
  };
};

// 导出可用的代码块主题列表
export const availableCodeBlockThemes = codeBlockThemeList;

// 根据指定选项渲染 HTML
export const renderToHtmlWithTheme = async (
  markdown: string,
  options: Partial<MarkdownOptions> = {}
): Promise<string> => {
  // 根据 markdownTheme 选项选择主题
  const selectedTheme = options.markdownTheme
    ? getTheme(options.markdownTheme)
    : defaultTheme;

  const renderer = initRenderer({
    theme: selectedTheme,
    isUseIndent: options.isUseIndent ?? true,
    legend: options.legend ?? "alt",
    citeStatus: options.citeStatus ?? true,
    countStatus: options.countStatus ?? true,
    isMacCodeBlock: options.isMacCodeBlock ?? true,
    codeBlockTheme: options.codeBlockTheme ?? "github",
    fontSize: options.fontSize,
    fontFamily: options.fontFamily,
    primaryColor: options.primaryColor,
    markdownTheme: options.markdownTheme,
    background: options.background,
  });
  return await renderer.render(markdown);
};
