import { NextResponse } from "next/server";
import lora from "./lora.json";
import { env } from "process";

export async function GET() {
  for (const item of lora) {
    item.thumbnail = env.NEXT_PUBLIC_API_URL + item.thumbnail;
  }
  return NextResponse.json(lora, { status: 200 });
}
