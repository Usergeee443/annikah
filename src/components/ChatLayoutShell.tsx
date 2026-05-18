"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function ChatLayoutShell({
  list,
  children,
}: {
  list: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname() || "";
  const chatOpen = pathname.startsWith("/chats/") && pathname !== "/chats";

  return (
    <>
      {/* Mobile/tablet: fixed full-screen overlay (escapes main's padding) */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-dvh flex-col bg-white lg:hidden">
        <div className={"min-h-0 flex-1 " + (chatOpen ? "hidden" : "flex flex-col")}>
          {list}
        </div>
        <div className={"min-h-0 flex-1 " + (chatOpen ? "flex flex-col" : "hidden")}>
          {children}
        </div>
      </div>

      {/* Desktop: side-by-side grid inside main */}
      <div className="hidden h-[calc(100dvh-2.5rem)] gap-4 lg:grid lg:grid-cols-[340px_1fr]">
        <div className="min-h-0">{list}</div>
        <div className="min-h-0 min-w-0">{children}</div>
      </div>
    </>
  );
}
