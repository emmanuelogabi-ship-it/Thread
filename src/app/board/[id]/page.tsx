import { BoardRoom } from "@/components/BoardRoom";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BoardPage({ params }: Props) {
  const { id } = await params;
  return <BoardRoom id={id} />;
}
