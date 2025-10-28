import { NextRequest, NextResponse } from "next/server";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const prefix = searchParams.get("prefix") || "";
    const continuationToken =
      searchParams.get("continuationToken") || undefined;

    // const bucketName = "smart-work-station";
    const bucketName = "smart-work-station";
    if (!bucketName) {
      return NextResponse.json(
        { success: false, error: "未配置 bucket" },
        { status: 500 }
      );
    }

    const ossClient = new S3Client({
      region: "cn-shanghai",
      endpoint: "https://oss-cn-shanghai.aliyuncs.com",
      credentials: {
        accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY || "",
        secretAccessKey: process.env.ALIYUN_OSS_SECRET_KEY || "",
      },
    });

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: 1000,
      ContinuationToken: continuationToken,
    });

    const response = await ossClient.send(command);

    const objects = await Promise.all(
      (response.Contents || []).map(async (obj) => ({
        key: obj.Key || "",
        size: obj.Size || 0,
        lastModified: obj.LastModified?.toISOString() || "",
        etag: obj.ETag || "",
        url: await getSignedUrl(
          ossClient,
          new GetObjectCommand({
            Bucket: bucketName,
            Key: obj.Key || "",
          }),
          {
            expiresIn: 60 * 60, // 默认1小时有效期，可根据参数修改
          }
        ),
      }))
    );

    return NextResponse.json({
      success: true,
      data: {
        objects,
        isTruncated: response.IsTruncated || false,
        nextContinuationToken: response.NextContinuationToken,
        keyCount: response.KeyCount || 0,
      },
    });
  } catch (error) {
    console.error("列出OSS对象失败:", error);
    return NextResponse.json(
      { success: false, error: "获取文件列表失败" },
      { status: 500 }
    );
  }
}
