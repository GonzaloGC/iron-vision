"use client";

export default function Sidebar() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <aside className="sidebar">
      <h1>🏋 IronVision</h1>
      <nav>
        <a href="#" onClick={(e) => { e.preventDefault(); scrollTo("kpi"); }}>📊 Dashboard</a>
        <a href="#" onClick={(e) => { e.preventDefault(); scrollTo("volume"); }}>📈 Volumen</a>
        <a href="#" onClick={(e) => { e.preventDefault(); scrollTo("progress"); }}>📉 Progreso</a>
        <a href="#" onClick={(e) => { e.preventDefault(); scrollTo("workouts"); }}>📋 Workouts</a>
        <a href="#" onClick={(e) => { e.preventDefault(); scrollTo("inventory"); }}>🏗 Inventario</a>
        <a href="#" onClick={(e) => { e.preventDefault(); scrollTo("vision"); }}>📸 Visión</a>
      </nav>
    </aside>
  );
}
