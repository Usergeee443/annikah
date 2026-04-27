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
    <div className="-mb-10 grid h-[calc(100dvh-2rem)] gap-4 sm:h-[calc(100dvh-2.5rem)] lg:grid-cols-[340px_1fr]">
      <div className={"min-h-0 " + (chatOpen ? "hidden lg:block" : "block")}>{list}</div>
      <div className={"min-h-0 min-w-0 " + (chatOpen ? "block" : "hidden lg:block")}>
        {children}
      </div>
    </div>
  );
}
