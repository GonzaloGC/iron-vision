# IronVision — Preguntas Frecuentes

## 1. ¿Cuándo arranca el tiempo?

Con la primera foto que subís. El backend:

- Lee el timestamp del EXIF de la foto (o usa la fecha del archivo si no hay EXIF)
- Si no hay ningún workout activo → crea uno nuevo y ese timestamp es el inicio
- El workout queda "activo" (no finalizado)
- Cada foto siguiente se agrega al mismo workout, con su timestamp
- Si pasan >30 min entre fotos → crea un nuevo ejercicio dentro del mismo workout
- Si cerrás el navegador y volvés al otro día, la próxima foto crea un workout nuevo

---

## 2. ¿Qué pasa exactamente cuando saco una foto?

1. Subís la foto desde el celu (se abre la cámara automáticamente)
2. El backend extrae la fecha/hora del EXIF de la foto
3. El sistema **simula** la detección: elige discos y barra al azar de tu inventario
4. Se calcula el peso total y se registra automáticamente como un set
5. El set se asigna al workout y ejercicio activo (o crea uno nuevo si pasó mucho tiempo)
6. En pantalla ves: la foto, los equipos "detectados", el peso total, y campos para editar

---

## 3. ¿El peso que detecta es el real?

**No.** La detección visual es un *stub* (simulación). El sistema ignora la foto y elige discos y barras al azar de tu inventario. El peso que ves no es el real de la foto.

> El frontend lo advierte: *"el análisis es simulado"*

Esto cambiará en una fase futura cuando se implemente visión por computadora real.

---

## 4. ¿Puedo corregir el peso o las repeticiones?

Sí. Después de subir la foto, aparecen dos campos editables:

- **Peso (kg)** — para corregir el peso detectado
- **Repeticiones** — para cargar cuantas reps hiciste

Podés ajustarlos y tocar **Confirmar set** antes de que se guarde el valor final.

---

## 5. ¿Cómo agrego mi equipo (barras, discos)?

En la sección **Inventario** del dashboard. Completás:

| Campo | Ejemplo |
|-------|---------|
| Nombre | Disco 10kg |
| Tipo | Barra / Disco / Mancuerna / Otro |
| Peso (kg) | 10 |
| Cantidad | 2 |

El sistema usa tu inventario para simular la detección en las fotos.

---

## 6. ¿Dónde veo los workouts que ya hice?

En la sección **Workouts Recientes**. Cada fila muestra:

- Fecha del workout
- Duración en minutos
- Cantidad de ejercicios
- Volumen total (kg)
- Sets totales

También hay un banner especial si tenés un workout **activo** (sin finalizar).

---

## 7. ¿Qué significan los KPIs del dashboard?

| KPI | Qué muestra |
|-----|-------------|
| Workouts | Cantidad de workouts en los últimos 5 registrados |
| Volumen Total | Suma de kg levantados en los últimos workouts |
| Sets | Suma de series realizadas |
| Duración Promedio | Promedio de minutos por sesión |

---

## 8. ¿Puedo borrar o editar un set ya registrado?

Sí, los endpoints existen (PATCH y DELETE para sets individuales). Desde el dashboard de visión, después de analizar una foto, podés editar peso y reps y confirmar (que hace un PATCH). La interfaz para borrar sets directamente aún no está disponible desde el frontend.

---

## 9. ¿La app funciona en el celu?

Sí. El dashboard web es **responsive**:

- En celu la barra lateral se convierte en una **barra de navegación inferior** fija
- Las tablas tienen scroll horizontal
- Las tarjetas se achican para ocupar menos espacio
- La cámara se abre automáticamente al tocar "Sacar foto"

Funciona desde el navegador del celular, no requiere instalar nada.

---

## 10. ¿Qué NO funciona todavía?

- **Visión real** — la detección de peso desde la foto es un stub aleatorio
- **Ejercicios dinámicos** — la lista de ejercicios está hardcodeada (Sentadilla, Press Banca, Peso Muerto)
- **Detalle de workout** — no se puede ver un workout en particular con todos sus sets
- **Docker / deploy** — no hay Dockerfile ni docker-compose funcionales
- **Tests** — no hay tests automatizados
- **App mobile nativa** — la carpeta `mobile/` es un proyecto Expo vacío
