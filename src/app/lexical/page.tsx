"use client";
import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { AutoLinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  $convertFromMarkdownString,
  ITALIC_UNDERSCORE,
  QUOTE,
} from "@lexical/markdown";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableNode } from "@lexical/table";

export default function Page() {
  function onChange(editorState: any) {
    editorState.read(() => {
      console.log(editorState.toJSON());
    });
  }
  return (
    <>
      <LexicalComposer
        initialConfig={{
          namespace: "editor",
          theme: {},
          onError: (error: any) => {
            throw error;
          },
          nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            CodeNode,
            CodeHighlightNode,
            TableNode,
            AutoLinkNode,
          ],
          editorState: () => {
            $convertFromMarkdownString(
              "this is _italic_ text\n> this is a quote\n```c\nint main(int argv, char **argv)\n{\n    return -1;\n}\n```\n> this is a quote",
              [QUOTE, ITALIC_UNDERSCORE]
            );
          },
          editable: true,
        }}
      >
        <OnChangePlugin onChange={onChange} />

        <div>
          <PlainTextPlugin
            contentEditable={<ContentEditable id="editor" />}
            placeholder={<></>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </LexicalComposer>
    </>
  );
}
