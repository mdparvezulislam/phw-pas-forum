import type { Range } from "@tiptap/core";
import { Extension } from "@tiptap/core";
import type { Editor } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { DecorationSet, type EditorView } from "@tiptap/pm/view";

interface SlashCommandConfig {
  items: SlashCommandItem[];
}

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

export interface SlashCommandState {
  active: boolean;
  query: string;
  range: Range;
  items: SlashCommandItem[];
  index: number;
}

const slashCommandPluginKey = new PluginKey<SlashCommandState>("slashCommand");

function getDefaultItems(): SlashCommandItem[] {
  return [
    {
      title: "Heading 1",
      description: "Large section heading",
      icon: "H1",
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 1 })
          .run();
      },
    },
    {
      title: "Heading 2",
      description: "Medium section heading",
      icon: "H2",
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 2 })
          .run();
      },
    },
    {
      title: "Heading 3",
      description: "Small section heading",
      icon: "H3",
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .setNode("heading", { level: 3 })
          .run();
      },
    },
    {
      title: "Bullet List",
      description: "Create a bullet list",
      icon: "•",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBulletList().run();
      },
    },
    {
      title: "Ordered List",
      description: "Create an ordered list",
      icon: "1.",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleOrderedList().run();
      },
    },
    {
      title: "Task List",
      description: "Create a task list",
      icon: "☑",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleTaskList().run();
      },
    },
    {
      title: "Code Block",
      description: "Insert a code block",
      icon: "‹/›",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
      },
    },
    {
      title: "Blockquote",
      description: "Insert a blockquote",
      icon: "❝",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).toggleBlockquote().run();
      },
    },
    {
      title: "Table",
      description: "Insert a table",
      icon: "⊞",
      command: ({ editor, range }) => {
        editor
          .chain()
          .focus()
          .deleteRange(range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run();
      },
    },
    {
      title: "Image",
      description: "Insert an image",
      icon: "\u{1F5BC}",
      command: ({ editor, range }) => {
        const url = window.prompt("Enter image URL:");
        if (url) {
          editor
            .chain()
            .focus()
            .deleteRange(range)
            .insertContent({
              type: "image",
              attrs: { src: url, alt: url, title: "" },
            })
            .run();
        }
      },
    },
    {
      title: "Divider",
      description: "Insert a horizontal rule",
      icon: "—",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
    {
      title: "Horizontal Rule",
      description: "Insert a horizontal line",
      icon: "⎯",
      command: ({ editor, range }) => {
        editor.chain().focus().deleteRange(range).setHorizontalRule().run();
      },
    },
  ];
}

export const SlashCommand = Extension.create<SlashCommandConfig>({
  name: "slashCommand",

  addOptions() {
    return {
      items: getDefaultItems(),
    };
  },

  addProseMirrorPlugins() {
    const extension = this;

    return [
      new Plugin({
        key: slashCommandPluginKey,
        state: {
          init() {
            return {
              active: false,
              query: "",
              range: { from: 0, to: 0 },
              items: [],
              index: 0,
            };
          },
          apply(tr, prev) {
            const meta = tr.getMeta(slashCommandPluginKey);
            if (meta) {
              return meta;
            }
            if (!tr.docChanged && !tr.selectionSet) {
              return prev;
            }
            if (prev.active && tr.docChanged) {
              const { from } = prev.range;
              const cursorPos = tr.selection.$from.pos;
              if (cursorPos < from) {
                return {
                  ...prev,
                  active: false,
                  query: "",
                  items: [],
                  index: 0,
                };
              }
              const textBetween = tr.doc.textBetween(from, cursorPos, "", "\n");
              if (!textBetween.startsWith("/")) {
                return {
                  ...prev,
                  active: false,
                  query: "",
                  items: [],
                  index: 0,
                };
              }
              const query = textBetween.slice(1);
              const allItems = extension.options.items;
              const filtered = query
                ? allItems.filter(
                    (item) =>
                      item.title.toLowerCase().includes(query.toLowerCase()) ||
                      item.description
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                  )
                : allItems;
              return {
                ...prev,
                query,
                items: filtered,
                index: 0,
              };
            }
            return prev;
          },
        },
        props: {
          decorations() {
            return DecorationSet.empty;
          },
          handleKeyDown(view, event) {
            const pluginState = slashCommandPluginKey.getState(view.state);
            if (!pluginState?.active) {
              return false;
            }

            if (event.key === "Escape") {
              view.dispatch(
                view.state.tr.setMeta(slashCommandPluginKey, {
                  ...pluginState,
                  active: false,
                  query: "",
                  items: [],
                  index: 0,
                }),
              );
              return true;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              const newIndex =
                pluginState.index < pluginState.items.length - 1
                  ? pluginState.index + 1
                  : 0;
              view.dispatch(
                view.state.tr.setMeta(slashCommandPluginKey, {
                  ...pluginState,
                  index: newIndex,
                }),
              );
              return true;
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              const newIndex =
                pluginState.index > 0
                  ? pluginState.index - 1
                  : pluginState.items.length - 1;
              view.dispatch(
                view.state.tr.setMeta(slashCommandPluginKey, {
                  ...pluginState,
                  index: newIndex,
                }),
              );
              return true;
            }

            if (event.key === "Enter") {
              event.preventDefault();
              const item = pluginState.items[pluginState.index];
              if (item) {
                item.command({
                  editor: view as unknown as Editor,
                  range: pluginState.range,
                });
                view.dispatch(
                  view.state.tr.setMeta(slashCommandPluginKey, {
                    ...pluginState,
                    active: false,
                    query: "",
                    items: [],
                    index: 0,
                  }),
                );
              }
              return true;
            }

            return false;
          },
          handleClick(view) {
            const pluginState = slashCommandPluginKey.getState(view.state);
            if (pluginState?.active) {
              view.dispatch(
                view.state.tr.setMeta(slashCommandPluginKey, {
                  ...pluginState,
                  active: false,
                  query: "",
                  items: [],
                  index: 0,
                }),
              );
            }
            return false;
          },
        },
        appendTransaction: (_transactions, _oldState, newState) => {
          const pluginState = slashCommandPluginKey.getState(newState);
          if (!pluginState?.active) return null;

          const { from } = pluginState.range;
          const cursorPos = newState.selection.$from.pos;
          if (cursorPos < from) {
            return newState.tr.setMeta(slashCommandPluginKey, {
              ...pluginState,
              active: false,
              query: "",
              items: [],
              index: 0,
            });
          }

          return null;
        },
      }),
    ];
  },

  addKeyboardShortcuts() {
    return {
      "/": ({ editor }) => {
        const { $from } = editor.state.selection;
        const textBefore = $from.parent.textContent.slice(
          0,
          $from.parentOffset,
        );
        const isAtStart = $from.parentOffset === 0 || textBefore.endsWith(" ");

        if (!isAtStart) return false;

        const from = editor.state.selection.from;
        const pluginState = slashCommandPluginKey.getState(editor.state);

        if (pluginState?.active) return false;

        editor.view.dispatch(
          editor.state.tr.setMeta(slashCommandPluginKey, {
            active: true,
            query: "",
            range: { from, to: from },
            items: this.options.items,
            index: 0,
          }),
        );

        return false;
      },
    };
  },
});
