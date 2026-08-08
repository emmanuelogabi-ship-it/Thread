import Link from "next/link";
import { randomUUID } from "crypto";
import { ThemeToggle } from "@/components/ThemeToggle";

const DEMO_BOARDS = [
  { id: "welcome", name: "Welcome Board", updatedAt: "Just now" },
  { id: "roadmap", name: "Product Roadmap", updatedAt: "2 hours ago" },
  { id: "retro",  name: "Sprint Retrospective", updatedAt: "Yesterday" },
];

function BoardCard({ id, name, updatedAt }: { id: string; name: string; updatedAt: string }) {
  return (
    <Link
      href={`/board/${id}`}
      className="group flex flex-col rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md transition-all overflow-hidden"
    >
      <div className="h-36 bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-violet-950/40 dark:to-indigo-950/60 flex items-center justify-center">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="opacity-30 group-hover:opacity-50 transition-opacity">
          <rect x="6" y="6" width="36" height="36" rx="4" stroke="#4F46E5" strokeWidth="2"/>
          <line x1="14" y1="18" x2="34" y2="18" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
          <line x1="14" y1="24" x2="28" y2="24" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
          <line x1="14" y1="30" x2="22" y2="30" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      <div className="p-4">
        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{name}</p>
        <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">Edited {updatedAt}</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const newBoardId = randomUUID();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1L13 4V10L7 13L1 10V4L7 1Z" fill="white"/>
              </svg>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100 tracking-tight">Thread</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href={`/board/${newBoardId}`}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              New board
            </Link>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-6">Your boards</h1>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {/* Create new board card */}
          <Link
            href={`/board/${newBoardId}`}
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 h-48 text-zinc-400 dark:text-zinc-600 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/40 dark:hover:border-indigo-500 dark:hover:text-indigo-400 dark:hover:bg-indigo-950/30 transition-all"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path d="M14 6V22M6 14H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="mt-2 text-sm font-medium">New board</span>
          </Link>

          {/* Demo boards */}
          {DEMO_BOARDS.map((board) => (
            <BoardCard key={board.id} {...board} />
          ))}
        </div>

        <p className="mt-10 text-xs text-zinc-400 dark:text-zinc-600 text-center">
          Connect Supabase to persist boards across sessions.{" "}
          <span className="text-zinc-500 dark:text-zinc-500">See .env.example</span>
        </p>
      </main>
    </div>
  );
}
