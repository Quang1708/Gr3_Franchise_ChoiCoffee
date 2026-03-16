import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  Italic,
  Link,
  List,
  Paragraph,
  Underline,
  type EditorConfig,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: number;
}

export const TextEditor = ({
  value,
  onChange,
  label,
  placeholder = "Nhap noi dung...",
  error,
  disabled = false,
  className = "",
  minHeight = 220,
}: TextEditorProps) => {
  const editorConfig: EditorConfig = {
    licenseKey: "GPL",
    plugins: [
      Essentials,
      Paragraph,
      Heading,
      Bold,
      Italic,
      Underline,
      Link,
      List,
      BlockQuote,
    ],
    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "heading",
        "|",
        "bold",
        "italic",
        "underline",
        "|",
        "link",
        "bulletedList",
        "numberedList",
        "blockQuote",
      ],
      shouldNotGroupWhenFull: true,
    },
    placeholder,
  };

  return (
    <div
      className={`text-editor ${className}`}
      style={{
        ["--text-editor-min-height" as string]: `${minHeight}px`,
      }}
    >
      {label ? (
        <label className="mb-2 block text-sm font-medium text-charcoal">
          {label}
        </label>
      ) : null}

      <CKEditor
        editor={ClassicEditor}
        data={value}
        config={editorConfig}
        disabled={disabled}
        onChange={(_, editor) => {
          onChange(editor.getData());
        }}
      />

      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </div>
  );
};
