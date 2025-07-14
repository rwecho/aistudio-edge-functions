# 微信公众号文章发布 API

这个项目提供了用于创建和发布微信公众号文章草稿的 API 接口。

## 环境配置

在使用之前，请确保在环境变量中设置以下配置：

```bash
# 微信公众号配置
WEIXIN_APPID=your_wechat_appid
WEIXIN_APPSECRET=your_wechat_appsecret

# AI Studio API URL (可选，默认为 https://www.aistudiox.design)
AISTUDIOX_API_URL=https://www.aistudiox.design
```

## API 接口

### 1. 创建草稿

**接口地址：** `POST /api/wechat/article/craft`

**请求参数：**

```json
{
  "title": "文章标题", // 必填
  "content": "<h1>文章内容</h1><p>支持HTML格式</p>", // 必填
  "author": "作者名称", // 可选
  "digest": "文章摘要", // 可选
  "content_source_url": "原文链接", // 可选
  "thumb_url": "封面图片URL", // 可选
  "thumb_media_id": "封面图片media_id", // 可选，优先于thumb_url
  "process_images": true, // 可选，是否自动处理图片，默认true
  "need_open_comment": 1 // 可选，是否开启评论，0关闭1开启，默认1
}
```

**响应示例：**

```json
{
  "success": true,
  "media_id": "草稿的media_id",
  "publish_id": null,
  "message": "草稿创建成功"
}
```

### 2. 发布草稿

**接口地址：** `POST /api/wechat/article/publish`

**请求参数：**

```json
{
  "media_id": "草稿的media_id" // 必填
}
```

**响应示例：**

```json
{
  "success": true,
  "publish_id": "发布任务ID",
  "message": "草稿发布成功"
}
```

### 3. 测试 Access Token

**接口地址：** `GET /api/wechat/article/craft`

**响应示例：**

```json
{
  "success": true,
  "access_token": "微信access_token",
  "expires_at": "过期时间"
}
```

## 功能特性

### 1. 自动图片处理

API 会自动处理文章内容中的图片：

- 提取 HTML 中的`<img>`标签中的图片 URL
- 下载图片并上传到微信服务器
- 替换原始 URL 为微信服务器 URL
- 支持 OSS 图片链接（以`/api/oss`开头的链接）
- 跳过已经是微信域名的图片

### 2. Access Token 管理

- 自动获取和缓存 Access Token
- 智能过期检测和刷新
- 提前 5 分钟刷新避免过期

### 3. 封面图片处理

- 支持通过 URL 自动上传封面图片
- 支持直接使用已有的 media_id
- 自动处理图片格式和大小

### 4. 错误处理

- 详细的错误信息和日志
- 图片处理失败时的优雅降级
- 网络请求超时和重试机制

## 使用示例

### 创建草稿

```javascript
const response = await fetch("/api/wechat/article/craft", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "我的文章标题",
    content: `
      <h1>文章标题</h1>
      <p>这是文章内容。</p>
      <img src="/api/oss?ossKey=example.jpg" alt="示例图片" />
    `,
    author: "AI Studio",
    digest: "文章摘要",
    thumb_url: "https://example.com/cover.jpg",
  }),
});

const result = await response.json();
console.log(result);
```

### 发布草稿

```javascript
const response = await fetch("/api/wechat/article/publish", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    media_id: result.media_id,
  }),
});

const publishResult = await response.json();
console.log(publishResult);
```

## 测试页面

访问 `/wechat-article-demo` 页面可以进行可视化测试：

- 填写文章信息
- 测试 Access Token
- 创建草稿
- 发布文章

## 注意事项

1. **微信公众号权限**：确保您的微信公众号有发布文章的权限
2. **图片格式**：支持 jpg、png、gif 等常见格式，大小不超过 10MB
3. **内容审核**：文章内容需要符合微信公众号的内容规范
4. **发布限制**：微信公众号每天有发布次数限制
5. **网络环境**：确保服务器能够访问微信 API 和图片资源

## 错误码说明

常见的微信 API 错误码：

- `40001`: access_token 无效
- `40007`: media_id 无效
- `45009`: 接口调用超过限制
- `48001`: api 功能未授权
- `40125`: 文章标题不能为空

详细错误码请参考[微信公众平台开发文档](https://developers.weixin.qq.com/doc/offiaccount/Message_Management/Batch_Sends_and_Originality_Checks.html)。

## 技术架构

- **Next.js 14**: 现代化的 React 框架
- **TypeScript**: 类型安全的 JavaScript
- **微信公众平台 API**: 官方草稿和发布接口
- **自动图片处理**: 智能图片上传和替换
- **缓存机制**: Access Token 缓存优化

## 开发和调试

1. 启动开发服务器：

   ```bash
   pnpm dev
   ```

2. 访问测试页面：

   ```
   http://localhost:3000/wechat-article-demo
   ```

3. 查看 API 日志：
   - 创建草稿：检查控制台输出
   - 图片处理：查看上传进度
   - 错误处理：查看详细错误信息
