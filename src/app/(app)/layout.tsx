import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-dvh bg-[#f4f4f5] overflow-hidden">
      <div className="flex h-full w-full gap-5 p-4 sm:p-5">
        <div className="hidden md:block shrink-0">
          <Sidebar />
        </div>
        <main className="min-w-0 flex-1 overflow-y-auto pb-[calc(84px+env(safe-area-inset-bottom))] md:pb-10">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
