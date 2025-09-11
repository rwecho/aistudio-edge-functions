import { NextRequest, NextResponse } from "next/server";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { CodeNode, CodeHighlightNode } from "@lexical/code";
import { MarkNode } from "@lexical/mark";
import { HashtagNode } from "@lexical/hashtag";
import { OverflowNode } from "@lexical/overflow";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";

import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { createHeadlessEditor } from "@lexical/headless";

export async function POST(request: NextRequest) {
  const { markdown } = await request.json();

  const editor = createHeadlessEditor({
    namespace: "editor",
    nodes: [
      HeadingNode,
      ListNode,
      ListItemNode,
      QuoteNode,
      CodeNode,
      TableNode,
      TableCellNode,
      TableRowNode,
      HashtagNode,
      CodeHighlightNode,
      AutoLinkNode,
      LinkNode,
      OverflowNode,
      MarkNode,
    ],
    onError: () => {},
  });

  editor.update(
    () => {
      $convertFromMarkdownString(markdown, TRANSFORMERS);
    },
    { discrete: true }
  );

  const json = editor.getEditorState().toJSON();

  return NextResponse.json({
    data: {
      lexical: json,
    },
  });
}
