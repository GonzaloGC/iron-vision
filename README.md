# 🏋 IronVision

Home gym tracker sin entrada manual de datos. Sacás una foto de la barra cargada y el sistema registra el peso, el ejercicio y el tiempo automáticamente.

> ⚠️ **Fase 1 — Uso personal.** La detección de peso desde la foto es **simulada** (elige al azar de tu inventario). Visión real llegará en una fase futura.

---

## Quick Start

### Requisitos
- Python 3.11+
- Node.js 18+
- npm

### 1. Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

La DB se crea sola en `backend/iron_vision.db`.

### 2. Frontend

```bash
cd web
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Abrí `http://localhost:3000` y navegá al dashboard.

### 3. Seed de datos de prueba (opcional)

```bash
cd backend && python -m seed_demo
```

---

## Cómo funciona

### Flujo principal

1. **Configurás tu inventario** — agregás barras, discos y mancuernas que tenés en casa (sección Inventario)
2. **Sacás una foto** de la barra cargada — se abre la cámara automáticamente en el celu
3. **El sistema simula la detección** — elige elementos al azar de tu inventario y calcula el peso total
4. **Corregís si hace falta** — podés editar el peso y agregar repeticiones antes de confirmar
5. **El set se guarda automáticamente** con el timestamp del EXIF de la foto

### Timeline pasiva

- La primera foto del día crea un workout y marca el inicio
- Cada foto siguiente se agrega al mismo workout con su timestamp
- Si pasan >30 min entre fotos, se crea un nuevo ejercicio automáticamente
- El workout queda activo hasta que lo finalizás manualmente

---

## Arquitectura

```
iron-vision/
├── backend/          FastAPI + SQLAlchemy + SQLite
│   └── app/
│       ├── api/routes/   inventory, workouts, vision, dashboard
│       ├── models/       SQLAlchemy models
│       ├── schemas/      Pydantic v2 schemas
│       └── services/     Business logic + vision stub
├── web/              Next.js 14 (App Router) + TypeScript + Recharts
│   └── src/
│       ├── app/dashboard/  Página principal con KPIs, charts, y secciones
│       ├── components/     Sidebar, Toast, UI components
│       └── lib/api.ts      Cliente HTTP
├── mobile/           Expo (stub — sin funcionalidad todavía)
├── scripts/          Scripts para levantar en red local
├── docs/             Documentos del proyecto
├── AGENTS.md         Guía para agentes de IA
├── PHASES.md         Plan por fases
└── FAQ.md            Preguntas frecuentes
```

---

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `cd backend && uvicorn app.main:app --reload` | Backend dev en :8000 |
| `cd backend && python -m seed_demo` | Reset + seed datos de prueba |
| `cd web && npm run dev` | Frontend dev en :3000 |
| `cd web && npm run dev:network` | Frontend accesible desde la red local |
| `cd web && npm run build` | Build de producción |
| `.\scripts\serve.ps1` | Levanta backend + frontend en 0.0.0.0 (Windows) |
| `./scripts/serve.sh` | Lo mismo en Bash |

---

## Estado actual

### ✅ Funcional
- CRUD de inventario de equipamiento
- Subir foto → detectar (stub) → crear set con timestamp EXIF
- Editar peso y reps después de la foto
- Timeline automática con idle timeout (30 min)
- Dashboard con KPIs, volumen semanal, progreso por ejercicio
- Vista responsive para celular (bottom nav, tablas scrolleables)
- Toasts de notificación

### ❌ No implementado todavía
- Visión real por computadora (YOLO)
- Lista dinámica de ejercicios (hoy hardcodeada)
- Detalle de workout individual
- Docker / docker-compose
- Tests automatizados
- App mobile nativa (Expo)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Backend | FastAPI, SQLAlchemy 2.x, SQLite (WAL), Pydantic v2 |
| Frontend | Next.js 14 (App Router), TypeScript, Recharts |
| Mobile | Expo (stub) |
| Migraciones | Alembic |

---

## Licencia

Uso personal — Phase 1.
