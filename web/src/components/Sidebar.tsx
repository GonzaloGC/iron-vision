"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SECTIONS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/capture", label: "Capture", icon: "photo_camera" },
  { href: "/dashboard/inventory", label: "Inventory", icon: "inventory_2" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar" role="navigation" aria-label="Secciones del dashboard">
      <div className="sidebar-brand">
        <span aria-hidden="true">🏋</span> IronVision
      </div>
      <nav>
        {SECTIONS.map((s) => {
          const isActive = pathname === s.href;
          return (
            <Link
              key={s.href}
              href={s.href}
              className={isActive ? "active" : ""}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="material-symbols-outlined" aria-hidden="true">{s.icon}</span>
              {s.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
