"use client";

import { type Editor, useEditorState } from "@tiptap/react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { SlashCommandItem } from "../extensions/slash-command";

interface SlashCommandDropdownProps {
  editor: Editor | null;
}

interface SlashCommandState {
  active: boolean;
  query: string;
  range: { from: number; to: number };
  items: SlashCommandItem[];
  index: number;
}

const SLASH_COMMAND_PLUGIN_KEY = "slashCommand";

export function SlashCommandDropdown({ editor }: SlashCommandDropdownProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedIndexRef = useRef(0);

  const state = useEditorState<SlashCommandState | null>({
    editor,
    selector: ({ editor: ed }) => {
      if (!ed) return null;
      const pluginState = (ed.state as any).plugins
        ?.find((p: any) => p?.key?.key === SLASH_COMMAND_PLUGIN_KEY)
        ?.getState(ed.state);
      if (!pluginState || !pluginState.active) return null;
      return pluginState as unknown as SlashCommandState;
    },
  });

  // Keep the ref in sync for external consumers
  useEffect(() => {
    if (state) {
      selectedIndexRef.current = state.index;
    }
  }, [state?.index]);

  // Scroll selected item into view
  useEffect(() => {
    if (!state?.active || !menuRef.current) return;
    const selected = menuRef.current.children[state.index] as
      | HTMLElement
      | undefined;
    selected?.scrollIntoView({ block: "nearest" });
  }, [state?.index]);

  if (!state?.active || state.items.length === 0) return null;

  // Calculate position relative to the editor
  const { from } = state.range;
  const coords = editor?.view.coordsAtPos(from);
  const editorRect = editor?.view.dom.getBoundingClientRect();

  const top = coords ? coords.bottom - (editorRect?.top ?? 0) + 4 : 0;
  const left = coords ? coords.left - (editorRect?.left ?? 0) : 0;

  return (
    <div
      ref={menuRef}
      className="slash-command-dropdown absolute z-50 w-64 max-h-80 overflow-y-auto rounded-lg border bg-popover shadow-lg"
      style={{ top: `${top}px`, left: `${left}px` }}
      role="listbox"
    >
      {state.items.map((item, idx) => (
        <button
          key={item.title}
          type="button"
          role="option"
          aria-selected={idx === state.index}
          className={cn(
            "flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors",
            idx === state.index
              ? "bg-accent text-accent-foreground"
              : "hover:bg-muted",
          )}
          onMouseDown={(e) => {
            e.preventDefault();
            item.command({ editor: editor!, range: state.range });
            // Deactivate via plugin meta
            const plugin = (editor?.state as any).plugins?.find(
              (p: any) => p?.key?.key === SLASH_COMMAND_PLUGIN_KEY,
            );
            if (plugin) {
              const tr = editor!.state.tr.setMeta(plugin.key, {
                active: false,
                query: "",
                items: [],
                index: 0,
              });
              editor!.view.dispatch(tr);
            }
          }}
          onMouseEnter={() => {
            // Update selected index on hover
            const plugin = (editor?.state as any).plugins?.find(
              (p: any) => p?.key?.key === SLASH_COMMAND_PLUGIN_KEY,
            );
            if (plugin && idx !== state.index) {
              const tr = editor!.state.tr.setMeta(plugin.key, {
                ...state,
                index: idx,
              });
              editor!.view.dispatch(tr);
            }
          }}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background text-sm font-medium">
            {item.icon}
          </span>
          <div className="min-w-0">
            <p className="font-medium">{item.title}</p>
            <p className="truncate text-xs text-muted-foreground">
              {item.description}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}
