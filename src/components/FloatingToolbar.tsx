"use client";

import {
  useEditor,
  createShapeId,
  AssetRecordType,
  TLShapeId,
} from "@tldraw/tldraw";
import { useState, useRef, useEffect } from "react";

type ConnectMode = "idle" | "picking-first" | "picking-second";

function createArrow(editor: ReturnType<typeof useEditor>, fromId: TLShapeId, toId: TLShapeId) {
  const fromBounds = editor.getShapePageBounds(fromId);
  const toBounds = editor.getShapePageBounds(toId);
  if (!fromBounds || !toBounds) return;

  const arrowId = createShapeId();

  editor.run(() => {
    editor.createShape({
      id: arrowId,
      type: "arrow",
      x: fromBounds.midX,
      y: fromBounds.midY,
      props: {
        start: { x: 0, y: 0 },
        end: {
          x: toBounds.midX - fromBounds.midX,
          y: toBounds.midY - fromBounds.midY,
        },
        color: "violet",
        size: "m",
        arrowheadStart: "none",
        arrowheadEnd: "none",
        dash: "solid",
      },
    });

    editor.createBinding({
      type: "arrow",
      fromId: arrowId,
      toId: fromId,
      props: {
        terminal: "start",
        normalizedAnchor: { x: 0.5, y: 0.5 },
        isExact: false,
        isPrecise: false,
      },
    } as Parameters<typeof editor.createBinding>[0]);

    editor.createBinding({
      type: "arrow",
      fromId: arrowId,
      toId: toId,
      props: {
        terminal: "end",
        normalizedAnchor: { x: 0.5, y: 0.5 },
        isExact: false,
        isPrecise: false,
      },
    } as Parameters<typeof editor.createBinding>[0]);
  });
}

export function FloatingToolbar() {
  const editor = useEditor();
  const [connectMode, setConnectModeState] = useState<ConnectMode>("idle");
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const connectModeRef = useRef<ConnectMode>("idle");
  const firstShapeRef = useRef<TLShapeId | null>(null);

  const setConnectMode = (mode: ConnectMode) => {
    connectModeRef.current = mode;
    setConnectModeState(mode);
  };

  // Listen for shape clicks when in connect mode via native DOM
  useEffect(() => {
    const container = editor.getContainer();

    const handleClick = (e: MouseEvent) => {
      if (connectModeRef.current === "idle") return;

      const rect = container.getBoundingClientRect();
      const pagePoint = editor.screenToPage({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });

      const shape = editor.getShapeAtPoint(pagePoint, { hitInside: true });
      if (!shape || shape.type === "arrow") return;

      const shapeId = shape.id;

      if (connectModeRef.current === "picking-first") {
        firstShapeRef.current = shapeId;
        setConnectMode("picking-second");
      } else if (connectModeRef.current === "picking-second") {
        const fromId = firstShapeRef.current;
        if (!fromId || fromId === shapeId) return;
        createArrow(editor, fromId, shapeId);
        firstShapeRef.current = null;
        setConnectMode("idle");
      }
    };

    container.addEventListener("click", handleClick, { capture: true });
    return () => { container.removeEventListener("click", handleClick, { capture: true }); };
  }, [editor]);

  const cancelConnect = () => {
    firstShapeRef.current = null;
    setConnectMode("idle");
  };

  const handleAddImage = async () => {
    const url = imageUrl.trim();
    if (!url) return;
    setIsLoading(true);

    const img = new window.Image();
    img.src = url;
    await Promise.race([
      new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      }),
      new Promise<void>((resolve) => setTimeout(resolve, 4000)),
    ]);

    const naturalW = img.naturalWidth || 400;
    const naturalH = img.naturalHeight || 300;
    const targetW = 320;
    const targetH = Math.round((naturalH / naturalW) * targetW);

    const assetId = AssetRecordType.createId();
    const vp = editor.getViewportPageBounds();

    editor.run(() => {
      editor.createAssets([
        {
          id: assetId,
          type: "image",
          typeName: "asset",
          props: {
            name: url.split("/").pop()?.split("?")[0] ?? "image",
            src: url,
            w: targetW,
            h: targetH,
            mimeType: "image/jpeg",
            isAnimated: false,
          },
          meta: {},
        },
      ]);
      editor.createShape({
        type: "image",
        x: vp.x + (vp.w - targetW) / 2 + (Math.random() - 0.5) * 120,
        y: vp.y + (vp.h - targetH) / 2 + (Math.random() - 0.5) * 120,
        props: { assetId, w: targetW, h: targetH },
      });
    });

    setImageUrl("");
    setShowImageDialog(false);
    setIsLoading(false);
  };

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-xl bg-white shadow-lg border border-zinc-200 px-2 py-1.5 pointer-events-auto select-none"
      style={{ zIndex: 400 }}>

      {/* Add Image */}
      <button
        onClick={() => setShowImageDialog(true)}
        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <rect x="0.5" y="0.5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="4.5" cy="4.5" r="1.5" fill="currentColor" />
          <path d="M0.5 10.5L4.5 6.5L7.5 9.5L10 7L14.5 11.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Add image
      </button>

      <div className="w-px h-5 bg-zinc-200 mx-0.5" />

      {/* Link / Connect shapes */}
      {connectMode === "idle" ? (
        <button
          onClick={() => setConnectMode("picking-first")}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <circle cx="2.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.1" />
            <circle cx="12.5" cy="7.5" r="2" stroke="currentColor" strokeWidth="1.1" />
            <line x1="4.5" y1="7.5" x2="10.5" y2="7.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
          Link shapes
        </button>
      ) : (
        <div className="flex items-center gap-2 rounded-lg bg-indigo-50 border border-indigo-200 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse inline-block" />
          <span className="text-sm font-medium text-indigo-700">
            {connectMode === "picking-first" ? "Click first shape" : "Click second shape"}
          </span>
          <button
            onClick={cancelConnect}
            className="ml-1 rounded px-1.5 py-0.5 text-xs text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Image URL dialog */}
      {showImageDialog && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 500 }}
            onClick={() => { setShowImageDialog(false); setImageUrl(""); }}
          />
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-80 rounded-xl bg-white shadow-2xl border border-zinc-200 p-4"
            style={{ zIndex: 600 }}
          >
            <p className="text-sm font-semibold text-zinc-900 mb-2">Add image from URL</p>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleAddImage(); }}
              placeholder="https://example.com/photo.jpg"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
              autoFocus
            />
            <p className="text-xs text-zinc-400 mb-3">
              Tip: you can also drag & drop image files directly onto the canvas
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowImageDialog(false); setImageUrl(""); }}
                className="rounded-lg px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddImage}
                disabled={!imageUrl.trim() || isLoading}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isLoading ? "Adding…" : "Add image"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
