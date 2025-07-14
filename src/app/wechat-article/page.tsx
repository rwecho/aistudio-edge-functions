"use client";

import { useState } from "react";

export default function WeChatArticlePage() {
  const [formData, setFormData] = useState({
    title: "测试文章标题",
    content: `
      <h1>这是一篇测试文章</h1>
      <p>这是文章内容，支持HTML格式。</p>
      <p>您可以在这里添加<strong>格式化</strong>的内容。</p>
      <img src="/api/oss?ossKey=db9c7bc7/photo_2025-04-07_14-00-02.jpg" alt="测试图片" />
      <p>这张图片会被自动上传到微信服务器。</p>
    `,
    author: "AI Studio",
    digest: "这是一篇测试文章的摘要，用于在公众号文章列表中显示",
    content_source_url: "https://www.aistudiox.design",
    thumb_url:
      "https://www.aistudiox.design/api/oss?ossKey=db9c7bc7/photo_2025-04-07_14-00-02.jpg",
    need_open_comment: 1,
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? parseInt(value)
          : value,
    }));
  };

  const handleCraftArticle = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/wechat/article/craft", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      alert(JSON.stringify(data));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            微信公众号文章发布
          </h1>

          {/* 表单 */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文章标题 *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="请输入文章标题"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                作者
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="请输入作者名称"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                摘要
              </label>
              <textarea
                name="digest"
                value={formData.digest}
                onChange={handleInputChange}
                rows={2}
                placeholder="请输入文章摘要"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                原文链接
              </label>
              <input
                type="url"
                name="content_source_url"
                value={formData.content_source_url}
                onChange={handleInputChange}
                placeholder="请输入原文链接"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                封面图片URL
              </label>
              <input
                type="url"
                name="thumb_url"
                value={formData.thumb_url}
                onChange={handleInputChange}
                placeholder="请输入封面图片URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                文章内容 * (支持HTML)
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={12}
                placeholder="请输入文章内容，支持HTML格式"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                required
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <span className="text-sm text-gray-700 mr-2">开启评论:</span>
                <select
                  name="need_open_comment"
                  value={formData.need_open_comment}
                  onChange={handleInputChange}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={0}>关闭</option>
                  <option value={1}>开启</option>
                </select>
              </label>
            </div>
          </div>

          {/* 创建草稿按钮 */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleCraftArticle}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "创建中..." : "创建草稿"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
