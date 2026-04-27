import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import ChatLayoutShell from "@/components/ChatLayoutShell";
import ChatListPane, { type ChatListItem } from "@/components/ChatListPane";

export const dynamic = "force-dynamic";

export default async function ChatsLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  const chats = await db.chat.findMany({
    where: { OR: [{ userAId: user.id }, { userBId: user.id }] },
    orderBy: { createdAt: "desc" },
    include: {
      userA: { include: { profile: true } },
      userB: { include: { profile: true } },
      request: { include: { listing: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    take: 200,
  });

  const items: ChatListItem[] = chats.map((c) => {
    const other = c.userAId === user.id ? c.userB : c.userA;
    const otherName = other?.profile?.name || other?.email || "Foydalanuvchi";
    const initial = (otherName.trim()[0] || "?").toUpperCase();
    const lastMsg = c.messages[0] || null;
    const ended = !!c.endedAt || c.endsAt.getTime() < Date.now();
    return {
      id: c.id,
      otherName,
      initial,
      category: c.request?.listing?.category || "kelinlar",
      lastMessage: lastMsg ? lastMsg.body : null,
      lastFromMe: lastMsg ? lastMsg.senderId === user.id : false,
      lastAt: lastMsg ? lastMsg.createdAt.toISOString() : null,
      ended,
      endsAt: c.endsAt.toISOString(),
      createdAt: c.createdAt.toISOString(),
    };
  });

  return (
    <ChatLayoutShell list={<ChatListPane chats={items} />}>{children}</ChatLayoutShell>
  );
}
