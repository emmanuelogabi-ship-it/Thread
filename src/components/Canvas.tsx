"use client";

import { Tldraw, Editor, TLEditorSnapshot } from "@tldraw/tldraw";
import { FloatingToolbar } from "./FloatingToolbar";
import "@tldraw/tldraw/tldraw.css";
import { useStorage, useMutation, useOthers, useUpdateMyPresence } from "@/lib/liveblocks.config";
import { useCallback, useEffect, useRef } from "react";
import { useTheme } from "next-themes";

const CURSOR_COLORS = [
  "#E03130", "#2F9E44", "#1971C2", "#F08C00",
  "#7048E8", "#C2255C", "#0C8599", "#5C940D",
];

function OtherCursors() {
  const others = useOthers();

  return (
    <>
      {others.map(({ connectionId, presence, info }) => {
        if (!presence.cursor) return null;
        const color = CURSOR_COLORS[connectionId % CURSOR_COLORS.length];
        return (
          <div
            key={connectionId}
            className="pointer-events-none absolute z-50"
            style={{ left: presence.cursor.x, top: presence.cursor.y }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M0 0L0 11.5L3.5 8.5L6 14L7.5 13.5L5 7.5L9 7.5L0 0Z" fill={color} />
            </svg>
            <span
              className="absolute left-4 top-1 rounded px-1.5 py-0.5 text-xs font-medium text-white whitespace-nowrap"
              style={{ backgroundColor: color }}
            >
              {presence.userName}
            </span>
          </div>
        );
      })}
    </>
  );
}

export function Canvas() {
  const { resolvedTheme } = useTheme();
  const editorRef = useRef<Editor | null>(null);
  const isApplyingRemote = useRef(false);
  const document = useStorage((root) => root.document);

  const updateDocument = useMutation(({ storage }, snapshot: string) => {
    storage.set("document", snapshot);
  }, []);

  const updateMyPresence = useUpdateMyPresence();

  // Apply remote changes when storage updates
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !document || isApplyingRemote.current) return;

    isApplyingRemote.current = true;
    try {
      const snapshot = JSON.parse(document) as TLEditorSnapshot;
      editor.store.mergeRemoteChanges(() => {
        editor.loadSnapshot(snapshot);
      });
    } catch {
      // invalid snapshot — ignore
    } finally {
      isApplyingRemote.current = false;
    }
  }, [document]);

  const handleMount = useCallback(
    (editor: Editor) => {
      editorRef.current = editor;

      // Load existing document on first mount
      if (document) {
        try {
          const snapshot = JSON.parse(document) as TLEditorSnapshot;
          editor.loadSnapshot(snapshot);
        } catch {}
      }

      // Track cursor position for presence
      editor.on("event", (event) => {
        if (event.type === "pointer" && event.target === "canvas") {
          updateMyPresence({ cursor: { x: event.point.x, y: event.point.y } });
        }
      });

      // Sync local changes to Liveblocks
      const unsubscribe = editor.store.listen(
        () => {
          if (isApplyingRemote.current) return;
          const snapshot = editor.getSnapshot();
          updateDocument(JSON.stringify(snapshot));
        },
        { source: "user", scope: "document" }
      );

      return unsubscribe;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <div
      className="relative w-full h-full"
      onPointerLeave={() => updateMyPresence({ cursor: null })}
    >
      <OtherCursors />
      <Tldraw
        onMount={handleMount}
        darkMode={resolvedTheme === "dark"}
        components={{ InFrontOfTheCanvas: FloatingToolbar }}
      />
    </div>
  );
}
