"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/";
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ login, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Xatolik");
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-3">
      <label className="grid gap-1.5">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">Email yoki telefon</span>
        <input
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          type="text"
          autoComplete="username"
          required
          placeholder="siz@example.com yoki +998…"
          className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.08)]"
        />
      </label>

      <label className="grid gap-1.5">
        <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">Parol</span>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          placeholder="••••••••"
          className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.08)]"
        />
      </label>

      {error ? (
        <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 ring-1 ring-rose-200">
          {error}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-[12px] font-extrabold tracking-tight text-white shadow-sm ring-1 ring-black/10 transition hover:bg-zinc-900 disabled:opacity-60"
      >
        {pending ? "Kuting..." : "Kirish"}
      </button>

      <div className="text-center text-sm text-zinc-600">
        Hisob yo‘qmi?{" "}
        <Link className="font-bold text-zinc-950 underline underline-offset-4" href="/auth/register">
          Ro‘yxatdan o‘tish
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_420px_at_8%_0%,rgba(59,130,246,.12),transparent_60%),radial-gradient(1200px_520px_at_92%_0%,rgba(249,115,22,.12),transparent_60%),radial-gradient(900px_520px_at_50%_-10%,rgba(250,204,21,.10),transparent_55%),linear-gradient(to_bottom,#fbfbfc,#ffffff)]">
      <div className="mx-auto grid min-h-screen w-full max-w-md place-items-center px-4 py-10 sm:py-14">
        <div className="w-full">
          <div className="mb-4 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex h-9 items-center gap-2 rounded-2xl bg-white/80 px-3 text-[12px] font-extrabold text-zinc-700 ring-1 ring-zinc-200 backdrop-blur hover:bg-white"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
                <path
                  d="M15 6l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Orqaga
            </Link>
          </div>
          <div className="mb-6 text-center">
            <Link href="/" className="text-2xl font-extrabold tracking-tight text-zinc-950">
              <span className="drop-shadow-[0_0_18px_rgba(59,130,246,.45)]">Annikah</span>
            </Link>
            <div className="mt-1 text-[12px] font-bold text-zinc-600">Halol tanishuv platformasi</div>
          </div>
          <div className="rounded-3xl border border-zinc-200/70 bg-white/85 p-6 shadow-sm backdrop-blur">
            <h1 className="text-xl font-extrabold tracking-tight text-zinc-950">Hisobingizga kiring</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Email yoki (Telegram orqali ro‘yxatdan o‘tgan bo‘lsangiz) telefon raqamingiz va parol.
            </p>
            <Suspense fallback={null}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
