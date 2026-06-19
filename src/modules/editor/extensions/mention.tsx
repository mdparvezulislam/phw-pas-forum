import { mergeAttributes, Node, ReactNodeViewRenderer } from "@tiptap/core";

interface MentionOptions {
  HTMLAttributes: Record<string, unknown>;
  suggestion: {
    char?: string;
    command?: (props: {
      editor: any;
      range: any;
      props: MentionAttrs;
    }) => void;
  };
}

export interface MentionAttrs {
  id: string;
  userId: string;
  username: string;
  displayName?: string | null;
}

export const Mention = Node.create<MentionOptions>({
  name: "mention",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      suggestion: {
        char: "@",
      },
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
      displayName: {
        default: null,
        parseHTML: (element: HTMLElement) =>
          element.getAttribute("data-display-name"),
        renderHTML: (attributes: Record<string, unknown>) => ({
          "data-display-name": attributes.displayName,
        }),
      },
    };
  },

  addCommands() {
    return {
      setMention:
        (attrs: MentionAttrs) =>
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
      const attrs = node.attrs as unknown as MentionAttrs;
      const display = attrs.displayName || attrs.username;

      return (
        <a
          href={`/u/${attrs.username}`}
          className="mention-chip inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-sm font-medium text-primary no-underline transition-colors hover:bg-primary/20"
          contentEditable={false}
          data-mention-id={attrs.userId}
        >
          <span className="text-primary/70">@</span>
          <span>{display}</span>
        </a>
      );
    });
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-type="mention"]',
        getAttrs: (element: HTMLElement) => {
          return {
            id: element.getAttribute("data-id"),
            userId: element.getAttribute("data-user-id"),
            username: element.getAttribute("data-username"),
            displayName: element.getAttribute("data-display-name"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(
        { "data-type": "mention" },
        this.options.HTMLAttributes,
        HTMLAttributes,
      ),
    ];
  },
});

export default Mention;
