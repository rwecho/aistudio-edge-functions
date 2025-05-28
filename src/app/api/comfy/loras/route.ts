import { NextResponse } from "next/server";
import lora from "./lora.json";
import { env } from "process";

export async function GET() {
  const items = [];
  for (const item of lora) {
    items.push({
      ...item,
      thumbnail: env.NEXT_PUBLIC_API_URL + item.thumbnail,
    });
  }

  return NextResponse.json(items, { status: 200 });
}
