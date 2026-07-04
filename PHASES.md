# IronVision — Plan por fases

## Estado actual (post-refactor)

### ✅ Funcionando

- CRUD de inventario de equipamiento completo (backend + frontend)
- Subir foto → detectar equipamiento (stub) → crear workout/exercise/set automáticamente
- Timeline pasivo vía EXIF metadata + buffers configurables
- Dashboard con KPIs, gráficos de volumen semanal y progreso por ejercicio, tabla de workouts recientes
- Toasts para feedback visual, sidebar con detección de sección activa
- Logging estructurado en backend
- Alembic configurado para migraciones
- `reps` opcional en `POST /vision/analyze`
- Endpoints `PATCH` y `DELETE` para sets individuales
- Captura con cámara (`capture="environment"`) + preview + formulario post-análisis
- `NEXT_PUBLIC_API_URL` via `.env.local`
- Scripts `serve.ps1`, `serve.sh`, `start-backend.bat`, `start-backend.ps1`
- Dashboard responsive para mobile (sidebar → bottom nav, tablas con scroll, KPI a 2 columnas)

### ❌ Gaps para uso real

| Gap | Impacto | Estado |
|-----|---------|--------|
| No se pueden cargar reps al subir foto | Sets se crean con `reps = null` — inútil para hipertrofia | ✅ Resuelto |
| No se puede confirmar/corregir nombre del ejercicio post-detección | Ejercicios mal nombrados | ❌ Pendiente |
| No hay vista de detalle del workout activo durante el entreno | No se ve qué sets ya se hicieron | ❌ Pendiente |
| No se pueden editar/borrar sets individuales | Error en detección obliga a borrar todo el workout | ✅ Resuelto |
| Selector de ejercicios hardcodeado (`["Sentadilla", "Press Banca", "Peso Muerto"]`) | No refleja datos reales del usuario | ❌ Pendiente |
| Captura solo por file input (no cámara web) | Flujo tedioso: foto → transferir → subir | ✅ Resuelto |
| Sin Docker ni docker-compose funcional | No se puede deployar | ❌ Pendiente |
| Sin README ni guía de setup | Alguien nuevo no puede arrancar | ⏳ Parcial (scripts/ listos, falta README) |
| Sin tests | Cualquier cambio puede romper algo | ❌ Pendiente |
| Dashboard no responsive en mobile | Mala experiencia desde el celu | ✅ Resuelto |

---

## ✅ Fase 1A — Flujo de captura y reps (completada)

**Objetivo:** poder hacer un workout completo desde el browser (incluyendo celular).

| Item | Estado |
|------|--------|
| Aceptar `reps` opcional en `POST /vision/analyze` | ✅ |
| Endpoint `PATCH /workouts/sets/{id}` para editar peso y reps | ✅ |
| Endpoint `DELETE /workouts/sets/{id}` | ✅ |
| Captura por cámara (`capture="environment"` + preview) | ✅ |
| Post-análisis: formulario para editar peso/reps + confirmar | ✅ |
| Dashboard responsive para mobile (CSS media queries) | ✅ |

**Items extra:** scripts `serve.ps1`, `serve.sh`, `start-backend.bat/ps1`, `.env.local`.

---

## Fase 1B — Gestión de sesión activa

**Objetivo:** ver el progreso del workout en tiempo real durante el entrenamiento.

| Item | Archivos | Esfuerzo |
|------|----------|----------|
| Vista de workout activo: ejercicios con sets acumulados, peso total | `web/src/components/dashboard/ActiveWorkoutPanel.tsx` (nuevo) | ⚡ 1.5 hr |
| Botón "Iniciar entrenamiento" (workout manual sin foto) | `web/src/app/dashboard/page.tsx` | ⚡ 15 min |
| Finalizar workout con resumen (duración, volumen, ejercicios) | `web/src/app/dashboard/page.tsx` + endpoint existente | ⚡ 1 hr |
| Auto-finalizar workout si pasan >X min sin actividad | `backend/app/services/workout_service.py` | ⚡ 1 hr |

**Total estimado: ~4 horas**

---

## Fase 1C — Dashboard y datos reales

**Objetivo:** que el dashboard refleje datos reales del usuario.

| Item | Archivos | Esfuerzo |
|------|----------|----------|
| Endpoint `GET /exercises` o derivar lista dinámica desde workouts existentes | `backend/app/api/routes/workouts.py` o `dashboard.py` | ⚡ 30 min |
| Selector de ejercicios dinámico en frontend (reemplazar array hardcodeado) | `web/src/app/dashboard/page.tsx` | ⚡ 15 min |
| KPIs sobre períodos reales (semana actual, mes, comparativa) | `backend/app/api/routes/dashboard.py` | ⚡ 1 hr |
| Vista detalle de workout (ruta `/workouts/{id}` o modal) | Nueva página o componente | ⚡ 2 hr |

**Total estimado: ~4 horas**

---

## Fase 1D — Deployable y documentado

**Objetivo:** cualquiera levanta el proyecto en 5 minutos.

| Item | Archivos | Esfuerzo |
|------|----------|----------|
| Dockerfile backend multi-stage | `backend/Dockerfile` | ⚡ 30 min |
| Dockerfile frontend multi-stage (Next.js standalone) | `web/Dockerfile` (nuevo) | ⚡ 30 min |
| `docker-compose.yml` con backend + frontend + volumes | Raíz | ⚡ 30 min |
| `.env.example` con todas las vars necesarias | Raíz | ⚡ 15 min |
| README completo (qué hace, setup, arquitectura, capturas) | `README.md` | ⚡ 1 hr |
| Script `scripts/setup.sh` y `scripts/setup.ps1` | `scripts/` | ⚡ 30 min |

**Total estimado: ~3 horas**

---

## Fase 2 — Visión real + mobile + multi-user

| Item | Esfuerzo | Dependencias |
|------|----------|--------------|
| Modelo CV para detección de discos/barras (YOLO, dataset propio) | Semanas | Dataset de fotos etiquetadas |
| Mobile app funcional (Expo, cámara, upload, historial) | ~1-2 semanas | Fase 1A completa |
| Autenticación real (JWT, login/register) | ~2-3 días | — |
| Multi-user (autorización por recurso, ownership checks) | ~2 días | Auth |
| Tests automatizados (pytest backend, vitest frontend) | ~3-4 días | — |

---

## Orden recomendado

```
Fase 1A  →  Fase 1B  →  Fase 1D  →  Fase 1C  →  Fase 2
  (core)     (sesión)    (deploy)    (datos)     (visión real)
```

- **Fase 1A** es requisito para que el producto sirva (sin reps no hay tracking de hipertrofia).
- **Fase 1B** maximiza la utilidad durante el entrenamiento.
- **Fase 1D** antes que 1C porque deployar temprano permite feedback más rápido.
- **Fase 1C** son mejoras sobre lo que ya existe.
- **Fase 2** es optativa para personal use; obligatoria si se quiere escalar.
