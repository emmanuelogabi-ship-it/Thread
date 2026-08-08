import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

type Presence = {
  cursor: { x: number; y: number } | null;
  userName: string;
};

type Storage = {
  document: string;
};

type UserMeta = {
  id: string;
  info: {
    name: string;
    color: string;
  };
};

export const {
  RoomProvider,
  useStorage,
  useMutation,
  useOthers,
  useSelf,
  useUpdateMyPresence,
} = createRoomContext<Presence, Storage, UserMeta>(client);
