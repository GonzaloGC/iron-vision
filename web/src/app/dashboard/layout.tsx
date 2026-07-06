import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Dashboard | IronVision",
  description: "Resumen de entrenamiento, volumen y progreso",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="layout">
        <Sidebar />
        {/* Top App Bar (mobile only) */}
        <header className="topbar">
          <div className="topbar-inner">
            <span className="topbar-brand">IRONVISION</span>
          </div>
        </header>
        <main className="main">{children}</main>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
