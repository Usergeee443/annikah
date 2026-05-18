"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type AdminRow = {
  id: string;
  username: string;
  role: string;
  gender: string | null;
  createdAt: string;
};

const inputCls =
  "h-11 w-full rounded-2xl border border-zinc-200 bg-white px-3 text-[13px] font-semibold text-zinc-900 outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]";

function roleLabel(role: string) {
  if (role === "super" || role === "super_admin") return "Katta admin";
  return "Moderator";
}

export default function AdminsManager({
  admins,
  canManage,
  currentSessionId,
}: {
  admins: AdminRow[];
  canManage: boolean;
  currentSessionId: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"super_admin" | "moderator">("moderator");
  const [gender, setGender] = useState<"female" | "male" | "">("");
  const [pending, startTransition] = useTransition();
  const [ok, setOk] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function create() {
    setOk(null);
    setErr(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/admin/admins", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            username,
            password,
            role,
            gender: role === "moderator" ? gender : null,
          }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          if (data?.error === "USERNAME_TAKEN") throw new Error("Bunday username allaqachon mavjud.");
          if (data?.error === "WEAK_PASSWORD") throw new Error("Parol kamida 6 ta belgi bo‘lsin.");
          if (data?.error === "ADMIN_SUPER_REQUIRED")
            throw new Error("Faqat katta admin qo‘shishi mumkin.");
          if (data?.error === "MODERATOR_GENDER_REQUIRED")
            throw new Error("Moderator uchun jinsni tanlang (kelin/kuyov e’lonlari mosligi uchun).");
          throw new Error(data?.error || "Saqlab bo‘lmadi");
        }
        setUsername("");
        setPassword("");
        setRole("moderator");
        setGender("");
        setOk("Qo‘shildi.");
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Xatolik");
      }
    });
  }

  function remove(id: string, label: string) {
    if (!confirm(`Admin (${label}) o‘chirilsinmi?`)) return;
    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || "O‘chirib bo‘lmadi");
        router.refresh();
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Xatolik");
      }
    });
  }

  const createDisabled =
    pending ||
    !username.trim() ||
    password.length < 6 ||
    (role === "moderator" && gender !== "female" && gender !== "male");

  return (
    <div className="grid gap-4">
      {canManage ? (
        <section className="rounded-3xl border border-zinc-200/70 bg-white p-5 ring-1 ring-zinc-200/70">
          <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">YANGI HISOB</div>
          <h2 className="mt-1 text-[18px] font-black tracking-tight text-zinc-950">Katta admin yoki moderator</h2>
          <p className="mt-2 text-[12px] font-medium text-zinc-600">
            Moderatorlar faqat moderatsiya navbatiga javob beradi; kelin e’lonlarini faqat ayol, kuyov
            e’lonlarini faqat erkak moderatorlar ko‘radi. Moderator qo‘shganda jinsni majburiy tanlang.
          </p>
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr_minmax(140px,180px)_160px_140px]">
            <label className="grid">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Username</span>
              <input
                className={inputCls + " mt-1"}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="masalan, moderation_ayol_1"
                autoComplete="off"
              />
            </label>
            <label className="grid">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Parol</span>
              <input
                className={inputCls + " mt-1"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="kamida 6 ta belgi"
                autoComplete="new-password"
              />
            </label>
            <label className="grid">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">Rol</span>
              <select
                className={inputCls + " mt-1"}
                value={role}
                onChange={(e) => {
                  const v = e.target.value as "super_admin" | "moderator";
                  setRole(v);
                  if (v === "super_admin") setGender("");
                }}
              >
                <option value="moderator">Moderator</option>
                <option value="super_admin">Katta admin</option>
              </select>
            </label>
            <label className="grid">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                Moderator jinsi
              </span>
              <select
                className={inputCls + " mt-1"}
                value={gender}
                onChange={(e) => setGender(e.target.value as "female" | "male" | "")}
                disabled={role === "super_admin"}
              >
                <option value="">—</option>
                <option value="female">Ayol (kelin e’lonlari)</option>
                <option value="male">Erkak (kuyov e’lonlari)</option>
              </select>
            </label>
            <div className="flex items-end">
              <button
                type="button"
                onClick={create}
                disabled={createDisabled}
                className="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-zinc-950 px-4 text-[12px] font-extrabold text-white ring-1 ring-black/10 transition hover:bg-zinc-900 disabled:opacity-60"
              >
                {pending ? "Saqlanmoqda…" : "Qo‘shish"}
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {ok ? <span className="text-[12px] font-extrabold text-emerald-700">{ok}</span> : null}
            {err ? <span className="text-[12px] font-extrabold text-rose-700">{err}</span> : null}
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-zinc-200/70 bg-white p-5 ring-1 ring-zinc-200/70">
        <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">RO‘YXAT</div>
        <h2 className="mt-1 text-[18px] font-black tracking-tight text-zinc-950">Adminlar ({admins.length})</h2>

        {admins.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-zinc-300 bg-white p-6 text-center text-[13px] font-medium text-zinc-600">
            DB’da admin yo‘q. Avvalo katta admin envdan kirgan bo‘lishi mumkin.
          </div>
        ) : (
          <div className="mt-4 grid gap-2">
            {admins.map((a) => (
              <div
                key={a.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-black tracking-tight text-zinc-950">{a.username}</span>
                    <span
                      className={
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] ring-1 " +
                        (a.role === "super" || a.role === "super_admin"
                          ? "bg-amber-50 text-amber-800 ring-amber-200"
                          : "bg-zinc-100 text-zinc-700 ring-zinc-200")
                      }
                    >
                      {roleLabel(a.role)}
                    </span>
                    {a.role !== "super" && a.role !== "super_admin" && a.gender ? (
                      <span className="inline-flex items-center rounded-full bg-sky-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-sky-900 ring-1 ring-sky-200">
                        {a.gender === "female" ? "ayol moderator" : "erkak moderator"}
                      </span>
                    ) : null}
                    {a.id === currentSessionId ? (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-emerald-800 ring-1 ring-emerald-200">
                        SIZ
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-1 text-[12px] font-semibold text-zinc-500">
                    Yaratildi: {new Date(a.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {canManage && a.id !== currentSessionId ? (
                    <button
                      type="button"
                      onClick={() => remove(a.id, a.username)}
                      disabled={pending}
                      className="inline-flex h-9 items-center justify-center rounded-2xl bg-rose-600 px-3 text-[12px] font-extrabold text-white ring-1 ring-rose-700/20 hover:bg-rose-700 disabled:opacity-60"
                    >
                      O‘chirish
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
