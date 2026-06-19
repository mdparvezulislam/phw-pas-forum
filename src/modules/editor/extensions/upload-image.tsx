import { mergeAttributes, Node } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ReactNodeViewRenderer } from "@tiptap/react";

const uploadImagePluginKey = new PluginKey("uploadImage");

interface UploadImageOptions {
  uploadFn: (file: File) => Promise<{ url: string; alt?: string }>;
  onUploadStart?: (id: string) => void;
  onUploadProgress?: (id: string, progress: number) => void;
  onUploadComplete?: (id: string, url: string) => void;
  onUploadError?: (id: string, error: Error) => void;
  accept?: string;
  maxSize?: number;
  HTMLAttributes?: Record<string, unknown>;
}

async function handleImageUpload(
  file: File,
  options: UploadImageOptions,
  view: any,
): Promise<void> {
  const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

  if (options.maxSize && file.size > options.maxSize) {
    const error = new Error(
      `File size exceeds maximum of ${options.maxSize} bytes`,
    );
    options.onUploadError?.(id, error);
    return;
  }

  if (options.accept) {
    const acceptedTypes = options.accept.split(",").map((t) => t.trim());
    const isValid = acceptedTypes.some((type) => {
      if (type.startsWith(".")) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      if (type.includes("*")) {
        return file.type.startsWith(type.replace("*", ""));
      }
      return file.type === type;
    });
    if (!isValid) {
      const error = new Error(`File type ${file.type} is not accepted`);
      options.onUploadError?.(id, error);
      return;
    }
  }

  options.onUploadStart?.(id);

  const tempPos = view.state.selection.from;
  (view.chain() as any)
    .focus()
    .insertContentAt(tempPos, {
      type: "image",
      attrs: {
        src: "",
        alt: file.name,
        title: file.name,
        "data-upload-id": id,
        "data-upload-status": "uploading",
      },
    })
    .run();

  try {
    const result = await options.uploadFn(file);
    options.onUploadComplete?.(id, result.url);
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Upload failed");
    options.onUploadError?.(id, err);
  }
}

export const UploadImage = Node.create<UploadImageOptions>({
  name: "uploadImage",

  addOptions() {
    return {
      uploadFn: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("Upload failed");
        return response.json();
      },
      onUploadStart: undefined,
      onUploadProgress: undefined,
      onUploadComplete: undefined,
      onUploadError: undefined,
      accept: "image/*",
      maxSize: 10 * 1024 * 1024,
      HTMLAttributes: {},
    };
  },

  addCommands() {
    return {
      uploadImage:
        (file: File) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: "",
              alt: file.name,
              title: file.name,
              "data-upload-id": `temp-${Date.now()}`,
              "data-upload-status": "pending",
            },
          });
        },
    } as any;
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: uploadImagePluginKey,
        props: {
          handlePaste: (view, event) => {
            const items = Array.from(event.clipboardData?.items || []);
            const imageItems = items.filter((item) =>
              item.type.startsWith("image/"),
            );

            if (imageItems.length === 0) return false;

            event.preventDefault();
            imageItems.forEach((item) => {
              const file = item.getAsFile();
              if (file) {
                handleImageUpload(file, this.options, view);
              }
            });

            return true;
          },
          handleDOMEvents: {
            drop: (view, event) => {
              const files = Array.from(event.dataTransfer?.files || []);
              const imageFiles = files.filter((f) =>
                f.type.startsWith("image/"),
              );

              if (imageFiles.length === 0) return false;

              event.preventDefault();
              imageFiles.forEach((file) => {
                handleImageUpload(file, this.options, view);
              });

              return true;
            },
            dragover: (_view, event) => {
              const files = Array.from(event.dataTransfer?.files || []);
              const hasImages = files.some((f) => f.type.startsWith("image/"));
              if (hasImages) {
                event.preventDefault();
              }
              return false;
            },
          },
        },
      }),
    ];
  },

  parseHTML() {
    return [
      {
        tag: "img[data-upload-id]",
        getAttrs: (element) => {
          const el = element as HTMLImageElement;
          return {
            src: el.getAttribute("src"),
            alt: el.getAttribute("alt"),
            title: el.getAttribute("title"),
            "data-upload-id": el.getAttribute("data-upload-id"),
            "data-upload-status": el.getAttribute("data-upload-status"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes || {}, HTMLAttributes),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(({ node }) => {
      const attrs = node.attrs as Record<string, string>;
      const status = attrs["data-upload-status"];

      if (status === "error") {
        return (
          <div className="upload-image-error flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            <span>Failed to upload image</span>
            <button type="button" className="underline hover:no-underline">
              Retry
            </button>
          </div>
        );
      }

      return (
        <img
          src={attrs.src}
          alt={attrs.alt}
          title={attrs.title}
          className="max-w-full h-auto rounded"
          style={{ opacity: status === "uploading" ? 0.5 : 1 }}
        />
      );
    });
  },
});

export default UploadImage;
