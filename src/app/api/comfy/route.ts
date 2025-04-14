import { NextRequest, NextResponse } from "next/server";
import flux from "./flux.json";
import { generateImageByPrompt } from "@/app/services/comfy";
import { randomInt } from "crypto";
import { uploadToAliyun } from "@/app/services/aliyun";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const batch_size = searchParams.get("batch_size") || "1";
  const width = searchParams.get("width") || "1024";
  const height = searchParams.get("height") || "1024";
  const seed = searchParams.get("seed") || randomInt(0, 1000000).toString();
  const steps = searchParams.get("steps") || "20";
  const prompt = searchParams.get("prompt");

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }
  if (parseInt(batch_size) > 4) {
    return NextResponse.json(
      { error: "Batch size cannot exceed 4" },
      { status: 400 }
    );
  }

  flux["6"]["inputs"]["text"] = prompt;
  flux["27"]["inputs"]["width"] = parseInt(width);
  flux["27"]["inputs"]["height"] = parseInt(height);
  flux["27"]["inputs"]["batch_size"] = parseInt(batch_size);
  flux["31"]["inputs"]["seed"] = parseInt(seed);
  flux["31"]["inputs"]["steps"] = parseInt(steps);

  const imageBuffers = await generateImageByPrompt(flux);
  if (!imageBuffers || imageBuffers.length === 0) {
    return NextResponse.json({ error: "No images generated" }, { status: 500 });
  }
  const uploadPromises = imageBuffers.map(async (imageBuffer) => {
    const uploadResult = await uploadToAliyun(
      Buffer.from(imageBuffer),
      `comfy/${Date.now()}.png`
    );
    return uploadResult;
  });
  const imageKeys = await Promise.all(uploadPromises);
  return NextResponse.json(imageKeys, { status: 200 });
}
