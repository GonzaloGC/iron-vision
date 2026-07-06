"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", padding: 24, textAlign: "center", gap: 16,
    }}>
      <span className="material-symbols-outlined" style={{ fontSize: 48, opacity: 0.5 }}>error</span>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Algo salió mal</h2>
      <p style={{ margin: 0, opacity: 0.6, maxWidth: 400 }}>{error.message}</p>
      <button className="btn-primary" onClick={reset}>Intentar de nuevo</button>
    </main>
  );
}
