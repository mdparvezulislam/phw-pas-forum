import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

interface AttachmentOptions {
  HTMLAttributes: Record<string, unknown>;
  onDownload?: (attrs: AttachmentAttrs) => void;
  onRemove?: (attrs: AttachmentAttrs) => void;
}

interface AttachmentAttrs {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  url: string;
  storageKey: string;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
}

function getFileIcon(fileType: string): string {
  if (fileType.startsWith("image/")) return "\u{1F5BC}";
  if (fileType.startsWith("video/")) return "\u{1F3AC}";
  if (fileType.startsWith("audio/")) return "\u{1F3B5}";
  if (fileType.includes("pdf")) return "\u{1F4C4}";
  if (fileType.includes("zip") || fileType.includes("rar")) return "\u{1F4E6}";
  if (fileType.includes("word") || fileType.includes("document")) return "\u{1F4DD}";
  if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "\u{1F4CA}";
  if (fileType.includes("presentation")) return "\u{1F4D1}";
  return "\u{1F4CE}";
}

export const Attachment = Node.create<AttachmentOptions>({
  name: "attachment",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      onDownload: undefined,
      onRemove: undefined,
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-attachment-id"),
        renderHTML: (attributes: Record<string, unknown>) => ({ "data-attachment-id": attributes.id }),
      },
      fileName: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-file-name"),
        renderHTML: (attributes: Record<string, unknown>) => ({ "data-file-name": attributes.fileName }),
      },
      fileType: {
        default: "application/octet-stream",
        parseHTML: (element: HTMLElement) => element.getAttribute("data-file-type"),
        renderHTML: (attributes: Record<string, unknown>) => ({ "data-file-type": attributes.fileType }),
      },
      fileSize: {
        default: 0,
        parseHTML: (element: HTMLElement) => {
          const value = element.getAttribute("data-file-size");
          return value ? Number.parseInt(value, 10) : 0;
        },
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-file-size": String(attributes.fileSize),
        }),
      },
      url: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-url"),
        renderHTML: (attributes: Record<string, unknown>) => ({ "data-url": attributes.url }),
      },
      storageKey: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-storage-key"),
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-storage-key": attributes.storageKey,
        }),
      },
    };
  },

  addCommands() {
    return {
      setAttachment:
        (attrs: AttachmentAttrs) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
      removeAttachment:
        () =>
        ({ commands }: { commands: any }) => {
          return commands.deleteNode(this.name);
        },
    } as any;
  },

  addNodeView() {
    return ReactNodeViewRenderer(({ node, deleteNode, extension }) => {
      const attrs = node.attrs as AttachmentAttrs;
      const icon = getFileIcon(attrs.fileType);
      const size = formatFileSize(attrs.fileSize);

      const handleDownload = () => {
        if (extension.options.onDownload) {
          extension.options.onDownload(attrs);
        } else if (attrs.url) {
          window.open(attrs.url, "_blank");
        }
      };

      const handleRemove = () => {
        if (extension.options.onRemove) {
          extension.options.onRemove(attrs);
        }
        deleteNode();
      };

      return (
        <div className="attachment-card group flex items-center gap-3 p-3 my-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
          <span
            className="shrink-0 text-2xl"
            role="img"
            aria-label={attrs.fileType}
          >
            {icon}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {attrs.fileName}
            </p>
            <p className="text-xs text-gray-500">{size}</p>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={handleDownload}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Download"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Remove"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      );
    });
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="attachment"]',
        getAttrs: (element: HTMLElement) => {
          return {
            id: element.getAttribute("data-attachment-id"),
            fileName: element.getAttribute("data-file-name"),
            fileType: element.getAttribute("data-file-type"),
            fileSize: element.getAttribute("data-file-size"),
            url: element.getAttribute("data-url"),
            storageKey: element.getAttribute("data-storage-key"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "attachment",
      }),
    ];
  },
});

export default Attachment;
