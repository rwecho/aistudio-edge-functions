import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import ArticleClientView from "./ArticleClientView";
import { renderToHtmlWithTheme } from "@/app/api/markdown/toHtml/markdown";
import { postProcessImages } from "@/app/api/read/v2/article-process";

const ARTICLES_DIR = path.join(process.cwd(), "articles");

async function getArticleData(md5: string) {
  const articleDir = path.join(ARTICLES_DIR, md5);
  const articlePath = path.join(articleDir, "index.md");

  if (!fs.existsSync(articlePath)) {
    return null;
  }

  const markdown = postProcessImages(
    md5,
    fs.readFileSync(articlePath, "utf-8")
  );

  const html = await renderToHtmlWithTheme(markdown, {
    codeBlockTheme: "github",
    background: "graph",
  });

  return html;
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ md5: string }>;
}) {
  const html = await getArticleData((await params).md5);

  if (!html) {
    notFound();
  }

  return <ArticleClientView html={html} tocItems={[]} />;
}
