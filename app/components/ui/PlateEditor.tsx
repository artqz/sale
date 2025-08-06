import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import type { EditorState, LexicalEditor, NodeKey, TextFormatType } from "lexical";
import {
  $getNodeByKey, // добавил импорт
  $getRoot,
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_NORMAL,
  createCommand,
  DecoratorNode,
  FORMAT_TEXT_COMMAND,
  type LexicalNode,
  ParagraphNode,
  TextNode,
} from "lexical";
import { BoldIcon, ImageIcon, ItalicIcon, UnderlineIcon } from "lucide-react";
import React, { useEffect, useRef } from "react";

// ErrorBoundary для RichTextPlugin
function LexicalErrorBoundary(props: { children?: React.ReactNode }) {
  return <>{props.children}</>;
}

// Команда для вставки картинки
const INSERT_IMAGE_COMMAND = createCommand<{ src: string }>("INSERT_IMAGE_COMMAND");

// Кастомный ImageNode для Lexical
export class ImageNode extends DecoratorNode<React.ReactElement> {
  __src: string;

  static getType() {
    return "image";
  }

  static clone(node: ImageNode) {
    return new ImageNode(node.__src, node.__key);
  }

  constructor(src: string, key?: NodeKey) {
    super(key);
    this.__src = src;
  }

  createDOM() {
    const img = document.createElement("img");
    img.src = this.__src;
    img.style.maxWidth = "100%";
    img.style.display = "block";
    img.draggable = true;
    return img;
  }

  updateDOM() {
    return false;
  }

  decorate() {
    // draggable + drag events
    return (
      <img
        src={this.__src}
        style={{ maxWidth: "100%", display: "block", cursor: "grab" }}
        alt=""
        draggable
        onDragStart={e => {
          e.dataTransfer.setData("image-src", this.__src);
          e.dataTransfer.setData("image-key", this.getKey());
        }}
      />
    );
  }

  static importJSON(serializedNode: any) {
    return new ImageNode(serializedNode.src);
  }

  exportJSON() {
    return {
      type: "image",
      version: 1,
      src: this.__src,
    };
  }
}

function $createImageNode(src: string) {
  return new ImageNode(src);
}

function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}

// Минимальный тулбар для форматирования
function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFormats, setActiveFormats] = React.useState({ bold: false, italic: false, underline: false });

  React.useEffect(() => {
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        let bold = false, italic = false, underline = false;
        if ($isRangeSelection(selection)) {
          bold = selection.hasFormat("bold");
          italic = selection.hasFormat("italic");
          underline = selection.hasFormat("underline");
        }
        setActiveFormats({ bold, italic, underline });
      });
    });
  }, [editor]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-image", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) {
      editor.dispatchCommand(INSERT_IMAGE_COMMAND, { src: data.url });
    }
    e.target.value = "";
  };

  const format = (type: "bold" | "italic" | "underline") => editor.dispatchCommand(FORMAT_TEXT_COMMAND, type);
  const btnClass = (active: boolean) =>
    `w-7 h-7 p-[2px] flex items-center justify-center rounded-md transition-colors ${
      active ? "bg-gray-200 dark:bg-gray-700 text-blue-700" : "hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;

  return (
    <>
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <div className="flex gap-1 p-1 border-b border-gray-200 dark:border-gray-700 rounded-t-md bg-white dark:bg-gray-900">
        <button
          type="button"
          className={btnClass(activeFormats.bold)}
          onClick={() => format("bold")}
          title="Жирный"
        >
          <BoldIcon className="w-4 h-4 text-gray-600" />
        </button>
        <button
          type="button"
          className={btnClass(activeFormats.italic)}
          onClick={() => format("italic")}
          title="Курсив"
        >
          <ItalicIcon className="w-4 h-4 text-gray-600" />
        </button>
        <button
          type="button"
          className={btnClass(activeFormats.underline)}
          onClick={() => format("underline")}
          title="Подчеркнутый"
        >
          <UnderlineIcon className="w-4 h-4 text-gray-600" />
        </button>
        <button
          type="button"
          className="w-7 h-7 p-[2px] flex items-center justify-center rounded-md transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => fileInputRef.current?.click()}
          title="Вставить картинку"
        >
          <ImageIcon className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </>
  );
}

// Плагин для вставки картинок (минимальный)
function ImagesPlugin() {
  const [editor] = useLexicalComposerContext();
  React.useEffect(() => {
    return editor.registerCommand(
      INSERT_IMAGE_COMMAND,
      ({ src }: { src: string }) => {
        editor.update(() => {
          const selection = $getSelection();
          const imageNode = $createImageNode(src);

          if ($isRangeSelection(selection)) {
            selection.insertNodes([imageNode]);
          } else {
            // Если курсора нет — вставляем в конец root
            const root = $getRoot();
            root.append(imageNode);
          }
        });
        return true;
      },
      COMMAND_PRIORITY_NORMAL
    );
  }, [editor]);
  return null;
}

function ImageDragDropPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handler = (event: DragEvent) => {
      const src = event.dataTransfer?.getData("image-src");
      const key = event.dataTransfer?.getData("image-key");
      if (src && key) {
        event.preventDefault();
        editor.update(() => {
          // Удаляем старую картинку по key через публичный API
          const node = $getNodeByKey(key);
          if (node && $isImageNode(node)) {
            node.remove();
          }
          // Вставляем в новое место
          const selection = $getSelection();
          const imageNode = $createImageNode(src);
          if ($isRangeSelection(selection)) {
            selection.insertNodes([imageNode]);
          } else {
            const root = $getRoot();
            root.append(imageNode);
          }
        });
      }
    };
    const rootElem = editor.getRootElement();
    if (rootElem) {
      rootElem.addEventListener("drop", handler);
    }
    return () => {
      if (rootElem) {
        rootElem.removeEventListener("drop", handler);
      }
    };
  }, [editor]);

  return null;
}

interface PlateEditorProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function PlateEditor({ value, onChange }: PlateEditorProps) {
  let safeEditorState: string | undefined ;
  if (value && value.trim() !== "") {
    try {
      JSON.parse(value);
      safeEditorState = value;
    } catch {
      safeEditorState = undefined;
    }
  }
  const initialConfig = {
    namespace: "MyEditor",
    theme: {
      text: {
        bold: "font-bold",
        italic: "italic",
        underline: "underline",
      },
    },
    onError(error: Error) { throw error; },
    editorState: safeEditorState,
    nodes: [ParagraphNode, TextNode, ImageNode],
  };

  // Преобразуем EditorState в string для onChange
  const handleChange = (editorState: EditorState, editor: LexicalEditor) => {
    if (onChange) {
      onChange(JSON.stringify(editorState.toJSON()));
    }
  };

  return (
    <div className="shadow-sm rounded-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <RichTextPlugin
          contentEditable={<ContentEditable className="rounded-b-md bg-white dark:bg-gray-900 p-3 min-h-[120px] outline-none" />}
          placeholder={<div className="text-gray-400">Введите текст...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
        <ImagesPlugin />
        <ImageDragDropPlugin />
      </LexicalComposer>
    </div>
  );
} 