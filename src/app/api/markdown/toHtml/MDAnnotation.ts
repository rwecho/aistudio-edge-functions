import { MarkedExtension, Tokens } from "marked";

/**
 * A marked extension to support ruby annotations (furigana/pinyin).
 * Syntax: {汉字|拼音} or {text|annotation}
 * Renders as HTML ruby element with annotation text above the base text.
 */
export default function markedAnnotation(): MarkedExtension {
  return {
    extensions: [
      {
        name: `rubyAnnotation`,
        level: `inline`,
        start(src: string) {
          return src.match(/\{[^}]*\|[^}]*\}/)?.index;
        },
        tokenizer(src: string) {
          const rule = /^\{([^}|]+)\|([^}]+)\}/;
          const match = src.match(rule);
          if (match) {
            return {
              type: `rubyAnnotation`,
              raw: match[0],
              baseText: match[1],
              annotationText: match[2],
            };
          }
          return undefined;
        },
        renderer(token: Tokens.Generic) {
          const { baseText, annotationText } = token;

          if (!baseText || !annotationText) {
            return ``;
          }

          // 使用HTML ruby元素来实现注音效果
          // ruby元素是专门为东亚文字注音设计的标准HTML元素
          return `<ruby style="font-size: inherit; line-height: 1;">${baseText}<rt style="font-size: 0.7em; color: #666; font-weight: normal;">${annotationText}</rt></ruby>`;
        },
      },
    ],
  };
}
