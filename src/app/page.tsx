import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const services = [
    {
      title: "Azure TTS",
      description: "文本转语音服务，支持多语言和情感风格",
      href: "/azure-tts-demo",
      icon: "🎵",
    },
    {
      title: "Markdown 转 HTML",
      description: "支持 GitHub 风格的 Markdown，代码高亮",
      href: "/markdown",
      icon: "📝",
    },
    {
      title: "ComfyUI 图像生成",
      description: "基于 FLUX 模型的 AI 图像生成",
      href: "/api/comfy",
      icon: "🎨",
    },
    {
      title: "代理服务",
      description: "HTTP 请求代理和转发服务",
      href: "/api/proxy",
      icon: "🔄",
    },
    {
      title: "内容读取",
      description: "网页内容智能提取和解析",
      href: "/api/read",
      icon: "📖",
    },
    {
      title: "对象存储",
      description: "文件上传和云存储服务",
      href: "/api/oss",
      icon: "☁️",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-8">
            <Image
              className="dark:invert"
              src="/next.svg"
              alt="Next.js logo"
              width={180}
              height={38}
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            AI Studio Edge Functions
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            集成多种 AI 和第三方服务的 Next.js API 平台
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {services.map((service, index) => (
            <Link
              key={index}
              href={service.href}
              className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{service.icon}</span>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {service.title}
                </h3>
              </div>
              <p className="text-gray-600 text-sm">{service.description}</p>
            </Link>
          ))}
        </div>

        {/* Features */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            核心特性
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 text-xl">🚀</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">高性能</h3>
              <p className="text-sm text-gray-600">
                基于 Next.js 15 和 Turbopack
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-xl">🔧</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">易集成</h3>
              <p className="text-sm text-gray-600">RESTful API 设计</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 text-xl">🛡️</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">安全可靠</h3>
              <p className="text-sm text-gray-600">完善的错误处理和验证</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <span className="text-orange-600 text-xl">📚</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">文档完整</h3>
              <p className="text-sm text-gray-600">详细的 API 使用说明</p>
            </div>
          </div>
        </div>

        {/* Quick Start */}
        <div className="bg-gray-900 rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">快速开始</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-3">开发环境</h3>
              <div className="bg-gray-800 rounded p-4 font-mono text-sm">
                <div className="text-green-400"># 安装依赖</div>
                <div>pnpm install</div>
                <div className="text-green-400 mt-2"># 启动开发服务器</div>
                <div>pnpm dev</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">API 测试</h3>
              <div className="bg-gray-800 rounded p-4 font-mono text-sm">
                <div className="text-green-400"># 测试 Markdown API</div>
                <div className="break-all">
                  curl -X POST localhost:3003/api/markdown/toHtml
                </div>
                <div className="text-green-400 mt-2"># 测试 TTS API</div>
                <div className="break-all">
                  curl -X POST localhost:3003/api/azure-tts
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
