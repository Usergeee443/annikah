"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Mode = "choose" | "email" | "telegram";

export default function RegisterPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("choose");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmitEmail(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Xatolik");
      router.push("/profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setPending(false);
    }
  }

  async function openTelegramFlow() {
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/telegram/session", {
        method: "POST",
        headers: { accept: "application/json" },
      });
      const raw = await res.text();
      let data: { ok?: boolean; deepLink?: string; error?: string } = {};
      if (raw.trim()) {
        try {
          data = JSON.parse(raw) as typeof data;
        } catch {
          throw new Error("Serverdan bo‘sh yoki noto‘g‘ri javob keldi. Sahifani yangilab qayta urinib ko‘ring.");
        }
      } else if (!res.ok) {
        throw new Error("Server javobsiz xato qaytardi.");
      }
      if (!res.ok || !data.ok || !data.deepLink) {
        throw new Error(data.error || "Telegram vaqtincha ishlamayapti.");
      }
      window.location.href = data.deepLink;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Xatolik";
      setError(msg === "Unexpected end of JSON input" ? "Serverdan bo‘sh javob keldi (JSON yo‘q)." : msg);
    } finally {
      setPending(false);
    }
  }

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
            <h1 className="text-xl font-extrabold tracking-tight text-zinc-950">Ro‘yxatdan o‘tish</h1>
            <p className="mt-1 text-sm text-zinc-600">
              E’lon saqlash, so‘rov yuborish va e’lon berish uchun hisob yarating.
            </p>

            {mode === "choose" ? (
              <div className="mt-6 grid gap-3">
                <p className="text-[13px] font-medium text-zinc-600">Kirish usulini tanlang:</p>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setMode("telegram")}
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-sky-600 px-5 text-[12px] font-extrabold tracking-tight text-white shadow-sm ring-1 ring-sky-700/20 transition hover:bg-sky-700 disabled:opacity-60"
                >
                  Telegram orqali kirish
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setMode("email")}
                  className="inline-flex h-12 items-center justify-center rounded-2xl border border-zinc-200 bg-white px-5 text-[12px] font-extrabold tracking-tight text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60"
                >
                  Email orqali kirish
                </button>
                <div className="text-center text-sm text-zinc-600">
                  Hisobingiz bormi?{" "}
                  <Link className="font-bold text-zinc-950 underline underline-offset-4" href="/auth/login">
                    Login
                  </Link>
                </div>
              </div>
            ) : null}

            {mode === "telegram" ? (
              <div className="mt-6 grid gap-4">
                <button
                  type="button"
                  className="text-left text-[12px] font-bold text-sky-700 underline-offset-4 hover:underline"
                  onClick={() => {
                    setMode("choose");
                    setError(null);
                  }}
                >
                  ← Orqaga
                </button>
                <div className="rounded-2xl bg-sky-50/90 px-4 py-3 text-[13px] font-medium leading-relaxed text-sky-950 ring-1 ring-sky-100">
                  <p className="font-extrabold">Telegram orqali ro‘yxatdan o‘tish</p>
                  <p className="mt-2">
                    Botda <span className="font-bold">/start</span> bosiladi, keyin telefon raqamingizni tugma
                    orqali yuborasiz, so‘ngra parol tanlaysiz. Yakunda bot sizga saytga kirish havolasini yuboradi —
                    bosgach avtomatik kirasiz.
                  </p>
                  <p className="mt-2">
                    <span className="font-extrabold">Push xabarlar:</span> yangi chat xabarlari, so‘rovlar va boshqa
                    xabarnomalar Telegram bot orqali yetkaziladi. Hisob Telegram va telefon orqali tasdiqlangan
                    foydalanuvchi hisoblanadi.
                  </p>
                </div>
                {error ? (
                  <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800 ring-1 ring-rose-200">
                    {error}
                  </div>
                ) : null}
                <button
                  type="button"
                  disabled={pending}
                  onClick={openTelegramFlow}
                  className="inline-flex h-11 items-center justify-center rounded-2xl bg-zinc-950 px-5 text-[12px] font-extrabold tracking-tight text-white shadow-sm ring-1 ring-black/10 transition hover:bg-zinc-900 disabled:opacity-60"
                >
                  {pending ? "Kuting..." : "Botga o‘tish"}
                </button>
                <p className="text-center text-[12px] text-zinc-500">
                  Keyinroq kirish uchun telefon va parolingizni «Login» sahifasida ishlating.
                </p>
              </div>
            ) : null}

            {mode === "email" ? (
              <>
                <button
                  type="button"
                  className="mt-4 text-left text-[12px] font-bold text-zinc-600 underline-offset-4 hover:underline"
                  onClick={() => {
                    setMode("choose");
                    setError(null);
                  }}
                >
                  ← Orqaga
                </button>
                <p className="mt-2 text-[12px] font-medium text-zinc-500">
                  Email orqali: hozircha bildirishnomalar emailga yuborilmaydi; keyinroq emailni tasdiqlash va push
                  xabarlarni ulash rejalashtirilgan.
                </p>
                <form onSubmit={onSubmitEmail} className="mt-4 grid gap-3">
                  <label className="grid gap-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">Email</span>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      required
                      className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.08)]"
                      placeholder="siz@example.com"
                    />
                  </label>

                  <label className="grid gap-1.5">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-zinc-500">Parol</span>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      required
                      minLength={6}
                      className="h-11 rounded-2xl border border-zinc-200 bg-white px-4 text-sm font-medium outline-none transition focus:border-zinc-300 focus:shadow-[0_0_0_4px_rgba(24,24,27,.08)]"
                      placeholder="Kamida 6 ta belgi"
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
                    {pending ? "Kuting..." : "Ro‘yxatdan o‘tish"}
                  </button>

                  <div className="text-center text-sm text-zinc-600">
                    Hisobingiz bormi?{" "}
                    <Link className="font-bold text-zinc-950 underline underline-offset-4" href="/auth/login">
                      Login
                    </Link>
                  </div>
                </form>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
