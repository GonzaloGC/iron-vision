import Link from "next/link";

export default function NotFound() {
  return (
    <main style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", padding: 24, textAlign: "center", gap: 16,
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 64, opacity: 0.3 }}>search_off</span>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Página no encontrada</h2>
      <p style={{ margin: 0, opacity: 0.6 }}>La página que buscas no existe.</p>
      <Link href="/dashboard" className="btn-primary">Volver al Dashboard</Link>
    </main>
  );
}
