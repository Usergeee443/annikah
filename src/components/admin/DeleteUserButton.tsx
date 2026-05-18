"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DeleteUserButton({
  userId,
  email,
}: {
  userId: string;
  email?: string | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  function go() {
    const label = email || userId;
    const yes = confirm(
      `Foydalanuvchi (${label}) va uning barcha e’lonlari/chatlari o‘chirilsinmi? Bu amalni qaytarib bo‘lmaydi.`,
    );
    if (!yes) return;
    setErr(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/users/${userId}/delete`, { method: "POST" });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || "O‘chirib bo‘lmadi");
        }
        router.replace("/adminpanel/users");
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Xatolik");
      }
    });
  }

  return (
    <div className="grid justify-items-end gap-1">
      <button
        type="button"
        onClick={go}
        disabled={pending}
        className="inline-flex h-10 items-center justify-center rounded-2xl bg-rose-600 px-4 text-[12px] font-extrabold text-white ring-1 ring-rose-700/20 hover:bg-rose-700 disabled:opacity-60"
      >
        {pending ? "O‘chirilmoqda…" : "Foydalanuvchini o‘chirish"}
      </button>
      {err ? <span className="text-[11px] font-extrabold text-rose-700">{err}</span> : null}
    </div>
  );
}
