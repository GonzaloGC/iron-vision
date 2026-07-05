"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/capture", label: "Capture", icon: "photo_camera" },
  { href: "/dashboard/inventory", label: "Inventory", icon: "inventory_2" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {TABS.map((t) => {
        const isActive = pathname === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={isActive ? "active" : ""}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="nav-icon material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>
              {t.icon}
            </span>
            <span className="nav-label">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
