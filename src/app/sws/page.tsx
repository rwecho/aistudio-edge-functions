"use client";

import { useEffect, useState } from "react";

interface OSSObject {
  key: string;
  size: number;
  lastModified: string;
  etag: string;
  url: string;
}

interface OSSListResponse {
  success: boolean;
  data?: {
    objects: OSSObject[];
    isTruncated: boolean;
    nextContinuationToken?: string;
    keyCount: number;
  };
  error?: string;
}

export default function OSSBrowser() {
  const [objects, setObjects] = useState<OSSObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prefix, setPrefix] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const fetchObjects = async (searchPrefix: string = "") => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchPrefix) {
        params.append("prefix", searchPrefix);
      }

      const response = await fetch(`/api/oss/sws?${params.toString()}`);
      const data: OSSListResponse = await response.json();

      if (data.success && data.data) {
        setObjects(data.data.objects);
      } else {
        setError(data.error || "获取文件列表失败");
      }
    } catch (err) {
      setError("网络请求失败");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjects(prefix);
  }, [prefix]);

  const handleSearch = () => {
    setPrefix(searchInput);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">OSS 文件浏览器</h1>

      {/* 搜索框 */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="输入前缀搜索文件..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          搜索
        </button>
        {prefix && (
          <button
            onClick={() => {
              setSearchInput("");
              setPrefix("");
            }}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          >
            清除
          </button>
        )}
      </div>

      {/* 当前前缀提示 */}
      {prefix && (
        <div className="mb-4 text-sm text-gray-600">
          当前前缀:{" "}
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">
            {prefix}
          </span>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">加载中...</p>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* 文件列表 */}
      {!loading && !error && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {objects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">没有找到文件</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      文件名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      大小
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      修改时间
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {objects.map((obj) => (
                    <tr key={obj.key} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 break-all">
                          {obj.key}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatSize(obj.size)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(obj.lastModified)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href={`${obj.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          下载
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 文件计数 */}
          {objects.length > 0 && (
            <div className="bg-gray-50 px-6 py-3 text-sm text-gray-600">
              共 {objects.length} 个文件
            </div>
          )}
        </div>
      )}
    </div>
  );
}
