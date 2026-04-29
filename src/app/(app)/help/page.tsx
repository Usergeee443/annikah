import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import SupportRoom from "@/components/SupportRoom";
import Link from "next/link";

export default async function HelpPage() {
  const user = await requireUser();

  const thread = await db.supportThread.upsert({
    where: { userId: user.id },
    create: { userId: user.id, status: "open" },
    update: {},
    select: { id: true },
  });

  const messages = await db.supportMessage.findMany({
    where: { threadId: thread.id },
    orderBy: { createdAt: "asc" },
    take: 200,
  });

  return (
    <div className="-mx-4 -mt-4 flex min-h-[calc(100dvh-env(safe-area-inset-bottom))] flex-col overflow-hidden bg-white/70 sm:-mx-5 sm:-mt-5 md:m-0 md:min-h-0 md:rounded-3xl md:border md:border-zinc-200/70 md:bg-white md:shadow-[0_8px_28px_rgba(15,23,42,.05)]">
      <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-zinc-200/70 bg-white/95 px-4 py-3 pt-[calc(env(safe-area-inset-top)+12px)] backdrop-blur sm:px-5">
        <Link
          href="/profile"
          aria-label="Orqaga"
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
            <path
              d="m15 6-6 6 6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
      <SupportRoom
        initialMessages={messages.map((m) => ({
          id: m.id,
          body: m.body,
          sender: m.sender,
          createdAt: m.createdAt.toISOString(),
        }))}
      />
    </div>
  );
}
