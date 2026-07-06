"use client";

import { useCallback, useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import * as api from "@/lib/api";
import { useToast } from "@/components/Toast";

export default function DashboardPage() {
  const [volume, setVolume] = useState<api.VolumePoint[]>([]);
  const [progress, setProgress] = useState<api.ProgressPoint[]>([]);
  const [recent, setRecent] = useState<api.RecentWorkout[]>([]);
  const [workouts, setWorkouts] = useState<api.WorkoutResponse[]>([]);
  const [progExercise, setProgExercise] = useState("Sentadilla");
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const exercises = ["Sentadilla", "Press Banca", "Peso Muerto"];

  const fetchAll = useCallback(async () => {
    try {
      const [v, p, r, w] = await Promise.all([
        api.getVolume("week", 4),
        api.getProgress(progExercise),
        api.getRecent(5),
        api.getWorkouts(),
      ]);
      setVolume(v); setProgress(p); setRecent(r); setWorkouts(w);
    } catch {
      addToast("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  }, [progExercise]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const activeWorkout = workouts.find(w => !w.is_completed);

  const kpis = (() => {
    const completed = workouts.filter(w => w.is_completed);
    const totalVol = recent.reduce((s, r) => s + r.total_volume_kg, 0);
    const totalSets = recent.reduce((s, r) => s + r.total_sets, 0);
    const avgDur = recent.length ? recent.reduce((s, r) => s + (r.duration_minutes || 0), 0) / recent.length : 0;
    return { workoutsThisMonth: completed.length, totalVolume: totalVol, totalSets, avgDuration: avgDur };
  })();

  const handleFinishWorkout = async (id: number) => {
    await api.finishWorkout(id);
    const [w, r] = await Promise.all([api.getWorkouts(), api.getRecent(5)]);
    setWorkouts(w); setRecent(r);
  };

  if (loading) return <p style={{ padding: 32, color: "var(--on-surface-variant)" }}>Cargando...</p>;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("es", { day: "numeric", month: "short" });

  return (
    <div>
      <h2 className="page-subheading" style={{ marginBottom: 16 }}>Listo para entrenar.</h2>

      {/* KPI Grid */}
      <section className="section">
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Sesiones</span>
              <span className="kpi-icon material-symbols-outlined">fitness_center</span>
            </div>
            <div className="kpi-value">{recent.length}</div>
            <div className="kpi-glow" />
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Volumen</span>
              <span className="kpi-icon material-symbols-outlined">monitor_weight</span>
            </div>
            <div className="kpi-flex">
              <span className="kpi-value" style={{ color: "var(--on-surface)", textShadow: "none" }}>{kpis.totalVolume.toLocaleString()}</span>
              <span className="kpi-unit">kg</span>
            </div>
            <div className="kpi-glow" />
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Sets</span>
              <span className="kpi-icon material-symbols-outlined">repeat</span>
            </div>
            <div className="kpi-value" style={{ color: "var(--on-surface)", textShadow: "none" }}>{kpis.totalSets}</div>
            <div className="kpi-glow" />
          </div>
          <div className="kpi-card">
            <div className="kpi-header">
              <span className="kpi-label">Duración</span>
              <span className="kpi-icon material-symbols-outlined">timer</span>
            </div>
            <div className="kpi-flex">
              <span className="kpi-value" style={{ color: "var(--on-surface)", textShadow: "none" }}>{Math.round(kpis.avgDuration)}</span>
              <span className="kpi-unit">m</span>
            </div>
            <div className="kpi-glow" />
          </div>
        </div>
      </section>

      {/* Volume Chart */}
      <section className="section">
        <div className="card">
          <div className="card-header">
            <h3>Volumen semanal</h3>
            <span className="card-icon material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>monitoring</span>
          </div>
          {volume.length === 0 ? (
            <p style={{ color: "var(--on-surface-variant)", fontSize: 14 }}>Sin datos de volumen.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={volume} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tick={{ fill: "var(--on-surface-variant)", fontSize: 11, fontFamily: "var(--font-display)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--on-surface-variant)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--surface-container)", border: "1px solid var(--outline-variant)", borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: "var(--on-surface)" }}
                />
                <Bar dataKey="total_volume_kg" fill="var(--primary-container)" radius={[4, 4, 0, 0]} name="Volumen kg" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Progress Chart */}
      <section className="section">
        <div className="card">
          <div className="card-header">
            <h3>Progress / {progExercise}</h3>
            <select className="progress-select" value={progExercise} onChange={e => setProgExercise(e.target.value)}>
              {exercises.map(ex => <option key={ex}>{ex}</option>)}
            </select>
          </div>
          {progress.length === 0 ? (
            <p style={{ color: "var(--on-surface-variant)", fontSize: 14 }}>Sin datos de progreso para este ejercicio.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={progress} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--outline-variant)" />
                <XAxis dataKey="date" tick={{ fill: "var(--on-surface-variant)", fontSize: 11 }} tickFormatter={v => formatDate(v)} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--on-surface-variant)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--surface-container)", border: "1px solid var(--outline-variant)", borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: "var(--on-surface)" }}
                  labelFormatter={v => new Date(v).toLocaleDateString("es", { dateStyle: "long" })}
                />
                <Line type="monotone" dataKey="weight_kg" stroke="var(--primary-container)" strokeWidth={2} dot={{ r: 4, fill: "var(--primary-container)" }} name="Peso (kg)" />
                <Line type="monotone" dataKey="estimated_one_rm" stroke="var(--secondary)" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="4 4" name="1RM est." />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* Recent Workouts */}
      <section className="section">
        <h3 className="section-title">Workouts recientes</h3>

        {activeWorkout && (
          <div className="active-banner">
            <span>⏳ Workout activo ({new Date(activeWorkout.started_at).toLocaleString("es")})</span>
            <button className="btn-primary" style={{ padding: "8px 20px", fontSize: 14 }} onClick={() => handleFinishWorkout(activeWorkout.id)}>Finalizar</button>
          </div>
        )}

        {recent.length === 0 ? (
          <p style={{ color: "var(--on-surface-variant)", fontSize: 14 }}>Sin workouts todavía.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {recent.map(w => (
              <div key={w.id} className="wo-item">
                <div>
                  <div className="wo-name">{new Date(w.date).toLocaleDateString("es", { dateStyle: "medium" })}</div>
                  <div className="wo-date">
                    {w.duration_minutes ? `${Math.round(w.duration_minutes)} min` : "—"} · {w.exercise_count} ejercicios · {w.total_sets} sets
                  </div>
                </div>
                <div className="wo-vol" style={{ color: "var(--primary-fixed-dim)" }}>
                  {w.total_volume_kg.toLocaleString()}
                  <span style={{ color: "var(--on-surface-variant)", fontSize: 14, marginLeft: 2 }}>kg</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
