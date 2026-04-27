import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/adminAuth";
import AdminSupportRoom from "@/components/AdminSupportRoom";

export default async function AdminSupportThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const authed = await isAdminAuthed();
  if (!authed) redirect("/adminpanel/login");

  const { id } = await params;

  const thread = await db.supportThread.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, profile: { select: { name: true } } } },
      messages: { orderBy: { createdAt: "asc" }, take: 500 },
    },
  });

  if (!thread) notFound();

  const userLabel = thread.user.profile?.name
    ? `${thread.user.profile.name} · ${thread.user.email}`
    : thread.user.email;

  return (
    <AdminSupportRoom
      threadId={thread.id}
      userLabel={userLabel}
      initialStatus={thread.status}
      initialMessages={thread.messages.map((m) => ({
        id: m.id,
        body: m.body,
        sender: m.sender,
        createdAt: m.createdAt.toISOString(),
      }))}
    />
  );
}

