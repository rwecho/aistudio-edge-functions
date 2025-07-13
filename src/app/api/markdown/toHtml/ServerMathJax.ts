import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";

// 初始化 MathJax
const adaptor = liteAdaptor();
RegisterHTMLHandler(adaptor);

const tex = new TeX({
  packages: AllPackages,
  inlineMath: [
    ["$", "$"],
    ["\\(", "\\)"],
  ],
  displayMath: [
    ["$$", "$$"],
    ["\\[", "\\]"],
  ],
  processEscapes: true,
});

const svg = new SVG({
  fontCache: "local",
  internalSpeechTitles: false,
  exFactor: 0.5,
  displayAlign: "center",
  displayIndent: "0",
});

const html = mathjax.document("", { InputJax: tex, OutputJax: svg });

/**
 * 服务器端渲染数学公式为 SVG
 * @param latex LaTeX 数学公式
 * @param display 是否为块级显示模式
 * @returns SVG 字符串
 */
export function renderMathToSvg(
  latex: string,
  display: boolean = false
): string {
  try {
    // 创建数学节点
    const node = html.convert(latex, {
      display: display,
      em: 16,
      ex: 8,
      containerWidth: 1200,
    });

    return adaptor.innerHTML(node);
  } catch (error) {
    console.error("MathJax rendering error:", error);
    // 如果渲染失败，返回原始文本
    return `<code>${latex}</code>`;
  }
}
