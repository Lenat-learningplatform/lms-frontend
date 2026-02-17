"use client";

import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Strike from "@tiptap/extension-strike";
import Code from "@tiptap/extension-code";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import CodeBlock from "@tiptap/extension-code-block";
import Blockquote from "@tiptap/extension-blockquote";
import HorizontalRule from "@tiptap/extension-horizontal-rule";
import HardBreak from "@tiptap/extension-hard-break";
import Heading from "@tiptap/extension-heading";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import ListItem from "@tiptap/extension-list-item";

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {/* Formatting Buttons */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-3 py-1 border rounded ${
          editor.isActive("bold") ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-3 py-1 border rounded ${
          editor.isActive("italic") ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-3 py-1 border rounded ${
          editor.isActive("strike") ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        Strike
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`px-3 py-1 border rounded ${
          editor.isActive("code") ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
      >
        Code
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        className="px-3 py-1 border rounded bg-gray-200"
      >
        Clear Marks
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().clearNodes().run()}
        className="px-3 py-1 border rounded bg-gray-200"
      >
        Clear Nodes
      </button>

      {/* Headings */}
      {[1, 2, 3, 4, 5, 6].map((level) => (
        <button
          type="button"
          key={level}
          onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          className={`px-3 py-1 border rounded ${
            editor.isActive("heading", { level })
              ? "bg-blue-500 text-white"
              : "bg-gray-200"
          }`}
        >
          H{level}
        </button>
      ))}

      {/* Lists */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-3 py-1 border rounded ${
          editor.isActive("bulletList")
            ? "bg-blue-500 text-white"
            : "bg-gray-200"
        }`}
      >
        Bullet List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-3 py-1 border rounded ${
          editor.isActive("orderedList")
            ? "bg-blue-500 text-white"
            : "bg-gray-200"
        }`}
      >
        Ordered List
      </button>

      {/* Code Block */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`px-3 py-1 border rounded ${
          editor.isActive("codeBlock")
            ? "bg-blue-500 text-white"
            : "bg-gray-200"
        }`}
      >
        Code Block
      </button>

      {/* Blockquote */}
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`px-3 py-1 border rounded ${
          editor.isActive("blockquote")
            ? "bg-blue-500 text-white"
            : "bg-gray-200"
        }`}
      >
        Blockquote
      </button>

      {/* Horizontal Rule */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="px-3 py-1 border rounded bg-gray-200"
      >
        Horizontal Rule
      </button>

      {/* Hard Break */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setHardBreak().run()}
        className="px-3 py-1 border rounded bg-gray-200"
      >
        Hard Break
      </button>

      {/* Undo/Redo */}
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className="px-3 py-1 border rounded bg-gray-200"
      >
        Undo
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className="px-3 py-1 border rounded bg-gray-200"
      >
        Redo
      </button>

      {/* Text Color */}
      <button
        type="button"
        onClick={() => editor.chain().focus().setColor("#958DF1").run()}
        className={`px-3 py-1 border rounded ${
          editor.isActive("textStyle", { color: "#958DF1" })
            ? "bg-blue-500 text-white"
            : "bg-gray-200"
        }`}
      >
        Purple
      </button>
    </div>
  );
};

const TiptapEditor = ({
  content,
  onUpdate,
}: {
  content?: string;
  onUpdate?: (html: string) => void;
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Strike,
      Code,
      BulletList,
      OrderedList,
      CodeBlock,
      Blockquote,
      HorizontalRule,
      HardBreak,
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      TextStyle,
      Color.configure({ types: [TextStyle.name, ListItem.name] }),
    ],
    content: content || "",
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getHTML());
      }
    },
  });

  return (
    <div className="p-6 border rounded-lg">
      <MenuBar editor={editor} />
      <div
        className="border p-4 rounded"
        onClick={() => editor?.chain().focus().run()}
        // make the container focusable for accessibility
        tabIndex={0}
      >
        <EditorContent
          editor={editor}
          className="min-h-[150px]"
          // ensure caret is visible even if global styles try to hide it
          style={{ caretColor: "#111827" }}
        />
      </div>
    </div>
  );
};

export default TiptapEditor;
