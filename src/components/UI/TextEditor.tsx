import { CKEditor } from "@ckeditor/ckeditor5-react";
import { useMemo } from "react";
import {
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  BlockQuote,
  Bold,
  Code,
  CodeBlock,
  ClassicEditor,
  Essentials,
  FindAndReplace,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  Image,
  ImageCaption,
  ImageInsert,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
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
        SelectAll,
        Autoformat,
        TextTransformation,
        PasteFromOffice,
        Paragraph,
        Heading,
        Alignment,
        Bold,
        Italic,
        Underline,
        Strikethrough,
        Subscript,
        Superscript,
        RemoveFormat,
        FontFamily,
        FontSize,
        FontColor,
        FontBackgroundColor,
        Highlight,
        Link,
        AutoLink,
        LinkImage,
        List,
        ListProperties,
        TodoList,
        Indent,
        IndentBlock,
        BlockQuote,
        Code,
        CodeBlock,
        HorizontalLine,
        Image,
        AutoImage,
        ImageUpload,
        ImageInsert,
        ImageToolbar,
        ImageStyle,
        ImageResize,
        ImageCaption,
        Table,
        TableToolbar,
        TableCaption,
        TableProperties,
        TableCellProperties,
        TableColumnResize,
        MediaEmbed,
        FindAndReplace,
        SpecialCharacters,
        SpecialCharactersArrows,
        SpecialCharactersCurrency,
        SpecialCharactersEssentials,
        SpecialCharactersLatin,
        SpecialCharactersMathematical,
        SpecialCharactersText,
        GeneralHtmlSupport,
        SourceEditing,
      ],
      toolbar: {
        items: [
          "undo",
          "redo",
          "|",
          "findAndReplace",
          "selectAll",
          "|",
          "heading",
          "fontFamily",
          "fontSize",
          "fontColor",
          "fontBackgroundColor",
          "highlight",
          "|",
          "alignment",
          "|",
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "subscript",
          "superscript",
          "removeFormat",
          "|",
          "link",
          "insertImage",
          "mediaEmbed",
          "insertTable",
          "horizontalLine",
          "specialCharacters",
          "|",
          "bulletedList",
          "numberedList",
          "todoList",
          "outdent",
          "indent",
          "|",
          "blockQuote",
          "code",
          "codeBlock",
          "|",
          "sourceEditing",
          "imageUpload",
        ],
        shouldNotGroupWhenFull: true,
      },
      heading: {
        options: [
          {
            model: "paragraph",
            title: "Paragraph",
            class: "ck-heading_paragraph",
          },
          {
            model: "heading1",
            view: "h1",
            title: "Heading 1",
            class: "ck-heading_heading1",
          },
          {
            model: "heading2",
            view: "h2",
            title: "Heading 2",
            class: "ck-heading_heading2",
          },
          {
            model: "heading3",
            view: "h3",
            title: "Heading 3",
            class: "ck-heading_heading3",
          },
          {
            model: "heading4",
            view: "h4",
            title: "Heading 4",
            class: "ck-heading_heading4",
          },
        ],
      },
      fontSize: {
        options: [10, 12, 14, "default", 18, 20, 24, 28, 32],
        supportAllValues: true,
      },
      fontFamily: {
        supportAllValues: true,
      },
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: "https://",
      },
      list: {
        properties: {
          styles: true,
          startIndex: true,
          reversed: true,
        },
      },
      image: {
        insert: {
          integrations: ["upload", "url"],
        },
        resizeOptions: [
          {
            name: "resizeImage:original",
            value: null,
            icon: "original",
          },
          {
            name: "resizeImage:50",
            value: "50",
            icon: "medium",
          },
          {
            name: "resizeImage:75",
            value: "75",
            icon: "large",
          },
        ],
        toolbar: [
          "imageTextAlternative",
          "imageStyle:inline",
          "imageStyle:block",
          "imageStyle:side",
          "|",
          "resizeImage:50",
          "resizeImage:75",
          "resizeImage:original",
          "|",
          "toggleImageCaption",
        ],
      },
      table: {
        contentToolbar: [
          "tableColumn",
          "tableRow",
          "mergeTableCells",
          "tableProperties",
          "tableCellProperties",
          "toggleTableCaption",
        ],
      },
      mediaEmbed: {
        previewsInData: true,
      },
      htmlSupport: {
        allow: [
          {
            name: /.*/,
            attributes: true,
            classes: true,
            styles: true,
          },
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
