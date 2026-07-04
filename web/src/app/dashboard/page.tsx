"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import * as api from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function DashboardPage() {
  /* ---------- state ---------- */
  const [volume, setVolume] = useState<api.VolumePoint[]>([]);
  const [progress, setProgress] = useState<api.ProgressPoint[]>([]);
  const [recent, setRecent] = useState<api.RecentWorkout[]>([]);
  const [equipment, setEquipment] = useState<api.EquipmentItem[]>([]);
  const [workouts, setWorkouts] = useState<api.WorkoutResponse[]>([]);

  const [progExercise, setProgExercise] = useState("Sentadilla");
  const [eqForm, setEqForm] = useState({ name: "", type: "plate", weight_kg: 0, quantity: 1 });
  const [visionResult, setVisionResult] = useState<api.AnalyzeResponse | null>(null);
  const [visionLoading, setVisionLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [editReps, setEditReps] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const exercises = ["Sentadilla", "Press Banca", "Peso Muerto"];

  const fetchAll = useCallback(async () => {
    try {
      const [v, p, r, e, w] = await Promise.all([
        api.getVolume("week", 4),
        api.getProgress(progExercise),
        api.getRecent(5),
        api.getEquipment(),
        api.getWorkouts(),
      ]);
      setVolume(v); setProgress(p); setRecent(r); setEquipment(e); setWorkouts(w);
    } catch (err) { addToast("Error al cargar datos del dashboard"); }
    finally { setLoading(false); }
  }, [progExercise]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  /* ---------- computeds ---------- */
  const activeWorkout = workouts.find(w => !w.is_completed);

  const kpis = (() => {
    const completed = workouts.filter(w => w.is_completed);
    const totalVol = recent.reduce((s, r) => s + r.total_volume_kg, 0);
    const totalSets = recent.reduce((s, r) => s + r.total_sets, 0);
    const avgDur = recent.length ? recent.reduce((s, r) => s + (r.duration_minutes || 0), 0) / recent.length : 0;
    return { workoutsThisMonth: completed.length, totalVolume: totalVol, totalSets, avgDuration: avgDur };
  })();

  /* ---------- equipment handlers ---------- */
  const addEquipment = async () => {
    if (!eqForm.name) return;
    await api.createEquipment(eqForm);
    setEqForm({ name: "", type: "plate", weight_kg: 0, quantity: 1 });
    setEquipment(await api.getEquipment());
  };

  const removeEquipment = async (id: number) => {
    await api.deleteEquipment(id);
    setEquipment(await api.getEquipment());
  };

  /* ---------- vision handler ---------- */
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
      const [w] = await Promise.all([api.getWorkouts()]);
      setWorkouts(w);
    } catch (err: any) { addToast(err.message); }
    finally { setVisionLoading(false); }
  };

  const handleConfirmSet = async () => {
    if (!visionResult) return;
    try {
      await api.updateSet(visionResult.set_id, {
        reps: editReps ? parseInt(editReps) : undefined,
        weight_kg: editWeight ? parseFloat(editWeight) : undefined,
      });
      addToast("Set actualizado correctamente", "success");
      handleClearVision();
      const [w] = await Promise.all([api.getWorkouts()]);
      setWorkouts(w);
    } catch (err: any) { addToast(err.message); }
  };

  const handleClearVision = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setVisionResult(null);
    setEditReps("");
    setEditWeight("");
  };

  /* ---------- finish workout ---------- */
  const handleFinishWorkout = async (id: number) => {
    await api.finishWorkout(id);
    const [w, r] = await Promise.all([api.getWorkouts(), api.getRecent(5)]);
    setWorkouts(w); setRecent(r);
  };

  /* ---------- render ---------- */
  if (loading) return <p style={{ padding: 32, color: "var(--text-muted)" }}>Cargando...</p>;

  return (
    <div>
      {/* === KPI === */}
      <section id="kpi">
        <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 16 }}>Dashboard</h2>
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="label">Workouts (últ. 5)</div>
            <div className="value">{recent.length}</div>
            <div className="sub">{kpis.workoutsThisMonth} totales</div>
          </div>
          <div className="kpi-card">
            <div className="label">Volumen Total</div>
            <div className="value">{kpis.totalVolume.toLocaleString()}</div>
            <div className="sub">kg levantados</div>
          </div>
          <div className="kpi-card">
            <div className="label">Sets</div>
            <div className="value">{kpis.totalSets}</div>
            <div className="sub">series realizadas</div>
          </div>
          <div className="kpi-card">
            <div className="label">Duración Promedio</div>
            <div className="value">{Math.round(kpis.avgDuration)}</div>
            <div className="sub">minutos por sesión</div>
          </div>
        </div>
      </section>

      {/* === VOLUME CHART === */}
      <section id="volume">
        <div className="card">
          <h2>📊 Volumen Semanal</h2>
          {volume.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Sin datos de volumen.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={volume}>
                <XAxis dataKey="label" tick={{ fill: "#8b8fa3", fontSize: 12 }} />
                <YAxis tick={{ fill: "#8b8fa3", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: "#e1e4eb" }}
                />
                <Bar dataKey="total_volume_kg" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Volumen kg" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* === PROGRESS CHART === */}
      <section id="progress">
        <div className="card">
          <h2>📈 Progreso por Ejercicio</h2>
          <div className="toolbar">
            <label>Ejercicio:</label>
            <select value={progExercise} onChange={e => setProgExercise(e.target.value)} style={{ width: 180 }}>
              {exercises.map(ex => <option key={ex}>{ex}</option>)}
            </select>
          </div>
          {progress.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Sin datos de progreso para este ejercicio.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={progress}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d3a" />
                <XAxis dataKey="date" tick={{ fill: "#8b8fa3", fontSize: 11 }} tickFormatter={v => new Date(v).toLocaleDateString("es", { day: "numeric", month: "short" })} />
                <YAxis tick={{ fill: "#8b8fa3", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ background: "#1a1d27", border: "1px solid #2a2d3a", borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: "#e1e4eb" }}
                  labelFormatter={v => new Date(v).toLocaleDateString("es", { dateStyle: "long" })}
                />
                <Line type="monotone" dataKey="weight_kg" stroke="var(--chart-1)" strokeWidth={2} dot={{ r: 4 }} name="Peso (kg)" />
                <Line type="monotone" dataKey="estimated_one_rm" stroke="var(--chart-2)" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="4 4" name="1RM est." />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* === WORKOUTS === */}
      <section id="workouts">
        <div className="card">
          <h2>📋 Workouts Recientes</h2>
          {activeWorkout && (
            <div style={{ background: "var(--accent-dim)", color: "var(--accent)", padding: "10px 16px", borderRadius: 8, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>⏳ Workout activo iniciado {new Date(activeWorkout.started_at).toLocaleString("es")}</span>
              <button className="btn btn-primary" onClick={() => handleFinishWorkout(activeWorkout.id)}>Finalizar</button>
            </div>
          )}
          {recent.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Sin workouts todavía.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Fecha</th><th>Duración</th><th>Ejercicios</th><th>Volumen</th><th>Sets</th></tr>
              </thead>
              <tbody>
                {recent.map(w => (
                  <tr key={w.id}>
                    <td>{new Date(w.date).toLocaleDateString("es", { dateStyle: "medium" })}</td>
                    <td>{w.duration_minutes ? `${Math.round(w.duration_minutes)} min` : "—"}</td>
                    <td>{w.exercise_count}</td>
                    <td>{w.total_volume_kg.toLocaleString()} kg</td>
                    <td>{w.total_sets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* === INVENTORY === */}
      <section id="inventory">
        <div className="card">
          <h2>🏗 Inventario de Equipamiento</h2>
          <div className="inventory-form-grid">
            <div><label style={{ color: "var(--text-muted)", fontSize: 12 }}>Nombre</label>
              <input value={eqForm.name} onChange={e => setEqForm(p => ({ ...p, name: e.target.value }))} placeholder="Ej: Disco 10kg" /></div>
            <div><label style={{ color: "var(--text-muted)", fontSize: 12 }}>Tipo</label>
              <select value={eqForm.type} onChange={e => setEqForm(p => ({ ...p, type: e.target.value }))}>
                <option value="barbell">Barra</option><option value="plate">Disco</option><option value="dumbbell">Mancuerna</option><option value="other">Otro</option>
              </select></div>
            <div><label style={{ color: "var(--text-muted)", fontSize: 12 }}>Peso (kg)</label>
              <input type="number" step="0.1" value={eqForm.weight_kg || ""} onChange={e => setEqForm(p => ({ ...p, weight_kg: parseFloat(e.target.value) || 0 }))} /></div>
            <div><label style={{ color: "var(--text-muted)", fontSize: 12 }}>Cant.</label>
              <input type="number" min="1" value={eqForm.quantity} onChange={e => setEqForm(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))} /></div>
            <button className="btn btn-primary" onClick={addEquipment} style={{ marginTop: 18 }}>Agregar</button>
          </div>
          {equipment.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Sin equipamiento cargado. ¡Agregá tu primer equipo!</p>
          ) : (
            <table>
              <thead><tr><th>Nombre</th><th>Tipo</th><th>Peso</th><th>Cant.</th><th></th></tr></thead>
              <tbody>
                {equipment.map(eq => (
                  <tr key={eq.id}>
                    <td>{eq.name}</td>
                    <td><span className={`badge ${eq.type === "barbell" ? "badge-blue" : "badge-green"}`}>{eq.type}</span></td>
                    <td>{eq.weight_kg} kg</td>
                    <td>{eq.quantity}</td>
                    <td><button className="btn btn-danger" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => removeEquipment(eq.id)}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* === VISION === */}
      <section id="vision">
        <div className="card">
          <h2>📸 Capturar Set</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 16 }}>
            Sacá una foto de tu barra cargada. El stub simula la detección de tu inventario.
          </p>

          {!previewUrl && (
            <div className="upload-area" onClick={() => document.getElementById("vision-input")?.click()}>
              <div className="icon">📷</div>
              <p><strong>{visionLoading ? "Analizando..." : "Sacar foto o seleccionar archivo"}</strong></p>
              <p className="hint">En celular abre la cámara automáticamente</p>
              <input
                id="vision-input"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleVisionFile}
                style={{ display: "none" }}
              />
            </div>
          )}

          {previewUrl && !visionResult && (
            <div style={{ textAlign: "center" }}>
              <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: 300, borderRadius: 8, marginBottom: 12 }} />
              <p style={{ color: "var(--text-muted)" }}>Analizando foto...</p>
            </div>
          )}

          {visionResult && (
            <div style={{ marginTop: 16, background: "var(--bg)", borderRadius: 8, padding: 16 }}>
              {previewUrl && (
                <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", maxHeight: 200, borderRadius: 8, marginBottom: 12 }} />
              )}
              <p style={{ fontWeight: 600, marginBottom: 8 }}>✅ Equipo detectado</p>
              <table style={{ fontSize: 14, marginBottom: 16 }}>
                <thead><tr><th>Equipo</th><th>Peso (kg)</th><th>Cant.</th></tr></thead>
                <tbody>
                  {visionResult.equipment_detected.map((d, i) => (
                    <tr key={i}><td>{d.name}</td><td>{d.weight_kg}</td><td>{d.quantity}</td></tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <label style={{ color: "var(--text-muted)", fontSize: 12 }}>Peso (kg)</label>
                  <input
                    type="number" step="0.5"
                    value={editWeight}
                    onChange={e => setEditWeight(e.target.value)}
                  />
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <label style={{ color: "var(--text-muted)", fontSize: 12 }}>Repeticiones</label>
                  <input
                    type="number" step="1" min="0"
                    value={editReps}
                    onChange={e => setEditReps(e.target.value)}
                    placeholder="Ej: 8"
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-primary" onClick={handleConfirmSet}>
                  ✓ Confirmar set
                </button>
                <button className="btn btn-ghost" onClick={handleClearVision}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
