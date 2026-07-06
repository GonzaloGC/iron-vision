const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: options?.body instanceof FormData ? {} : { "Content-Type": "application/json", ...options?.headers as Record<string, string> },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export interface EquipmentItem {
  id: number; user_id: number; name: string; type: string;
  weight_kg: number; quantity: number; notes: string | null; created_at: string;
}

export function getEquipment() { return request<EquipmentItem[]>("/inventory"); }
export function createEquipment(data: Partial<EquipmentItem>) { return request<EquipmentItem>("/inventory", { method: "POST", body: JSON.stringify(data) }); }
export function updateEquipment(id: number, data: Partial<EquipmentItem>) { return request<EquipmentItem>(`/inventory/${id}`, { method: "PUT", body: JSON.stringify(data) }); }
export function deleteEquipment(id: number) { return request<void>(`/inventory/${id}`, { method: "DELETE" }); }

export interface WorkoutResponse {
  id: number; user_id: number; started_at: string; ended_at: string | null;
  duration_minutes: number | null; notes: string | null; is_completed: number;
  created_at: string; exercises: ExerciseResponse[];
}

export interface ExerciseResponse {
  id: number; workout_id: number; name: string; equipment_id: number | null;
  order: number; notes: string | null; sets: SetResponse[];
}

export interface SetResponse {
  id: number; exercise_id: number; reps: number | null; weight_kg: number | null;
  photo_url: string | null; photo_taken_at: string | null; order: number;
  is_completed: number; created_at: string;
}

export function getWorkouts() { return request<WorkoutResponse[]>("/workouts"); }
export function getWorkout(id: number) { return request<WorkoutResponse>(`/workouts/${id}`); }
export function createWorkout(data?: { notes?: string }) { return request<WorkoutResponse>("/workouts", { method: "POST", body: JSON.stringify(data || {}) }); }
export function finishWorkout(id: number) { return request<WorkoutResponse>(`/workouts/${id}/finish`, { method: "POST" }); }
export function deleteWorkout(id: number) { return request<void>(`/workouts/${id}`, { method: "DELETE" }); }
export function addExercise(workoutId: number, data: { name: string }) { return request<ExerciseResponse>(`/workouts/${workoutId}/exercises`, { method: "POST", body: JSON.stringify(data) }); }
export function addSet(workoutId: number, exerciseId: number, data: { reps?: number; weight_kg?: number }) { return request<SetResponse>(`/workouts/${workoutId}/exercises/${exerciseId}/sets`, { method: "POST", body: JSON.stringify(data) }); }

export interface AnalyzeResponse {
  equipment_detected: { equipment_id: number; name: string; weight_kg: number; quantity: number }[];
  total_weight_kg: number; workout_id: number; exercise_id: number; set_id: number; photo_time: string;
}

export function analyzePhoto(file: File, reps?: number) {
  const fd = new FormData();
  fd.append("file", file);
  if (reps !== undefined) fd.append("reps", String(reps));
  return request<AnalyzeResponse>("/vision/analyze", { method: "POST", body: fd });
}

export function updateSet(id: number, data: { reps?: number; weight_kg?: number }) {
  return request<SetResponse>(`/workouts/sets/${id}`, { method: "PATCH", body: JSON.stringify(data) });
}

export function deleteSet(id: number) {
  return request<void>(`/workouts/sets/${id}`, { method: "DELETE" });
}

export interface VolumePoint { label: string; total_volume_kg: number; total_sets: number; workout_count: number; }
export function getVolume(period = "week", weeks = 4) { return request<VolumePoint[]>(`/dashboard/volume?period=${period}&weeks=${weeks}`); }

export interface ProgressPoint { date: string; weight_kg: number; reps: number | null; estimated_one_rm: number | null; }
export function getProgress(exerciseName: string, limit = 20) { return request<ProgressPoint[]>(`/dashboard/progress?exercise_name=${encodeURIComponent(exerciseName)}&limit=${limit}`); }

export interface RecentWorkout { id: number; date: string; duration_minutes: number | null; exercise_count: number; total_volume_kg: number; total_sets: number; }
export function getRecent(limit = 5) { return request<RecentWorkout[]>(`/dashboard/recent?limit=${limit}`); }
