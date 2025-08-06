import { CodeNode } from "@lexical/code";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { TRANSFORMERS } from "@lexical/markdown";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, ParagraphNode, TextNode } from "lexical";
import { BoldIcon, ImageIcon, ItalicIcon, LinkIcon, UnderlineIcon } from "lucide-react";
import { useEffect, useState } from "react";

// --- Enhanced Toolbar ---
function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const [formats, setFormats] = useState({ bold: false, italic: false, underline: false });

  useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        let bold = false, italic = false, underline = false;
        if ($isRangeSelection(selection)) {
          bold = selection.hasFormat("bold");
          italic = selection.hasFormat("italic");
          underline = selection.hasFormat("underline");
        }
        setFormats({ bold, italic, underline });
      });
    });
  }, [editor]);

  const format = (type: "bold" | "italic" | "underline") => editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);

  const insertLink = () => {
    const url = prompt("Введите URL:");
    if (url) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const linkNode = new LinkNode(url);
          const text = selection.getTextContent();
          linkNode.append(new TextNode(text));
          selection.insertNodes([linkNode]);
        }
      });
    }
  };

  const insertImage = () => {
    const url = prompt("Введите URL изображения:");
    if (url) {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Вставляем картинку как ссылку (или можно реализовать кастомный ImageNode)
          selection.insertRawText(url);
        }
      });
    }
  };

  const btnClass = (active: boolean) =>
    `w-8 h-8 p-1 flex items-center justify-center rounded transition-colors ${
      active ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
    }`;

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-white">
      <button type="button" className={btnClass(formats.bold)} onClick={() => format("bold")} title="Жирный">
        <BoldIcon className="w-4 h-4" />
      </button>
      <button type="button" className={btnClass(formats.italic)} onClick={() => format("italic")} title="Курсив">
        <ItalicIcon className="w-4 h-4" />
      </button>
      <button type="button" className={btnClass(formats.underline)} onClick={() => format("underline")} title="Подчеркнутый">
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button type="button" className={btnClass(false)} onClick={insertLink} title="Вставить ссылку">
        <LinkIcon className="w-4 h-4" />
      </button>
      <button type="button" className={btnClass(false)} onClick={insertImage} title="Вставить изображение">
        <ImageIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

// --- NotionEditor ---
type NotionEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
};

const NotionEditor = ({ value, onChange }: NotionEditorProps) => {
  const handleChange = (editorState: any) => {
    if (onChange) {
      onChange(JSON.stringify(editorState.toJSON()));
    }
  };

  const initialConfig = {
    namespace: "PlaygroundEditor",
    theme: {
      heading: {
        h1: "text-3xl font-bold mb-4",
        h2: "text-2xl font-bold mb-3",
        h3: "text-xl font-bold mb-2",
      },
      quote: "border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4",
      code: "bg-gray-100 p-4 rounded font-mono text-sm my-4 block",
      list: {
        ul: "list-disc list-inside my-2",
        ol: "list-decimal list-inside my-2",
      },
      link: "text-blue-600 underline hover:text-blue-800",
      paragraph: "mb-2",
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
      },
    },
    onError(error: Error) {
      throw error;
    },
    editorState: value,
    nodes: [
      ParagraphNode,
      TextNode,
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      CodeNode,
      LinkNode,
    ],
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <RichTextPlugin
          contentEditable={<ContentEditable className="min-h-[200px] p-4 outline-none focus:ring-0" />}
          placeholder={<div className="text-gray-400 p-4 pointer-events-none absolute top-0 left-0">Начните печатать...</div>}
          ErrorBoundary={({ children }) => <>{children}</>}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
        <AutoFocusPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <TabIndentationPlugin />
        <ClearEditorPlugin />
      </LexicalComposer>
    </div>
  );
};

export default NotionEditor; 