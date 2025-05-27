import { NextRequest, NextResponse } from "next/server";
import nunchakuFlux from "./nunchaku-flux.json";
import { generateImageByPrompt } from "@/app/services/comfy";
import { randomInt } from "crypto";
import { uploadToAliyun } from "@/app/services/aliyun";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const batch_size = searchParams.get("batch_size") || "1";
  const width = searchParams.get("width") || "1024";
  const height = searchParams.get("height") || "1024";
  const seed = searchParams.get("seed") || randomInt(0, 1000000).toString();
  const steps = searchParams.get("steps") || "8";
  const prompt = searchParams.get("prompt");
  const lora = searchParams.get("lora");
  const lora_strength = searchParams.get("lora_strength");

  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }
  if (parseInt(batch_size) > 4) {
    return NextResponse.json(
      { error: "Batch size cannot exceed 4" },
      { status: 400 }
    );
  }

  nunchakuFlux["100"]["inputs"]["text"] = prompt;
  nunchakuFlux["92"]["inputs"]["width"] = parseInt(width);
  nunchakuFlux["92"]["inputs"]["height"] = parseInt(height);
  nunchakuFlux["92"]["inputs"]["batch_size"] = parseInt(batch_size);
  nunchakuFlux["99"]["inputs"]["noise_seed"] = parseInt(seed);
  nunchakuFlux["97"]["inputs"]["steps"] = parseInt(steps);

  if (lora) {
    nunchakuFlux["90"]["inputs"]["lora_name"] = lora;
  }
  if (lora_strength) {
    nunchakuFlux["90"]["inputs"]["lora_strength"] = parseFloat(lora_strength);
  }

  const imageBuffers = await generateImageByPrompt(nunchakuFlux);
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
