"use client";

import { useState, useEffect } from "react";

const SECTIONS = [
  { id: "kpi", label: "Dashboard", icon: "📊" },
  { id: "volume", label: "Volumen", icon: "📈" },
  { id: "progress", label: "Progreso", icon: "📉" },
  { id: "workouts", label: "Workouts", icon: "📋" },
  { id: "inventory", label: "Inventario", icon: "🏗" },
  { id: "vision", label: "Visión", icon: "📸" },
];

export default function Sidebar() {
  const [active, setActive] = useState("kpi");

  useEffect(() => {
    const handleScroll = () => {
      const center = window.scrollY + window.innerHeight / 2;
      for (const { id } of SECTIONS) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= center && el.offsetTop + el.offsetHeight > center) {
          setActive(id);
          break;
        }
      }
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <aside className="sidebar" role="navigation" aria-label="Secciones del dashboard">
      <h1><span aria-hidden="true">🏋</span> IronVision</h1>
      <nav>
        {SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => scrollTo(s.id)}
            className={active === s.id ? "active" : ""}
            aria-current={active === s.id ? "true" : undefined}
          >
            <span aria-hidden="true">{s.icon}</span>
            {s.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
