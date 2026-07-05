import Link from "next/link";

export default function Home() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", flexDirection: "column", padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🏋️</div>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>IronVision</h1>
      <p style={{ color: "var(--on-surface-variant)", fontSize: 16, maxWidth: 450, marginBottom: 32 }}>
        Seguimiento de entrenamiento de fuerza con visión IA.
        Subí una foto de tu barra y registrá tu progreso automáticamente.
      </p>
      <Link href="/dashboard" className="btn-primary" style={{ padding: "12px 32px", fontSize: 16, textDecoration: "none" }}>
        Ir al Dashboard →
      </Link>
    </div>
  );
}
