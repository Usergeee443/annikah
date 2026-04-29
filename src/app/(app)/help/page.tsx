import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import SupportRoom from "@/components/SupportRoom";

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
