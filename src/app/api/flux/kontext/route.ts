import { uploadToAliyun } from "@/app/services/aliyun";
import { NextRequest } from "next/server";

// 文件大小限制（10MB）
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// Prompt 长度限制
const MAX_PROMPT_LENGTH = 1000;
const MIN_PROMPT_LENGTH = 5;

// 支持的图片格式
const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export async function POST(request: NextRequest) {
  // 创建 Server-Sent Events 流
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // 定义发送事件的辅助函数
      const sendEvent = (type: string, data: any) => {
        const eventData = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(eventData));
      };

      // 异步处理逻辑
      (async () => {
        try {
          sendEvent("progress", {
            stage: "validation",
            message: "开始验证请求参数...",
          });

          // 检查是否有文件上传
          const formData = await request.formData();
          const file = formData.get("file") as File;
          const prompt = formData.get("prompt") as string;
          const isMax = formData.get("isMax") === "true";

          // 基本参数检查
          if (!file) {
            sendEvent("error", { error: "未找到上传文件" });
            controller.close();
            return;
          }

          if (!prompt) {
            sendEvent("error", { error: "提示词是必需的" });
            controller.close();
            return;
          }

          // 文件大小检查
          if (file.size > MAX_FILE_SIZE) {
            sendEvent("error", {
              error: `文件大小超出限制，最大允许 ${
                MAX_FILE_SIZE / 1024 / 1024
              }MB，当前文件大小 ${(file.size / 1024 / 1024).toFixed(2)}MB`,
            });
            controller.close();
            return;
          }

          // 文件类型检查
          if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
            sendEvent("error", {
              error: `不支持的文件类型: ${
                file.type
              }，支持的格式: ${SUPPORTED_IMAGE_TYPES.join(", ")}`,
            });
            controller.close();
            return;
          }

          // Prompt 长度检查
          if (prompt.length < MIN_PROMPT_LENGTH) {
            sendEvent("error", {
              error: `提示词太短，至少需要 ${MIN_PROMPT_LENGTH} 个字符`,
            });
            controller.close();
            return;
          }

          if (prompt.length > MAX_PROMPT_LENGTH) {
            sendEvent("error", {
              error: `提示词太长，最多允许 ${MAX_PROMPT_LENGTH} 个字符，当前 ${prompt.length} 个字符`,
            });
            controller.close();
            return;
          }

          console.log(
            `[Flux Kontext] 请求开始 - 文件: ${file.name} (${(
              file.size / 1024
            ).toFixed(2)}KB), 提示词长度: ${prompt.length}`
          );

          sendEvent("progress", {
            stage: "upload",
            message: "正在上传原始图片到 OSS...",
            fileInfo: {
              name: file.name,
              size: file.size,
              type: file.type,
            },
          });

          // convert file to Base64 encoded image to use as reference
          const image_base64 = `data:${file.type};base64,${Buffer.from(
            await file.arrayBuffer()
          ).toString("base64")}`;

          const FLUX_API_URL = process.env.FLUX_API_URL;
          const BFL_API_KEY = process.env.BFL_API_KEY;

          if (!BFL_API_KEY) {
            sendEvent("error", { error: "BFL API 密钥未配置" });
            controller.close();
            return;
          }

          sendEvent("progress", {
            stage: "flux_api",
            message: "正在调用 Flux Kontext Pro API...",
          });

          const url = isMax
            ? `${FLUX_API_URL}/flux-kontext-max`
            : `${FLUX_API_URL}/flux-kontext-pro`;

          // 调用 Flux Kontext Pro API
          const fluxResponse = await fetch(url, {
            method: "POST",
            headers: {
              accept: "application/json",
              "x-key": BFL_API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: prompt,
              input_image: image_base64,
              prompt_upsampling: true,
              output_format: "png",
              safety_tolerance: 2,
            }),
          });

          if (!fluxResponse.ok) {
            const errorText = await fluxResponse.text();
            console.error(
              `[Flux Kontext] Flux API 错误: ${fluxResponse.status} - ${errorText}`
            );
            sendEvent("error", { error: `Flux API 错误: ${errorText}` });
            controller.close();
            return;
          }

          const fluxResult = await fluxResponse.json();
          const requestId = fluxResult.id;

          if (!requestId) {
            sendEvent("error", { error: "Flux API 未返回请求 ID" });
            controller.close();
            return;
          }

          console.log(`[Flux Kontext] 获得请求 ID: ${requestId}`);
          sendEvent("progress", {
            stage: "processing",
            message: "图片生成中，请耐心等待...",
            requestId: requestId,
          });

          // 轮询检查结果
          const maxAttempts = 60; // 最多轮询2分钟 (60 * 1.5秒)
          let attempts = 0;

          while (attempts < maxAttempts) {
            await new Promise((resolve) => setTimeout(resolve, 1500)); // 等待1.5秒
            attempts++;

            // 添加查询参数
            const resultUrl = new URL(`${FLUX_API_URL}/get_result`);
            resultUrl.searchParams.append("id", requestId);

            const resultResponse = await fetch(resultUrl.toString(), {
              method: "GET",
              headers: {
                accept: "application/json",
                "x-key": BFL_API_KEY,
              },
            });

            if (!resultResponse.ok) {
              console.error(
                `[Flux Kontext] 结果检查失败: ${resultResponse.status}`
              );
              sendEvent("progress", {
                stage: "processing",
                message: `检查结果失败，重试中... (${attempts}/${maxAttempts})`,
                attempt: attempts,
              });
              continue;
            }

            const result = await resultResponse.json();
            const status = result.status;

            console.log(
              `[Flux Kontext] 状态: ${status}, 尝试: ${attempts}/${maxAttempts}`
            );

            sendEvent("progress", {
              stage: "processing",
              message: `处理状态: ${status} (${attempts}/${maxAttempts})`,
              status: status,
              attempt: attempts,
            });

            if (status === "Ready") {
              const resultImageUrl = result.result?.sample;
              if (resultImageUrl) {
                sendEvent("progress", {
                  stage: "download",
                  message: "正在下载生成的图片...",
                });

                // 下载生成的图片
                const imageResponse = await fetch(resultImageUrl);
                if (!imageResponse.ok) {
                  sendEvent("error", { error: "下载生成图片失败" });
                  controller.close();
                  return;
                }

                const imageBuffer = Buffer.from(
                  await imageResponse.arrayBuffer()
                );

                sendEvent("progress", {
                  stage: "upload_result",
                  message: "正在上传结果到 OSS...",
                });

                // 生成结果图片的文件名
                const resultFileName = `flux/kontext/results/${Date.now()}-result.jpg`;

                // 上传结果图片到阿里云OSS
                const resultUpload = await uploadToAliyun(
                  imageBuffer,
                  resultFileName
                );

                console.log(
                  `[Flux Kontext] 处理完成 - OSS路径: ${resultUpload.filePath}`
                );

                sendEvent("complete", {
                  success: true,
                  data: {
                    imageUrl: resultImageUrl, // 原始Flux返回的URL
                    ossImageUrl: resultUpload.fileUrl, // OSS上的URL
                    ossImagePath: resultUpload.filePath, // OSS文件路径
                    prompt: prompt,
                    requestId: requestId,
                    processingTime: attempts * 1.5, // 处理时间（秒）
                  },
                });

                controller.close();
                return;
              } else {
                sendEvent("error", { error: "响应中未找到结果图片 URL" });
                controller.close();
                return;
              }
            } else if (status === "Pending" || status === "Queued") {
              // 继续轮询
              continue;
            } else {
              // 错误状态
              console.error(`[Flux Kontext] 处理失败，状态: ${status}`, result);
              sendEvent("error", {
                error: `Flux 处理失败，状态: ${status}`,
                details: result,
              });
              controller.close();
              return;
            }
          }

          // 超时
          console.error(`[Flux Kontext] 请求超时 - ID: ${requestId}`);
          sendEvent("error", { error: "请求超时，请稍后重试" });
          controller.close();
        } catch (error) {
          console.error("[Flux Kontext] API 错误:", error);
          sendEvent("error", {
            error: error instanceof Error ? error.message : "内部服务器错误",
          });
          controller.close();
        }
      })();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
