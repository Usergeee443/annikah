"use client";

import { useEffect, type ReactNode } from "react";

export default function EditFieldDrawer({
  open,
  title,
  subtitle,
  preview,
  saved,
  onClose,
  onSave,
  pending,
  children,
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  preview?: string;
  saved?: boolean;
  onClose: () => void;
  onSave: () => void;
  pending?: boolean;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const actions = (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onClose}
        className="inline-flex h-11 flex-1 items-center justify-center rounded-2xl bg-white text-[13px] font-semibold text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-50"
      >
        <span className="md:hidden">Bekor qilish</span>
        <span className="hidden md:inline">Bekor</span>
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={pending}
        className="inline-flex h-11 flex-[1.2] items-center justify-center rounded-2xl bg-zinc-950 text-[13px] font-semibold text-white ring-1 ring-black/10 hover:bg-zinc-900 disabled:opacity-60"
      >
        {pending ? (
          "Saqlanmoqda…"
        ) : (
          <>
            <span className="md:hidden">Tayyor</span>
            <span className="hidden md:inline">Saqlash</span>
          </>
        )}
      </button>
    </div>
  );

  const savedBanner = saved ? (
    <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-[13px] font-semibold text-emerald-800 ring-1 ring-emerald-200">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
        <path
          d="m5 12 5 5L20 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Saqlandi
    </div>
  ) : null;

  return (
    <>
      <div
        aria-hidden
        onClick={onClose}
        className={
          "fixed inset-0 z-[80] bg-zinc-950/45 backdrop-blur-[3px] transition-opacity duration-300 " +
          (open ? "opacity-100" : "pointer-events-none opacity-0")
        }
      />
      <aside
        aria-modal={open}
        role="dialog"
        aria-label={title}
        className={
          "fixed z-[90] flex flex-col bg-white shadow-[0_30px_80px_rgba(15,23,42,.35)] transition-transform duration-300 ease-out " +
          "inset-x-0 bottom-0 max-h-[88dvh] w-full rounded-t-[28px] " +
          "md:inset-x-auto md:bottom-auto md:right-0 md:top-0 md:h-dvh md:max-h-none md:w-[min(460px,94vw)] md:rounded-none md:border-l md:border-zinc-200/70 " +
          (open ? "translate-y-0 md:translate-x-0" : "translate-y-full md:translate-y-0 md:translate-x-full")
        }
      >
        <div className="flex justify-center pb-1 pt-2 md:hidden">
          <span className="h-1 w-10 rounded-full bg-zinc-300" />
        </div>

        <div className="shrink-0 space-y-3 border-b border-zinc-100 px-5 pb-4 pt-1 md:hidden">
          {savedBanner}
          {actions}
        </div>

        <header className="shrink-0 border-b border-zinc-100 px-5 pb-4 pt-2 md:border-t-0 md:px-6 md:pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10.5px] font-semibold uppercase tracking-[0.18em] text-zinc-500">Tahrirlash</div>
              <h2 className="mt-1 text-[17px] font-bold tracking-normal text-zinc-950">{title}</h2>
              {subtitle ? <p className="mt-1 text-[13px] font-medium text-zinc-600">{subtitle}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="hidden md:inline-flex h-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-50 px-4 text-[12px] font-semibold text-zinc-900 ring-1 ring-zinc-200 hover:bg-white"
            >
              Yopish
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 md:px-6">
          {preview ? (
            <div className="mb-4 rounded-2xl bg-zinc-50 px-4 py-3 ring-1 ring-zinc-200">
              <div className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">Tanlangan</div>
              <div className="mt-1 line-clamp-4 text-[15px] font-semibold leading-snug text-zinc-950">{preview}</div>
            </div>
          ) : null}
          {children}
        </div>

        <footer
          className="hidden shrink-0 border-t border-zinc-100 bg-white px-5 py-3 md:block md:px-6 md:py-4"
          style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          {savedBanner ? <div className="mb-3">{savedBanner}</div> : null}
          {actions}
        </footer>
      </aside>
    </>
  );
}
