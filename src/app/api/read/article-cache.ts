import fs from "fs";
import path from "path";
import crypto from "crypto";

// 缓存接口定义
interface CacheItem {
  data: any;
  timestamp: number;
  expiresAt: number;
  filePath: string;
}

// 内存缓存存储
const cache = new Map<string, CacheItem>();

// 缓存过期时间：一个月（30天）
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30天 毫秒

// 缓存目录
const CACHE_DIR = path.join(process.cwd(), "cache", "articles");

// 确保缓存目录存在
function ensureCacheDir() {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
}

// 生成一个稳定的缓存键
function generateCacheKey(
  url: string,
  headers: Record<string, string> = {}
): string {
  const headerKeys = Object.keys(headers).sort();
  const sortedHeaders = headerKeys.map((key) => `${key}:${headers[key]}`);
  return `${url}__${sortedHeaders.join(";")}`;
}

// 生成文件名（基于缓存键的hash）
function generateFileName(cacheKey: string): string {
  const hash = crypto.createHash("md5").update(cacheKey).digest("hex");
  return `${hash}.json`;
}

// 清理过期缓存的函数
function cleanExpiredCache() {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now > item.expiresAt) {
      // 删除过期的文件
      try {
        if (fs.existsSync(item.filePath)) {
          fs.unlinkSync(item.filePath);
        }
      } catch (error) {
        console.error(
          `Error deleting expired cache file: ${item.filePath}`,
          error
        );
      }
      cache.delete(key);
    }
  }
}

// 获取缓存
export function getFromCache(
  url: string,
  headers: Record<string, string> = {}
): any | null {
  cleanExpiredCache(); // 清理过期缓存

  const cacheKey = generateCacheKey(url, headers);
  const item = cache.get(cacheKey);
  if (item && Date.now() < item.expiresAt) {
    console.log(`Cache HIT for key: ${url}`);
    return item.data;
  }

  if (item) {
    // 缓存已过期，删除
    try {
      if (fs.existsSync(item.filePath)) {
        fs.unlinkSync(item.filePath);
      }
    } catch (error) {
      console.error(
        `Error deleting expired cache file: ${item.filePath}`,
        error
      );
    }
    cache.delete(cacheKey);
  }

  // 尝试从文件系统加载
  const fileName = generateFileName(cacheKey);
  const filePath = path.join(CACHE_DIR, fileName);

  if (fs.existsSync(filePath)) {
    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const cacheData = JSON.parse(fileContent);

      // 检查文件缓存是否过期
      if (Date.now() < cacheData.expiresAt) {
        // 重新加载到内存缓存
        cache.set(cacheKey, cacheData);
        console.log(`Cache HIT from file for key: ${cacheKey}`);
        return cacheData.data;
      } else {
        // 文件缓存过期，删除文件
        fs.unlinkSync(filePath);
        console.log(`Cache EXPIRED and deleted for key: ${cacheKey}`);
      }
    } catch (error) {
      console.error(`Error reading cache file: ${filePath}`, error);
      // 如果文件损坏，删除它
      try {
        fs.unlinkSync(filePath);
      } catch (deleteError) {
        console.error(
          `Error deleting corrupted cache file: ${filePath}`,
          deleteError
        );
      }
    }
  }

  console.log(`Cache MISS for key: ${cacheKey}`);
  return null;
}

// 设置缓存
export function setCache(
  url: string,
  data: any,
  headers: Record<string, string> = {}
) {
  ensureCacheDir();

  const cacheKey = generateCacheKey(url, headers);
  const now = Date.now();
  const fileName = generateFileName(cacheKey);
  const filePath = path.join(CACHE_DIR, fileName);

  const item: CacheItem = {
    data,
    timestamp: now,
    expiresAt: now + CACHE_DURATION,
    filePath,
  };

  try {
    // 保存到文件
    fs.writeFileSync(filePath, JSON.stringify(item, null, 2), "utf-8");
    // 保存到内存缓存
    cache.set(cacheKey, item);
    console.log(
      `Cache SET for key: ${url}, expires at: ${new Date(
        item.expiresAt
      ).toISOString()}`
    );
    console.log(`Saved to file: ${filePath}`);
  } catch (error) {
    console.error(`Error saving cache file: ${filePath}`, error);
    // 如果文件保存失败，至少保存到内存
    cache.set(cacheKey, item);
  }
}

// 定期清理过期缓存（每小时执行一次）
setInterval(cleanExpiredCache, 60 * 60 * 1000);
