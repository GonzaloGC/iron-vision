# IronVision — Agent guide

## Product concept

Home gym strength/hypertrophy tracker. The core innovation is **zero-data-entry**: instead of typing sets/reps during a workout, the user takes a photo of their loaded barbell or machine.

**User flow:**
1. Configure equipment inventory once (barbell, plates, dumbbells, etc.)
2. During the workout, snap a photo of the loaded bar — no typing needed
3. System detects barbell and plates from the photo, calculates total weight automatically (currently a random stub limited to the user's declared inventory)
4. Session timing is passive: photo EXIF metadata drives the timeline. Backend adds 3 min buffers (`WORKOUT_START_BUFFER_MINUTES`, `WORKOUT_END_BUFFER_MINUTES` in `config.py`) before the first and after the last photo. If >30 min (`EXERCISE_IDLE_TIMEOUT_MINUTES`) elapses between sets, a new exercise is created
5. Dashboard tracks volume, estimated 1RM, and progressive overload trends

**Three pillars:**
- **Zero-data-entry** — photo replaces manual logging
- **Passive timing** — EXIF metadata traces the session timeline
- **Controlled context** — home gym's closed inventory makes visual recognition tractable

**Phases:** Phase 1 = personal use (two brothers). Phase 2 = scalable home gym tool.

## Project structure

```
backend/     FastAPI + SQLite backend (Python)
web/         Next.js 14 App Router dashboard (TypeScript)
mobile/      Expo (stub — empty App.tsx, no real navigation)
docs/        Placeholders (1-line files)
```

## Backend

**Stack**: FastAPI, SQLAlchemy 2.x, SQLite (WAL mode + foreign keys via PRAGMA), Pydantic v2.

**Entrypoint**: `backend/app/main.py` — creates FastAPI app, mounts CORS (all origins), serves `uploads/` as static files, registers routers.

**Routers** (`backend/app/api/routes/`):
| Prefix | File | Purpose |
|---|---|---|
| `/inventory` | `inventory.py` | CRUD equipment items |
| `/workouts` | `workouts.py` | CRUD workouts, exercises, sets |
| `/vision` | `vision.py` | Upload photo → simulate analysis → record set |
| `/dashboard` | `dashboard.py` | Volume/week, progress/exercise, recent workouts |

**No authentication** — single default user (id=1) is created on first boot in `init_db()` and hardcoded in `dependencies.py`. The `/health` endpoint returns `{"status": "ok"}`.

**Vision is a stub** — `vision_service.py` randomly picks plates/barbells from the user's inventory. No real computer vision. The frontend warns: "el análisis es simulado."

**Commands**:
```bash
cd backend && pip install -r requirements.txt
cd backend && uvicorn app.main:app --reload        # dev server on :8000
cd backend && python -m seed_demo                   # reset + seed 10 workouts, 14 equipment items
```

**DB** auto-creates at `backend/iron_vision.db` on first startup. `seed_demo.py` deletes all data then inserts.

## Web

**Stack**: Next.js 14 (App Router), TypeScript, Recharts.

**Entrypoint**: `web/src/app/page.tsx` (landing) → `/dashboard` route.

**Config**: `@/*` maps to `src/*`. No ESLint, no Prettier config, no test runner set up.

**Commands**:
```bash
cd web && npm install
cd web && npm run dev          # :3000
cd web && npm run build
cd web && npm run dev:network  # :3000 accesible desde la red local
```

**Backend URL** configurable via `NEXT_PUBLIC_API_URL` en `.env.local` (default `http://localhost:8000` en `api.ts`).

Charts (`ProgressChart.tsx`, `VolumeChart.tsx`) are placeholders — actual charts render inline in `dashboard/page.tsx`.

## Mobile

Expo project with `app.json: {}` and a stub `App.tsx`. Screens (`CameraScreen`, `HistoryScreen`, `ProfileScreen`) exist but have no connectivity. Not functional.

## Scripts

`scripts/` contiene utilidades para correr el proyecto en red local:

| Script | Propósito |
|--------|-----------|
| `serve.ps1` | PowerShell: detecta IP local, levanta backend + frontend en 0.0.0.0 |
| `serve.sh` | Bash equivalente |
| `start-backend.bat` | Inicia solo backend con `--host 0.0.0.0` |
| `start-backend.ps1` | PowerShell equivalente |

## General

- `.gitignore` excludes: `venv/`, `__pycache__/`, `*.db*`, `uploads/`, `node_modules/`, `.next/`, `.tsbuildinfo`, `next-env.d.ts`
- No CI, no linter, no formatter, no typecheck script, no pre-commit hooks
- Backend loads `.env` via `pydantic-settings` (no `.env` file exists — relies on defaults in `config.py`)
- `Dockerfile` is a single-line comment placeholder
- All docs are 1-line stubs
