import { z } from "zod";
import { WeChatArticleSchema } from "./schemas";

type WeChatArticleData = z.infer<typeof WeChatArticleSchema>;
