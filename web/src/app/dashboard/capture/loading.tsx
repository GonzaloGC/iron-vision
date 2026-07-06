export default function CaptureLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, padding: 24 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--surface-container-high)", opacity: 0.3 }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, width: "30%", borderRadius: 4, background: "var(--surface-container-high)", opacity: 0.5 }} />
          <div style={{ height: 12, width: "50%", borderRadius: 4, background: "var(--surface-container-high)", marginTop: 6, opacity: 0.3 }} />
        </div>
      </div>
      <div className="card" style={{ height: 350, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ opacity: 0.3 }}>Cargando cámara...</p>
      </div>
      <div className="card" style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ opacity: 0.3 }}>Cargando sesión activa...</p>
      </div>
    </div>
  );
}
