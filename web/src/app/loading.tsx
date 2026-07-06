export default function RootLoading() {
  return (
    <main style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", padding: 24,
    }}>
      <p style={{ opacity: 0.5 }}>Cargando...</p>
    </main>
  );
}
