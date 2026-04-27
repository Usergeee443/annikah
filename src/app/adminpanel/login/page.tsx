"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      }).catch(() => null);
      if (!res) {
        setError("Tarmoq xatosi");
        return;
      }
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.error || "Login yoki parol noto‘g‘ri.");
        return;
      }
      router.replace("/adminpanel");
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-[calc(100dvh-8rem)] items-center justify-center">
      <div className="w-full max-w-md rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-[0_18px_36px_rgba(15,23,42,.10)] backdrop-blur">
        <div className="text-[11px] font-extrabold tracking-widest text-zinc-500">ADMINPANEL</div>
        <h1 className="mt-2 text-[26px] font-black tracking-tight text-zinc-950">Kirish</h1>
        <p className="mt-1 text-[13px] font-medium text-zinc-600">
          Login/parol bilan kiring. Hozircha demo.
        </p>

        <div className="mt-5 grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
              Login
            </span>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]"
              placeholder="admin"
              autoComplete="username"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
              Parol
            </span>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-semibold outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.06)]"
              placeholder="••••••••"
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
          </label>

          <button
            type="button"
            onClick={submit}
            disabled={pending || !username.trim() || !password.trim()}
            className="mt-1 inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-[12px] font-extrabold text-white ring-1 ring-black/10 hover:bg-zinc-900 disabled:opacity-60"
          >
            {pending ? "Kirilmoqda…" : "Kirish"}
          </button>
          {error ? <div className="text-[12px] font-extrabold text-rose-700">{error}</div> : null}
        </div>
      </div>
    </div>
  );
}

