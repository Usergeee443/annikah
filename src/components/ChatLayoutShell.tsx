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
    <div className="-m-4 grid min-h-[calc(100dvh-84px-env(safe-area-inset-bottom))] gap-0 sm:-m-5 lg:m-0 lg:h-[calc(100dvh-2.5rem)] lg:min-h-0 lg:gap-4 lg:grid-cols-[340px_1fr]">
      <div className={"min-h-0 " + (chatOpen ? "hidden lg:block" : "block")}>{list}</div>
      <div className={"min-h-0 min-w-0 " + (chatOpen ? "block" : "hidden lg:block")}>
        {children}
      </div>
    </div>
  );
}
