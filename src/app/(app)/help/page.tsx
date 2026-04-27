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
    <div className="grid gap-4">
      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)] backdrop-blur">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">YORDAM</div>
            <h1 className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">
              Adminlarga yozing
            </h1>
            <p className="mt-1 text-[13px] font-medium text-zinc-600">
              Savol yoki muammo bo‘lsa shu yerda yozing. Javoblar ham shu chat orqali keladi.
            </p>
          </div>
        </div>
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
