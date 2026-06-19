import type { Extensions } from "@tiptap/core";
import { CharacterCount } from "@tiptap/extension-character-count";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { TaskItem } from "@tiptap/extension-task-item";
import { TaskList } from "@tiptap/extension-task-list";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Typography } from "@tiptap/extension-typography";
import { Underline } from "@tiptap/extension-underline";
import { Youtube } from "@tiptap/extension-youtube";
import StarterKit from "@tiptap/starter-kit";
import { common, createLowlight } from "lowlight";
import { Attachment } from "../extensions/attachment";
import { Mention } from "../extensions/mention";
import { Quote } from "../extensions/quote";
import { ResizableImage } from "../extensions/resizable-image";
import { SlashCommand } from "../extensions/slash-command";
import { UploadImage } from "../extensions/upload-image";

const lowlight = createLowlight(common);

interface AttachmentAttrs {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  storageKey: string;
}

interface ExtensionConfig {
  maxLength?: number;
  placeholder?: string;
  uploadFn?: (file: File) => Promise<{ url: string; alt?: string }>;
  onUploadStart?: (id: string) => void;
  onUploadProgress?: (id: string, progress: number) => void;
  onUploadComplete?: (id: string, url: string) => void;
  onUploadError?: (id: string, error: Error) => void;
  onAttachmentDownload?: (attrs: AttachmentAttrs) => void;
  onAttachmentRemove?: (attrs: AttachmentAttrs) => void;
}

export function getExtensions(config: ExtensionConfig = {}): Extensions {
  const extensions: Extensions = [
    StarterKit.configure({
      codeBlock: false,
    }),
    Placeholder.configure({
      placeholder: config.placeholder || "Write something...",
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-blue-600 underline hover:text-blue-800 cursor-pointer",
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Underline,
    Highlight.configure({
      multicolor: true,
    }),
    TextStyle,
    Color,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    CodeBlockLowlight.configure({
      lowlight,
    }),
    CharacterCount.configure({
      limit: config.maxLength,
    }),
    Typography,
    Youtube.configure({
      width: 640,
      height: 360,
      nocookie: true,
      HTMLAttributes: {
        class: "youtube-embed rounded-lg overflow-hidden",
      },
    }),
    SlashCommand,
    Mention,
    Quote,
    UploadImage.configure({
      uploadFn: config.uploadFn,
      onUploadStart: config.onUploadStart,
      onUploadProgress: config.onUploadProgress,
      onUploadComplete: config.onUploadComplete,
      onUploadError: config.onUploadError,
    }),
    Attachment.configure({
      onDownload: config.onAttachmentDownload,
      onRemove: config.onAttachmentRemove,
    }),
    ResizableImage,
  ];

  return extensions;
}

export function getMinimalExtensions(): Extensions {
  return [
    StarterKit.configure({
      codeBlock: false,
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: "text-blue-600 underline",
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),
    TaskList,
    TaskItem.configure({
      nested: true,
    }),
    CodeBlockLowlight.configure({
      lowlight,
    }),
    Typography,
    Youtube.configure({
      width: 640,
      height: 360,
      nocookie: true,
    }),
  ];
}
