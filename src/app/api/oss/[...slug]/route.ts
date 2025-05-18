import { NextRequest, NextResponse } from "next/server";
import { getAliyunFileUrl } from "@/app/services/aliyun";
// import crypto from "crypto";

// // 验证请求头中的密钥
// function verifyAuthKey(authHeader: string | null): boolean {
//   if (!authHeader) return false;

//   const secretKey = process.env.OSS_ACCESS_SECRET_KEY;
//   if (!secretKey) {
//     console.error("未配置 OSS_ACCESS_SECRET_KEY 环境变量");
//     return false;
//   }

//   try {
//     // 使用AES-256-CBC进行解密验证
//     const parts = authHeader.split(":");
//     if (parts.length !== 2) return false;

//     const [iv, encryptedData] = parts;
//     const ivBuffer = Buffer.from(iv, "hex");
//     const encryptedBuffer = Buffer.from(encryptedData, "hex");

//     const decipher = crypto.createDecipheriv(
//       "aes-256-cbc",
//       crypto.createHash("sha256").update(secretKey).digest().subarray(0, 32),
//       ivBuffer
//     );

//     // 解密数据
//     let decrypted = decipher.update(encryptedBuffer);
//     decrypted = Buffer.concat([decrypted, decipher.final()]);

//     // 验证解密后的数据是否为预期的值
//     // 这里可以根据需求自定义验证逻辑，例如检查时间戳是否过期
//     // 目前简单验证解密后的数据包含 "oss-access" 字符串
//     return decrypted.toString("utf8").includes("oss-access");
//   } catch (error) {
//     console.error("验证密钥失败:", error);
//     return false;
//   }
// }

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  try {
    // 验证授权密钥
    // const authHeader = request.headers.get("X-OSS-Auth");
    // if (!verifyAuthKey(authHeader)) {
    //   return NextResponse.json(
    //     { success: false, error: "无访问权限" },
    //     { status: 401 }
    //   );
    // }

    const { slug } = await params;

    // 从URL路径中提取文件路径
    const path = slug.join("/");

    // 7天有效期（秒）
    const SEVEN_DAYS_IN_SECONDS = 3 * 60 * 60; // 修正为7天

    // 获取具有7天有效期的签名URL
    const signedUrl = await getAliyunFileUrl(path, SEVEN_DAYS_IN_SECONDS);
    return NextResponse.redirect(signedUrl);
  } catch (error) {
    console.error("获取OSS文件URL失败:", error);
    return NextResponse.json(
      { success: false, error: "无法获取文件访问地址" },
      { status: 500 }
    );
  }
}
