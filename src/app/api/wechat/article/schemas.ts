import z from "zod";

// Zod 校验模式
export const WeChatArticleSchema = z.object({
  title: z
    .string()
    .min(1, "文章标题不能为空")
    .max(128, "文章标题不能超过128个字符"),
  content: z.string().min(1, "文章内容不能为空"),
  author: z.string().max(20, "作者名称不能超过20个字符"),
  digest: z.string().max(120, "摘要不能超过120个字符"),
  content_source_url: z.url("原文链接格式不正确"),
  need_open_comment: z.number(),
  thumb_url: z.url("缩略图链接格式不正确"),
});
