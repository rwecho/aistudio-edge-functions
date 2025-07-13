import { renderMathToSvg } from "./ServerMathJax";

const inlineRule =
  /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1(?=[\s?!.,:？！。，：]|$)/;
const inlineRuleNonStandard =
  /^(\${1,2})(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\1/; // Non-standard, even if there are no spaces before and after $ or $$, try to parse

const blockRule =
  /^\s{0,3}(\${1,2})[ \t]*\n([\s\S]+?)\n\s{0,3}\1[ \t]*(?:\n|$)/;

function createServerRenderer(
  display: boolean,
  inlineStyle: string,
  blockStyle: string
) {
  return (token: any) => {
    const svg = renderMathToSvg(token.text, display);

    // 更温和的样式应用，避免破坏 SVG 渲染
    const styledSvg = svg.replace(
      "<svg",
      `<svg style="max-width: 100%; height: auto; vertical-align: middle;"`
    );

    if (!display) {
      return `<span ${inlineStyle}>${styledSvg}</span>`;
    }

    return `<div ${blockStyle}>${styledSvg}</div>`;
  };
}

function inlineKatex(options: any, renderer: any) {
  const nonStandard = options && options.nonStandard;
  const ruleReg = nonStandard ? inlineRuleNonStandard : inlineRule;
  return {
    name: `inlineKatex`,
    level: `inline`,
    start(src: string) {
      let index;
      let indexSrc = src;

      while (indexSrc) {
        index = indexSrc.indexOf(`$`);
        if (index === -1) {
          return;
        }
        const f = nonStandard
          ? index > -1
          : index === 0 || indexSrc.charAt(index - 1) === ` `;
        if (f) {
          const possibleKatex = indexSrc.substring(index);

          if (possibleKatex.match(ruleReg)) {
            return index;
          }
        }

        indexSrc = indexSrc.substring(index + 1).replace(/^\$+/, ``);
      }
    },
    tokenizer(src: string) {
      const match = src.match(ruleReg);
      if (match) {
        return {
          type: `inlineKatex`,
          raw: match[0],
          text: match[2].trim(),
          displayMode: match[1].length === 2,
        };
      }
    },
    renderer,
  };
}

function blockKatex(options: any, renderer: any) {
  return {
    name: `blockKatex`,
    level: `block`,
    tokenizer(src: string) {
      const match = src.match(blockRule);
      if (match) {
        return {
          type: `blockKatex`,
          raw: match[0],
          text: match[2].trim(),
          displayMode: match[1].length === 2,
        };
      }
    },
    renderer,
  };
}

export function ServerMDKatex(
  options: any,
  inlineStyle: string,
  blockStyle: string
) {
  return {
    extensions: [
      inlineKatex(
        options,
        createServerRenderer(false, inlineStyle, blockStyle)
      ),
      blockKatex(options, createServerRenderer(true, inlineStyle, blockStyle)),
    ],
  };
}
