export default function DashboardLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: 24 }}>
      <div className="kpi-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="kpi-card" style={{ padding: 20 }}>
            <div style={{ height: 14, width: "40%", borderRadius: 4, background: "var(--surface-container-high)", opacity: 0.5 }} />
            <div style={{ height: 28, width: "60%", borderRadius: 4, background: "var(--surface-container-high)", marginTop: 8, opacity: 0.3 }} />
          </div>
        ))}
      </div>
      <div className="card" style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ opacity: 0.3 }}>Cargando gráficos...</p>
      </div>
      <div className="card" style={{ height: 250, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ opacity: 0.3 }}>Cargando actividad reciente...</p>
      </div>
    </div>
  );
}
