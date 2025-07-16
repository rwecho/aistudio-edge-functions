import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const ARTICLES_DIR = path.join(process.cwd(), "articles");

const getMimeType = (filePath: string) => {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".webp":
      return "image/webp";
    case ".svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ md5: string; image: string[] }> }
) {
  const { md5, image } = await params;
  const imageName = image.join("/");
  const imagePath = path.join(ARTICLES_DIR, md5, imageName);

  if (!fs.existsSync(imagePath)) {
    return new NextResponse("Not found", { status: 404 });
  }

  try {
    const fileBuffer = fs.readFileSync(imagePath);
    const mimeType = getMimeType(imagePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": mimeType,
      },
    });
  } catch (error) {
    console.error(`Error reading image file: ${imagePath}`, error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
