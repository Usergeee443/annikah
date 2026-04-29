import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/adminAuth";
import { db } from "@/lib/db";
import AdminsManager from "@/components/admin/AdminsManager";

export default async function AdminAdminsPage() {
  const session = await getAdminSession();
  if (!session) redirect("/adminpanel/login");

  const admins = await db.adminUser.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, username: true, role: true, createdAt: true },
  });

  return (
    <div className="grid gap-4">
      <div className="rounded-3xl border border-zinc-200/70 bg-white p-5 shadow-[0_8px_28px_rgba(15,23,42,.05)]">
        <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">ADMINLAR</div>
        <h1 className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">Adminlarni boshqarish</h1>
        <p className="mt-1 max-w-2xl text-[13px] font-medium text-zinc-600">
          Yangi admin qo‘shish, mavjudlarini ko‘rish va o‘chirish. Hozir kirgan admin:{" "}
          <span className="font-extrabold text-zinc-900">{session.username}</span>
          {session.role === "super" ? " · super" : ""}.
        </p>
        {session.role !== "super" ? (
          <div className="mt-3 rounded-2xl bg-amber-50 p-3 text-[12.5px] font-extrabold text-amber-900 ring-1 ring-amber-200">
            Eslatma: faqat super-admin yangi admin qo‘shishi yoki o‘chirishi mumkin.
          </div>
        ) : null}
      </div>

      <AdminsManager
        admins={admins.map((a) => ({
          id: a.id,
          username: a.username,
          role: a.role,
          createdAt: a.createdAt.toISOString(),
        }))}
        canManage={session.role === "super"}
        currentSessionId={session.id}
      />
    </div>
  );
}
