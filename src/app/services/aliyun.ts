import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// 创建阿里云 OSS 客户端
export function createOSSClient() {
  return new S3Client({
    region: process.env.ALIYUN_OSS_REGION || "",
    endpoint: process.env.ALIYUN_OSS_ENDPOINT || "",
    credentials: {
      accessKeyId: process.env.ALIYUN_OSS_ACCESS_KEY || "",
      secretAccessKey: process.env.ALIYUN_OSS_SECRET_KEY || "",
    },
  });
}

// 上传文件到阿里云 OSS
export async function uploadToAliyun(fileBuffer: Buffer, filePath: string) {
  try {
    const client = createOSSClient();
    const result = await client.send(
      new PutObjectCommand({
        Bucket: process.env.ALIYUN_OSS_BUCKET_NAME,
        Key: filePath,
        Body: fileBuffer,
      })
    );

    // 检查上传是否成功
    if (result.$metadata.httpStatusCode !== 200) {
      throw new Error("上传文件失败");
    }

    return {
      filePath,
      fileUrl: await getAliyunFileUrl(filePath),
    };
  } catch (error) {
    console.error("上传到阿里云OSS失败:", error);
    throw new Error("文件上传失败");
  }
}

// 获取文件url
export async function getAliyunFileUrl(
  filePath: string,
  expiresIn: number = 60 * 60
): Promise<string> {
  try {
    const client = createOSSClient();
    // 生成签名URL
    const url = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: process.env.ALIYUN_OSS_BUCKET_NAME,
        Key: filePath,
      }),
      {
        expiresIn, // 默认1小时有效期，可根据参数修改
      }
    );

    return url;
  } catch (error) {
    console.error("获取阿里云OSS文件URL失败:", error);
    throw new Error("获取文件URL失败");
  }
}

// 从阿里云 OSS 删除文件
export async function deleteFromAliyun(filePath: string): Promise<void> {
  try {
    const client = createOSSClient();
    await client.send(
      new DeleteObjectCommand({
        Bucket: process.env.ALIYUN_OSS_BUCKET_NAME,
        Key: filePath,
      })
    );
  } catch (error) {
    console.error("从阿里云OSS删除文件失败:", error);
    throw new Error("文件删除失败");
  }
}
