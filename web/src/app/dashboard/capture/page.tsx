"use client";

import { useCallback, useEffect, useState } from "react";
import * as api from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function CapturePage() {
  useEffect(() => { document.title = "Capturar | IronVision"; }, []);
  const [workouts, setWorkouts] = useState<api.WorkoutResponse[]>([]);
  const [visionResult, setVisionResult] = useState<api.AnalyzeResponse | null>(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editReps, setEditReps] = useState(8);
  const [editWeight, setEditWeight] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      const [w] = await Promise.all([api.getWorkouts()]);
      setWorkouts(w);
    } catch {
      addToast("Error al cargar datos");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const activeWorkout = workouts.find(w => !w.is_completed);
  const exercises = activeWorkout?.exercises || [];
  const lastExercise = exercises[exercises.length - 1];
  const sets = lastExercise?.sets || [];

  const handleVisionFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setVisionLoading(true);
    try {
      const res = await api.analyzePhoto(file);
      setVisionResult(res);
      setEditWeight(String(res.total_weight_kg));
      setEditReps(8);
      setSheetOpen(true);
      const [w] = await Promise.all([api.getWorkouts()]);
      setWorkouts(w);
    } catch (err: any) {
      addToast(err.message);
    } finally {
      setVisionLoading(false);
    }
  };

  const handleConfirmSet = async () => {
    if (!visionResult) return;
    try {
      await api.updateSet(visionResult.set_id, {
        reps: editReps,
        weight_kg: editWeight ? parseFloat(editWeight) : undefined,
      });
      addToast("Set actualizado", "success");
      handleClear();
      const [w] = await Promise.all([api.getWorkouts()]);
      setWorkouts(w);
    } catch (err: any) {
      addToast(err.message);
    }
  };

  const handleClear = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setVisionResult(null);
    setEditReps(8);
    setEditWeight("");
    setSheetOpen(false);
  };

  const handleFinishWorkout = async (id: number) => {
    await api.finishWorkout(id);
    const [w] = await Promise.all([api.getWorkouts()]);
    setWorkouts(w);
  };

  const handleStartWorkout = async () => {
    try {
      await api.createWorkout();
      const [w] = await Promise.all([api.getWorkouts()]);
      setWorkouts(w);
      addToast("Workout iniciado", "success");
    } catch (err: any) {
      addToast(err.message);
    }
  };

  if (loading) return <p style={{ padding: 32, color: "var(--on-surface-variant)" }}>Cargando...</p>;

  return (
    <div>
      {/* Capture Button */}
      <section className="section">
        {!activeWorkout ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ color: "var(--on-surface-variant)", marginBottom: 16 }}>No hay un workout activo.</p>
            <button className="btn-primary" style={{ padding: "14px 32px", fontSize: 18 }} onClick={handleStartWorkout}>
              Iniciar Workout
            </button>
          </div>
        ) : (
          <button
            className="btn-primary"
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "40px 24px",
              borderRadius: "var(--radius-xl)",
              gap: 12,
              fontSize: 24,
            }}
            onClick={() => document.getElementById("capture-input")?.click()}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 64, fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
            <span style={{ fontWeight: 800, fontSize: 20, textTransform: "uppercase", letterSpacing: "-0.02em" }}>
              {visionLoading ? "Analizando..." : "Capturar barra"}
            </span>
            <input
              id="capture-input"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleVisionFile}
              style={{ display: "none" }}
            />
          </button>
        )}
      </section>

      {/* Active Workout Timeline */}
      {activeWorkout && (
        <section className="section">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 className="section-title" style={{ marginBottom: 0 }}>Sesión actual</h3>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {lastExercise && (
                <span className="badge badge-green">{lastExercise.name}</span>
              )}
              <button
                className="btn-ghost"
                style={{ padding: "6px 14px", fontSize: 13 }}
                onClick={() => handleFinishWorkout(activeWorkout.id)}
              >
                Finalizar
              </button>
            </div>
          </div>

          {exercises.length === 0 ? (
            <p style={{ color: "var(--on-surface-variant)", fontSize: 14, textAlign: "center", padding: 24 }}>
              Sin ejercicios todavía. Subí una foto para empezar.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {exercises.map((ex) => (
                <div key={ex.id}>
                  {ex.sets.map((set, idx) => (
                    <div key={set.id} className={`set-item ${idx === ex.sets.length - 1 ? "active" : ""}`} style={{ marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span className="set-badge">SET {idx + 1}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                        <span className="set-weight">{set.weight_kg}kg</span>
                        <span className="set-reps">x {set.reps}</span>
                      </div>
                    </div>
                  ))}
                  {/* Pending set placeholder */}
                  <div className="set-item pending">
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span className="set-badge" style={{ color: "var(--on-surface-variant)", background: "transparent" }}>
                        SET {ex.sets.length + 1}
                      </span>
                    </div>
                    <span className="material-symbols-outlined" style={{ color: "var(--on-surface-variant)" }}>pending</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Preview + Bottom Sheet */}
      {previewUrl && (
        <div style={{ marginBottom: 16, textAlign: "center" }}>
          <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: "var(--radius-lg)" }} />
        </div>
      )}

      {/* Bottom Sheet Overlay */}
      <div className={`sheet-overlay ${sheetOpen ? "active" : ""}`} onClick={() => setSheetOpen(false)}>
        <div className={`sheet ${sheetOpen ? "active" : ""}`} onClick={e => e.stopPropagation()}>
          <div className="sheet-handle" />

          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8 }}>
              <span className="material-symbols-outlined" style={{ color: "var(--primary-fixed-dim)", fontSize: 20 }}>check_circle</span>
              <span className="badge badge-green" style={{ fontSize: 12 }}>Captura exitosa</span>
            </div>
            <h3 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", textTransform: "uppercase" }}>
              {editWeight || "0"} KG DETECTADOS
            </h3>
          </div>

          {visionResult && (
            <div style={{ marginBottom: 20 }}>
              <table style={{ fontSize: 14 }}>
                <thead>
                  <tr><th>Equipo</th><th>Peso</th><th>Cant.</th></tr>
                </thead>
                <tbody>
                  {visionResult.equipment_detected.map((d, i) => (
                    <tr key={i}><td>{d.name}</td><td>{d.weight_kg} kg</td><td>{d.quantity}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reps Stepper */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center", marginBottom: 24 }}>
            <span className="badge badge-green" style={{ fontSize: 11, background: "transparent" }}>REPETICIONES</span>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24, background: "var(--surface-container-lowest)", border: "1px solid var(--outline-variant)", borderRadius: "var(--radius-xl)", padding: 16, width: "100%" }}>
              <button
                style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-lg)", background: "var(--surface-container-low)", border: "1px solid var(--outline-variant)", color: "var(--on-surface)", fontSize: 24, cursor: "pointer" }}
                onClick={() => setEditReps(r => Math.max(0, r - 1))}
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
              <span style={{ fontSize: 32, fontWeight: 900, fontFamily: "var(--font-display)", width: 80, textAlign: "center" }}>{editReps}</span>
              <button
                style={{ width: 48, height: 48, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "var(--radius-lg)", background: "var(--surface-container-low)", border: "1px solid var(--outline-variant)", color: "var(--on-surface)", fontSize: 24, cursor: "pointer" }}
                onClick={() => setEditReps(r => r + 1)}
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>

          {/* Weight input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--on-surface-variant)", textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 6 }}>Peso (kg)</label>
            <input
              type="number" step="0.5"
              value={editWeight}
              onChange={e => setEditWeight(e.target.value)}
              placeholder="Ej: 100"
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12 }}>
            <button className="btn-primary" style={{ flex: 1, padding: "16px", fontSize: 18, textTransform: "uppercase" }} onClick={handleConfirmSet}>
              Confirmar Set
            </button>
            <button className="btn-ghost" style={{ flex: 1, padding: "16px" }} onClick={handleClear}>
              Cancelar
            </button>
          </div>

          <div style={{ height: 24 }} />
        </div>
      </div>
    </div>
  );
}
