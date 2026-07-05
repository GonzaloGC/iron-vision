"use client";

import { useCallback, useEffect, useState } from "react";
import * as api from "@/lib/api";
import { useToast } from "@/components/Toast";

type EqForm = { name: string; type: string; weight_kg: number; quantity: number };

const defaultForm = (): EqForm => ({ name: "", type: "plate", weight_kg: 0, quantity: 1 });

export default function InventoryPage() {
  const [equipment, setEquipment] = useState<api.EquipmentItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<EqForm>(defaultForm());
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchEquipment = useCallback(async () => {
    try {
      setEquipment(await api.getEquipment());
    } catch {
      addToast("Error al cargar equipamiento");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEquipment(); }, [fetchEquipment]);

  const addEquipment = async () => {
    if (!form.name.trim()) return;
    try {
      await api.createEquipment(form);
      setForm(defaultForm());
      setShowForm(false);
      setEquipment(await api.getEquipment());
      addToast("Equipo agregado", "success");
    } catch (err: any) {
      addToast(err.message);
    }
  };

  const removeEquipment = async (id: number) => {
    try {
      await api.deleteEquipment(id);
      setEquipment(await api.getEquipment());
      addToast("Equipo eliminado", "info");
    } catch (err: any) {
      addToast(err.message);
    }
  };

  const iconForType = (type: string) => {
    switch (type) {
      case "barbell": return "fitness_center";
      case "plate": return "album";
      case "dumbbell": return "sports_gymnastics";
      default: return "fitness_center";
    }
  };

  const labelForType = (type: string) => {
    switch (type) {
      case "barbell": return "Barra";
      case "plate": return "Disco";
      case "dumbbell": return "Mancuerna";
      default: return type;
    }
  };

  if (loading) return <p style={{ padding: 32, color: "var(--on-surface-variant)" }}>Cargando...</p>;

  return (
    <div>
      <h2 className="page-subheading" style={{ marginBottom: 24, textTransform: "uppercase", letterSpacing: "-0.02em" }}>Equipamiento</h2>

      {/* Equipment List */}
      {equipment.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "var(--on-surface-variant)" }}>
          <span className="material-symbols-outlined" style={{ fontSize: 48, marginBottom: 12, opacity: 0.3 }}>inventory_2</span>
          <p>Sin equipamiento cargado.</p>
          <p style={{ fontSize: 14, marginTop: 4 }}>Agregá tu primer equipo con el botón +</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {equipment.map(eq => (
            <div key={eq.id} className="eq-item">
              <div className="eq-left">
                <div className="eq-icon">
                  <span className="material-symbols-outlined" style={{ fontSize: 28 }}>{iconForType(eq.type)}</span>
                </div>
                <div>
                  <div className="eq-name">{eq.name}</div>
                  <div className="eq-detail">
                    {eq.quantity > 1 ? `${eq.quantity}x` : ""}{eq.weight_kg}kg · {labelForType(eq.type)}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="eq-arrow material-symbols-outlined" style={{ fontSize: 20 }}>chevron_right</span>
                <button
                  className="btn-danger"
                  style={{ padding: "4px 10px", fontSize: 12, opacity: 0.7, cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); removeEquipment(eq.id); }}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Equipment Form Modal */}
      {showForm && (
        <div className="sheet-overlay active" onClick={() => setShowForm(false)}>
          <div className="sheet active" onClick={e => e.stopPropagation()}>
            <div className="sheet-handle" />
            <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Agregar equipo</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Nombre</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Disco 10kg" />
              </div>

              <div>
                <label style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Tipo</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                  <option value="barbell">Barra</option>
                  <option value="plate">Disco</option>
                  <option value="dumbbell">Mancuerna</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Peso (kg)</label>
                  <input type="number" step="0.1" value={form.weight_kg || ""} onChange={e => setForm(p => ({ ...p, weight_kg: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Cant.</label>
                  <input type="number" min="1" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))} />
                </div>
              </div>

              <button className="btn-primary" style={{ padding: 16, fontSize: 16, textTransform: "uppercase", width: "100%" }} onClick={addEquipment}>
                Agregar
              </button>
              <button className="btn-ghost" style={{ padding: 12, width: "100%" }} onClick={() => setShowForm(false)}>
                Cancelar
              </button>
            </div>

            <div style={{ height: 16 }} />
          </div>
        </div>
      )}

      {/* FAB */}
      <button className="fab" onClick={() => setShowForm(true)} aria-label="Agregar equipo">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: 32 }}>add</span>
      </button>
    </div>
  );
}
