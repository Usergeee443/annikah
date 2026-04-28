import Sidebar from "@/components/Sidebar";
import MobileBottomNav from "@/components/MobileBottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      <div className="flex w-full gap-5 p-4 sm:p-5">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-[calc(84px+env(safe-area-inset-bottom))] md:pb-10">{children}</main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
