import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import { ToastProvider } from "@/components/Toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="layout">
        <Sidebar />
        {/* Top App Bar (mobile only) */}
        <header className="topbar">
          <div className="topbar-inner">
            <span className="topbar-brand">IRONVISION</span>
            <button
              className="btn-ghost"
              style={{ width: 40, height: 40, padding: 0, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }}
              aria-label="Configuración"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 22 }}>settings</span>
            </button>
          </div>
        </header>
        <main className="main">{children}</main>
        <BottomNav />
      </div>
    </ToastProvider>
  );
}
