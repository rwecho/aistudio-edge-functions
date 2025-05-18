import crypto from "crypto";

/**
 * 生成用于OSS访问的授权头
 * @param secretKey 加密密钥，应与环境变量 OSS_ACCESS_SECRET_KEY 一致
 * @returns 格式为 "iv:encryptedData" 的授权头值，用于 X-OSS-Auth 请求头
 */
export function generateOSSAuthHeader(secretKey: string): string {
  try {
    // 生成随机IV
    const iv = crypto.randomBytes(16);

    // 使用与解密相同的密钥派生方法
    const key = crypto
      .createHash("sha256")
      .update(secretKey)
      .digest()
      .subarray(0, 32);

    // 创建加密器
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);

    // 要加密的数据，应包含 'oss-access' 字符串以通过验证
    const timestamp = Date.now();
    const dataToEncrypt = `oss-access:${timestamp}`;

    // 加密数据
    let encrypted = cipher.update(dataToEncrypt, "utf8");
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    // 组合IV和加密数据，以十六进制字符串格式返回
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
  } catch (error) {
    console.error("生成OSS授权头失败:", error);
    throw new Error("生成授权失败");
  }
}

/**
 * 生成加密授权头的客户端示例
 * @returns 包含生成授权头的示例代码
 */
export function getClientUsageExample(): string {
  return `
// 客户端使用示例：
// 1. 安装crypto-js: npm install crypto-js
import CryptoJS from 'crypto-js';

function generateClientOSSAuth(secretKey) {
  // 生成随机IV
  const iv = CryptoJS.lib.WordArray.random(16);
  
  // 派生密钥
  const key = CryptoJS.SHA256(secretKey).toString().substring(0, 64);
  const keyHex = CryptoJS.enc.Hex.parse(key);
  
  // 加密数据
  const timestamp = Date.now();
  const dataToEncrypt = \`oss-access:\${timestamp}\`;
  
  // 使用AES-256-CBC加密
  const encrypted = CryptoJS.AES.encrypt(
    dataToEncrypt,
    keyHex,
    { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
  );
  
  // 组合成授权头
  const authHeader = \`\${CryptoJS.enc.Hex.stringify(iv)}:\${encrypted.ciphertext.toString(CryptoJS.enc.Hex)}\`;
  return authHeader;
}

// 然后在API请求中使用
fetch('/api/oss/path/to/file', {
  headers: {
    'X-OSS-Auth': generateClientOSSAuth('your-secret-key-here')
  }
})
.then(response => response.json())
.then(data => console.log(data));
`;
}

/**
 * 测试授权头生成和验证
 * 用于确保加密和解密逻辑正常工作
 */
export function testAuthHeaderEncryptDecrypt(secretKey: string): boolean {
  try {
    // 生成授权头
    const authHeader = generateOSSAuthHeader(secretKey);

    // 解密验证 - 与路由中的验证函数相同
    const parts = authHeader.split(":");
    if (parts.length !== 2) return false;

    const [iv, encryptedData] = parts;
    const ivBuffer = Buffer.from(iv, "hex");
    const encryptedBuffer = Buffer.from(encryptedData, "hex");

    const decipher = crypto.createDecipheriv(
      "aes-256-cbc",
      crypto.createHash("sha256").update(secretKey).digest().subarray(0, 32),
      ivBuffer
    );

    // 解密数据
    let decrypted = decipher.update(encryptedBuffer);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // 验证解密后的数据是否包含 "oss-access"
    return decrypted.toString("utf8").includes("oss-access");
  } catch (error) {
    console.error("测试授权头失败:", error);
    return false;
  }
}
