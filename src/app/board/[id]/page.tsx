import { RoomProvider } from "@/lib/liveblocks.config";
import { Canvas } from "@/components/Canvas";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BoardPage({ params }: Props) {
  const { id } = await params;

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
