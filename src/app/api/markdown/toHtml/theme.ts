import { Theme } from "./markdown";
import {
  defaultTheme,
  githubTheme,
  minimalTheme,
  academicTheme,
  techTheme,
  blogTheme,
} from "./themes";

export interface StyleMap {
  [key: string]: string;
}

export interface BaseTheme {
  [key: string]: string;
}

// Markdown 主题定义
export const MarkdownThemes = {
  // 默认经典主题
  default: {
    name: "经典默认",
    description: "简洁的黑白主题，适合正式文档",
  },
  // GitHub 风格主题
  github: {
    name: "GitHub 风格",
    description: "仿 GitHub README 样式",
  },
  // 简约现代主题
  minimal: {
    name: "简约现代",
    description: "现代化的简约设计",
  },
  // 学术论文主题
  academic: {
    name: "学术论文",
    description: "适合学术写作和论文",
  },
  // 技术文档主题
  tech: {
    name: "技术文档",
    description: "专为技术文档设计",
  },
  // 博客主题
  blog: {
    name: "博客文章",
    description: "适合博客和个人写作",
  },
};

// 主题映射
export const ThemeMap = {
  default: defaultTheme,
  github: githubTheme,
  minimal: minimalTheme,
  academic: academicTheme,
  tech: techTheme,
  blog: blogTheme,
};

// 获取主题函数
export function getTheme(themeName: string): Theme {
  return ThemeMap[themeName as keyof typeof ThemeMap] || defaultTheme;
}

export { defaultTheme };
