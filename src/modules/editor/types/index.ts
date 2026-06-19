import type { Editor, JSONContent, Range } from "@tiptap/core";

export interface EditorConfig {
  placeholder?: string;
  editable?: boolean;
  maxLength?: number;
  minHeight?: string;
  onUpdate?: (json: JSONContent, text: string) => void;
  onAttachmentAdd?: (file: File) => void;
}

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

export interface MediaEmbed {
  type: "image" | "video" | "youtube" | "link";
  url: string;
  alt?: string;
  width?: number;
  height?: number;
}

export type { JSONContent };
