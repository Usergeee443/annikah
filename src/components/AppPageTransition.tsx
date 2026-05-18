"use client";

import { usePathname } from "next/navigation";

export default function AppPageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div
      key={pathname}
      className="motion-safe:animate-[pageIn_.28s_cubic-bezier(.22,1,.36,1)]"
    >
      {children}
      <style jsx>{`
        @keyframes pageIn {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.998);
            filter: saturate(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: saturate(1);
          }
        }
      `}</style>
    </div>
  );
}

