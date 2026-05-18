"use client";

import { useState, useTransition } from "react";

export default function PasswordChangeCard() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setOk(null);
    setErr(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/password", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const code = data?.error || "Xatolik";
          if (code === "BAD_PASSWORD") throw new Error("Hozirgi parol noto‘g‘ri.");
          if (code === "PASSWORD_TOO_SHORT") throw new Error("Yangi parol kamida 6 ta belgidan iborat bo‘lsin.");
          throw new Error("Parolni o‘zgartirib bo‘lmadi.");
        }
        setCurrentPassword("");
        setNewPassword("");
        setOk("Parol o‘zgartirildi.");
      } catch (e2) {
        setErr(e2 instanceof Error ? e2.message : "Xatolik");
      }
    });
  }

  return (
    <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">AKKAUNT</div>
      <div className="mt-2 text-[16px] font-black tracking-tight text-zinc-950">Parolni o‘zgartirish</div>
      <form onSubmit={submit} className="mt-4 grid gap-3">
        <input
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          type="password"
          autoComplete="current-password"
          placeholder="Hozirgi parol"
          className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-[13px] font-semibold text-zinc-900 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]"
        />
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type="password"
          autoComplete="new-password"
          placeholder="Yangi parol (kamida 6 belgi)"
          className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-[13px] font-semibold text-zinc-900 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]"
        />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="submit"
            disabled={pending || !currentPassword || newPassword.length < 6}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-[12px] font-extrabold text-white ring-1 ring-black/10 transition hover:bg-zinc-900 disabled:opacity-60"
          >
            {pending ? "Saqlanmoqda…" : "Saqlash"}
          </button>
          {ok ? <div className="text-[12px] font-extrabold text-emerald-700">{ok}</div> : null}
          {err ? <div className="text-[12px] font-extrabold text-rose-700">{err}</div> : null}
        </div>
      </form>
    </div>
  );
}

