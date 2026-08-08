"use client";

import { RoomProvider } from "@/lib/liveblocks.config";
import { Canvas } from "./Canvas";

export function BoardRoom({ id }: { id: string }) {
  return (
    <RoomProvider
      id={`board-${id}`}
      initialPresence={{ cursor: null, userName: "Anonymous" }}
      initialStorage={{ document: "" }}
    >
      <div className="w-screen h-screen overflow-hidden">
        <Canvas />
      </div>
    </RoomProvider>
  );
}
