import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import ChatRoom from "@/components/ChatRoom";

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  const chat = await db.chat.findUnique({
    where: { id },
    include: {
      userA: { include: { profile: true } },
      userB: { include: { profile: true } },
      request: { include: { listing: true } },
      messages: { orderBy: { createdAt: "asc" }, take: 500 },
    },
  });

  if (!chat) notFound();
  if (chat.userAId !== user.id && chat.userBId !== user.id) notFound();

  const other = chat.userAId === user.id ? chat.userB : chat.userA;
  const otherName = other?.profile?.name || other?.email || "Foydalanuvchi";

  return (
    <ChatRoom
      chatId={chat.id}
      meId={user.id}
      otherName={otherName}
      category={chat.request?.listing?.category}
      initialMessages={chat.messages.map((m) => ({
        id: m.id,
        body: m.body,
        senderId: m.senderId,
        createdAt: m.createdAt.toISOString(),
      }))}
      endsAt={chat.endsAt.toISOString()}
      endedAt={chat.endedAt ? chat.endedAt.toISOString() : null}
    />
  );
}
