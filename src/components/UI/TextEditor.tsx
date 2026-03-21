import { CKEditor } from "@ckeditor/ckeditor5-react";
import { useMemo } from "react";
import {
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  Heading,
  Image,
  ImageCaption,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Italic,
  Link,
  List,
  Paragraph,
  Underline,
  type EditorConfig,
} from "ckeditor5";
import { uploadImageToCloudinary } from "@/services/cloudinary.service";
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

type CkFileLoader = {
  file: Promise<File>;
};

type CkEditorWithUpload = {
  plugins: {
    get: (name: string) => {
      createUploadAdapter?: (loader: CkFileLoader) => CloudinaryUploadAdapter;
    };
  };
};

class CloudinaryUploadAdapter {
  private loader: CkFileLoader;

  constructor(loader: CkFileLoader) {
    this.loader = loader;
  }

  async upload(): Promise<{ default: string }> {
    const file = await this.loader.file;
    const response = await uploadImageToCloudinary(file, {
      folder: "text-editor",
      tags: ["text-editor", "ckeditor"],
    });

    return {
      default: response.secure_url,
    };
  }

  abort(): void {
    // CKEditor can call abort, but Fetch request cancellation is not wired here.
  }
}

const setupCloudinaryUploadAdapter = (editor: CkEditorWithUpload) => {
  const fileRepository = editor.plugins.get("FileRepository");
  if (!fileRepository) return;

  fileRepository.createUploadAdapter = (loader: CkFileLoader) =>
    new CloudinaryUploadAdapter(loader);
};

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
  const editorConfig: EditorConfig = useMemo(
    () => ({
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
        Image,
        ImageUpload,
        ImageToolbar,
        ImageStyle,
        ImageCaption,
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
          "imageUpload",
          "bulletedList",
          "numberedList",
          "blockQuote",
        ],
        shouldNotGroupWhenFull: true,
      },
      image: {
        toolbar: [
          "imageStyle:inline",
          "imageStyle:block",
          "|",
          "toggleImageCaption",
        ],
      },
      placeholder,
    }),
    [placeholder],
  );

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
        onReady={(editor) => {
          setupCloudinaryUploadAdapter(editor as unknown as CkEditorWithUpload);
        }}
        onChange={(_, editor) => {
          onChange(editor.getData());
        }}
      />

      {error ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
    </div>
  );
};
