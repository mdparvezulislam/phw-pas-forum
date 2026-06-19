import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/core";

interface QuoteOptions {
  HTMLAttributes: Record<string, unknown>;
}

export interface QuoteAttrs {
  id: string;
  postId: string;
  userId: string;
  username: string;
  createdAt: string;
  postNumber?: number;
  contentHtml?: string;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export const Quote = Node.create<QuoteOptions>({
  name: "quote",
  group: "block",
  atom: true,
  isolating: true,
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-id"),
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-id": attributes.id,
        }),
      },
      postId: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-post-id"),
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-post-id": attributes.postId,
        }),
      },
      userId: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-user-id"),
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-user-id": attributes.userId,
        }),
      },
      username: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-username"),
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-username": attributes.username,
        }),
      },
      createdAt: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-created-at"),
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-created-at": attributes.createdAt,
        }),
      },
      postNumber: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-post-number"),
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-post-number": attributes.postNumber,
        }),
      },
      contentHtml: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-content-html"),
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-content-html": attributes.contentHtml,
        }),
      },
    };
  },

  addCommands() {
    return {
      insertQuote:
        (attrs: QuoteAttrs) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    } as any;
  },

  addNodeView() {
    return ReactNodeViewRenderer(({ node }) => {
      const attrs = node.attrs as unknown as QuoteAttrs;

      return (
        <div className="quote-block my-3 rounded-lg border border-primary/20 bg-muted/30 overflow-hidden" data-type="quote">
          <div className="flex items-center gap-3 border-b border-primary/10 bg-muted/50 px-4 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
              {(attrs.username || "?").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-semibold text-foreground">
                  {attrs.username || "Unknown"}
                </span>
                <span className="text-muted-foreground">
                  said:
                </span>
              </div>
              {attrs.postNumber && (
                <a
                  href={`#post-${attrs.postNumber}`}
                  className="text-xs text-primary hover:text-primary/80 no-underline"
                  contentEditable={false}
                >
                  Post #{attrs.postNumber}
                </a>
              )}
            </div>
            {attrs.createdAt && (
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDate(attrs.createdAt)}
              </span>
            )}
          </div>
          {attrs.contentHtml && (
            <div
              className="px-4 py-3 prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
              contentEditable={false}
            >
              {/* eslint-disable-next-line react/no-dangerous-set-innerhtml */}
              <div dangerouslySetInnerHTML={{ __html: attrs.contentHtml }} />
            </div>
          )}
        </div>
      );
    });
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="quote"]',
        getAttrs: (element: HTMLElement) => {
          return {
            id: element.getAttribute("data-id"),
            postId: element.getAttribute("data-post-id"),
            userId: element.getAttribute("data-user-id"),
            username: element.getAttribute("data-username"),
            createdAt: element.getAttribute("data-created-at"),
            postNumber: element.getAttribute("data-post-number"),
            contentHtml: element.getAttribute("data-content-html"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(
        { "data-type": "quote" },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
    ];
  },
});

export default Quote;
