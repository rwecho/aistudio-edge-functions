"use client";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface ArticleClientViewProps {
  html: string;
  tocItems: TocItem[];
}

export default function ArticleClientView({
  html,
  tocItems,
}: ArticleClientViewProps) {
  const handleTocClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string
  ) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-auto p-8 md:p-4 lg:p-8">
          <section
            className="markdown-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>

      {tocItems && tocItems.length > 0 && (
        <div className="hidden lg:block w-72 border-l border-gray-200 bg-gray-50 h-screen sticky top-0">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-800">目录</h3>
          </div>
          <div className="p-4 text-xs overflow-y-auto max-h-[calc(100vh-57px)]">
            <nav className="space-y-1">
              {tocItems.map((item, index) => (
                <a
                  key={index}
                  href={`#${item.id}`}
                  className={`block py-1 px-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors ${
                    item.level === 1
                      ? "font-semibold"
                      : item.level === 2
                      ? "ml-2"
                      : item.level === 3
                      ? "ml-4 text-xs"
                      : item.level === 4
                      ? "ml-6 text-xs"
                      : "ml-10 text-xs"
                  }`}
                  onClick={(e) => handleTocClick(e, item.id)}
                >
                  {item.text}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
