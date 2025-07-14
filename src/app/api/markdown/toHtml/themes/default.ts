import { Theme } from "../markdown";

export const defaultTheme: Theme = {
  base: {
    "--md-primary-color": `#000000`,
    "text-align": `left`,
    "line-height": `1.75`,
  },
  block: {
    container: {
      "line-height": `1.75`,
      color: "#595959",
      "font-family":
        "Optima-Regular, Optima, PingFangTC-Light, PingFangSC-light, PingFangTC-light",
      "letter-spacing": "2px",
      "background-image": "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: "16px 8px",
    },
    // 一级标题
    h1: {
      display: `table`,
      padding: `0 1em`,
      "border-bottom": `2px solid var(--md-primary-color)`,
      margin: `2em auto 1em`,
      color: `hsl(var(--foreground))`,
      "font-size": `1.2em`,
      "font-weight": `bold`,
      "text-align": `center`,
    },

    // 二级标题
    h2: {
      display: `table`,
      padding: `0 0.2em`,
      margin: `4em auto 2em`,
      color: `#fff`,
      background: `var(--md-primary-color)`,
      "font-size": `1.2em`,
      "font-weight": `bold`,
      "text-align": `center`,
    },

    // 三级标题
    h3: {
      "padding-left": `8px`,
      "border-left": `3px solid var(--md-primary-color)`,
      margin: `2em 8px 0.75em 0`,
      color: `hsl(var(--foreground))`,
      "font-size": `1.1em`,
      "font-weight": `bold`,
      "line-height": `1.2`,
    },

    // 四级标题
    h4: {
      margin: `2em 8px 0.5em`,
      color: `var(--md-primary-color)`,
      "font-size": `1em`,
      "font-weight": `bold`,
    },

    // 五级标题
    h5: {
      margin: `1.5em 8px 0.5em`,
      color: `var(--md-primary-color)`,
      "font-size": `1em`,
      "font-weight": `bold`,
    },

    // 六级标题
    h6: {
      margin: `1.5em 8px 0.5em`,
      "font-size": `1em`,
      color: `var(--md-primary-color)`,
    },

    // 段落
    p: {
      margin: `1.5em 8px`,
      "letter-spacing": `0.1em`,
      color: `hsl(var(--foreground))`,
    },

    // 引用
    blockquote: {
      "font-style": `normal`,
      padding: `1em`,
      "border-left": `4px solid var(--md-primary-color)`,
      "border-radius": `6px`,
      color: `rgba(0,0,0,0.5)`,
      background: `var(--blockquote-background)`,
      "margin-bottom": `1em`,
    },

    // 引用内容
    blockquote_p: {
      display: `block`,
      "font-size": `1em`,
      "letter-spacing": `0.1em`,
      color: `hsl(var(--foreground))`,
    },

    blockquote_note: {},
    blockquote_tip: {},
    blockquote_info: {},
    blockquote_important: {},
    blockquote_warning: {},
    blockquote_caution: {},
    blockquote_title: {},
    blockquote_title_note: {},
    blockquote_title_tip: {},
    blockquote_title_info: {},
    blockquote_title_important: {},
    blockquote_title_warning: {},
    blockquote_title_caution: {},
    blockquote_p_note: {},
    blockquote_p_tip: {},
    blockquote_p_info: {},
    blockquote_p_important: {},
    blockquote_p_warning: {},
    blockquote_p_caution: {},

    // 代码
    code_pre: {
      "font-size": `14px`,
      "overflow-x": `auto`,
      color: `hsl(var(--foreground))`,
    },

    code: {
      "font-family": `Menlo, Operator Mono, Consolas, Monaco, monospace`,
      "border-radius": `3px`,
      color: `hsl(var(--foreground))`,
      background: `var(--inline-code-background)`,
      "font-size": `14px`,
      "word-break": `break-all`,
    },

    // 图片
    image: {
      "max-width": `100%`,
      "border-radius": `6px`,
      display: `block`,
      margin: `20px auto`,
    },

    // 有序列表
    ol: {
      "margin-left": `0`,
      "padding-left": `1em`,
      color: `hsl(var(--foreground))`,
    },

    // 无序列表
    ul: {
      "margin-left": `0`,
      "padding-left": `1em`,
      "list-style": `circle`,
      color: `hsl(var(--foreground))`,
    },

    footnotes: {
      margin: `0`,
      padding: `0`,
    },

    figure: {
      margin: `0`,
      padding: `0`,
    },

    hr: {
      border: `1px solid #f0f0f0`,
      margin: `2em 0`,
    },

    block_katex: {
      "overflow-x": `auto`,
      display: `flex`,
      "justify-content": `center`,
      margin: `1em 0`,
    },
  },
  inline: {
    listitem: {
      "text-align": `left`,
      color: `hsl(var(--foreground))`,
      "font-size": `14px`,
      "font-weight": `400`,
      "line-height": `1.5`,
      margin: `10px 0`,
    },

    codespan: {
      "font-family": `Menlo, Operator Mono, Consolas, Monaco, monospace`,
      "border-radius": `3px`,
      color: `hsl(var(--foreground))`,
      background: `var(--inline-code-background)`,
      "font-size": `14px`,
      "word-break": `break-all`,
    },

    // 链接
    link: {
      color: `var(--md-primary-color)`,
      "font-weight": `400`,
      "text-decoration": `none`,
      "border-bottom": `1px solid var(--md-primary-color)`,
    },

    wx_link: {
      color: `#576b95`,
      "text-decoration": `none`,
    },

    // 字体加粗样式
    strong: {
      color: `var(--md-primary-color)`,
      "font-weight": `bold`,
      "font-size": `inherit`,
    },

    table: {
      "border-collapse": `collapse`,
      "text-align": `center`,
      margin: `1em 8px`,
      color: `hsl(var(--foreground))`,
    },

    thead: {
      background: `rgba(0, 0, 0, 0.05)`,
      "font-weight": `bold`,
      color: `hsl(var(--foreground))`,
    },

    td: {
      border: `1px solid #dfdfdf`,
      padding: `0.25em 0.5em`,
      color: `#3f3f3f`,
      "word-break": `keep-all`,
    },

    footnote: {
      "font-size": `12px`,
      color: `hsl(var(--foreground))`,
    },

    figcaption: {
      "text-align": `center`,
      color: `#888`,
      "font-size": `0.8em`,
    },

    em: {
      "font-style": `italic`,
      color: `hsl(var(--foreground))`,
    },

    inline_katex: {
      display: `inline-flex`,
      "max-width": `100%`,
      "overflow-x": `auto`,
      "padding-bottom": `5px`,
      "vertical-align": `middle`,
    },
  },
};
