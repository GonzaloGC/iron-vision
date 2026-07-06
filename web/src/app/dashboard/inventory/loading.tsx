export default function InventoryLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 24 }}>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="eq-item" style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--surface-container-high)", opacity: 0.3 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 14, width: "40%", borderRadius: 4, background: "var(--surface-container-high)", opacity: 0.5 }} />
            <div style={{ height: 12, width: "25%", borderRadius: 4, background: "var(--surface-container-high)", marginTop: 6, opacity: 0.3 }} />
          </div>
        </div>
      ))}
    </div>
  );
}
