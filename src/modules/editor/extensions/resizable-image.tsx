import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { useCallback, useRef, useState } from "react";

interface ResizableImageOptions {
  HTMLAttributes: Record<string, unknown>;
  inline: boolean;
  allowBase64: boolean;
}

interface ImageAttrs {
  src: string;
  alt: string;
  title: string;
  width: number;
  height: number;
  align: "left" | "center" | "right";
}

function ResizableImageView({
  node,
  updateAttributes,
  selected,
}: {
  node: { attrs: Record<string, unknown> };
  updateAttributes: (attrs: Partial<ImageAttrs>) => void;
  selected: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [aspectRatio, setAspectRatio] = useState(1);

  const attrs = node.attrs as unknown as ImageAttrs;

  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      setAspectRatio(naturalWidth / naturalHeight);
      if (!attrs.width && !attrs.height) {
        updateAttributes({
          width: Math.min(naturalWidth, 600),
          height: Math.min(naturalHeight, 400),
        });
      }
    }
  }, [attrs.width, attrs.height, updateAttributes]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, direction: "left" | "right") => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = imgRef.current?.offsetWidth || attrs.width || 300;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        let newWidth: number;

        if (direction === "left") {
          newWidth = startWidth - deltaX;
        } else {
          newWidth = startWidth + deltaX;
        }

        newWidth = Math.max(100, Math.min(newWidth, 1200));
        const newHeight = newWidth / aspectRatio;

        updateAttributes({
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        });
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };

      document.body.style.cursor = "ew-resize";
      document.body.style.userSelect = "none";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [aspectRatio, attrs.width, updateAttributes],
  );

  const handleAlignChange = useCallback(
    (align: "left" | "center" | "right") => {
      updateAttributes({ align });
    },
    [updateAttributes],
  );

  return (
    <div
      ref={containerRef}
      className={`resizable-image-wrapper relative inline-block my-2 ${
        attrs.align === "center"
          ? "mx-auto block text-center"
          : attrs.align === "right"
            ? "float-right ml-4"
            : "float-left mr-4"
      }`}
      style={{
        width: attrs.width ? `${attrs.width}px` : "auto",
      }}
    >
      {selected && (
        <div className="absolute -top-8 left-0 right-0 flex items-center justify-center gap-1 z-10">
          <div className="flex items-center bg-white border border-gray-200 rounded-md shadow-sm text-xs">
            <button
              type="button"
              onClick={() => handleAlignChange("left")}
              className={`px-2 py-1 hover:bg-gray-100 rounded-l-md ${
                attrs.align === "left" ? "bg-blue-100 text-blue-700" : ""
              }`}
              title="Align left"
            >
              &larr;
            </button>
            <button
              type="button"
              onClick={() => handleAlignChange("center")}
              className={`px-2 py-1 hover:bg-gray-100 ${
                attrs.align === "center" ? "bg-blue-100 text-blue-700" : ""
              }`}
              title="Align center"
            >
              &harr;
            </button>
            <button
              type="button"
              onClick={() => handleAlignChange("right")}
              className={`px-2 py-1 hover:bg-gray-100 rounded-r-md ${
                attrs.align === "right" ? "bg-blue-100 text-blue-700" : ""
              }`}
              title="Align right"
            >
              &rarr;
            </button>
          </div>
        </div>
      )}
      <div className="relative group">
        <img
          ref={imgRef}
          src={attrs.src}
          alt={attrs.alt}
          title={attrs.title}
          width={attrs.width}
          height={attrs.height}
          onLoad={handleImageLoad}
          className="max-w-full h-auto rounded cursor-pointer"
          draggable={false}
        />
        {selected && (
          <>
            <button
              type="button"
              className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-blue-500 rounded-l transition-opacity"
              onMouseDown={(e) => handleMouseDown(e, "left")}
              aria-label="Resize left"
            />
            <button
              type="button"
              className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-blue-500 rounded-r transition-opacity"
              onMouseDown={(e) => handleMouseDown(e, "right")}
              aria-label="Resize right"
            />
          </>
        )}
      </div>
      {attrs.width && (
        <div className="text-center text-xs text-gray-400 mt-1">
          {Math.round(attrs.width)} x {Math.round(attrs.height)}
        </div>
      )}
    </div>
  );
}

export const ResizableImage = Node.create<ResizableImageOptions>({
  name: "resizableImage",
  group: "block",
  atom: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      inline: false,
      allowBase64: false,
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.querySelector("img")?.getAttribute("src"),
      },
      alt: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.querySelector("img")?.getAttribute("alt"),
      },
      title: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.querySelector("img")?.getAttribute("title"),
      },
      width: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const width = element.querySelector("img")?.getAttribute("width");
          return width ? Number.parseInt(width, 10) : null;
        },
      },
      height: {
        default: null,
        parseHTML: (element: HTMLElement) => {
          const height = element.querySelector("img")?.getAttribute("height");
          return height ? Number.parseInt(height, 10) : null;
        },
      },
      align: {
        default: "left",
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-align") || "left",
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-align": attributes.align,
        }),
      },
    };
  },

  addCommands() {
    return {
      setResizableImage:
        (options: { src: string; alt?: string; title?: string }) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              src: options.src,
              alt: options.alt || "",
              title: options.title || "",
              width: 300,
              height: 200,
              align: "left",
            },
          });
        },
      setImageAlignment:
        (align: "left" | "center" | "right") =>
        ({ commands }: { commands: any }) => {
          return commands.updateAttributes(this.name, { align });
        },
      setImageSize:
        (width: number, height: number) =>
        ({ commands }: { commands: any }) => {
          return commands.updateAttributes(this.name, { width, height });
        },
    } as any;
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageView);
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="resizable-image"]',
        getAttrs: (element: HTMLElement) => {
          const img = element.querySelector("img");
          const widthAttr = img?.getAttribute("width");
          const heightAttr = img?.getAttribute("height");
          return {
            src: img?.getAttribute("src"),
            alt: img?.getAttribute("alt"),
            title: img?.getAttribute("title"),
            width: widthAttr ? Number.parseInt(widthAttr, 10) : null,
            height: heightAttr ? Number.parseInt(heightAttr, 10) : null,
            align: element.getAttribute("data-align") || "left",
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, alt, title, width, height, align, ...restAttrs } =
      HTMLAttributes as Record<string, unknown>;
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, restAttrs, {
        "data-type": "resizable-image",
        "data-align": align || "left",
        style: `width: ${width ? `${width}px` : "auto"}; text-align: ${align || "left"};`,
      }),
      [
        "img",
        mergeAttributes(
          { src, alt, title, width, height },
          this.options.HTMLAttributes,
        ),
      ],
    ];
  },
});

export default ResizableImage;
