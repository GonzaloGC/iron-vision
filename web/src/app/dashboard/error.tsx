"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: 48, textAlign: "center", gap: 16,
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.5 }}>warning</span>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Error en el dashboard</h2>
      <p style={{ margin: 0, opacity: 0.6, maxWidth: 400 }}>{error.message}</p>
      <button className="btn-primary" onClick={reset}>Reintentar</button>
    </div>
  );
}
