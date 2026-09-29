---
description: Redacta una spec nueva desde la plantilla del proyecto
argument-hint: <idea o ID de backlog, p. ej. BL-01>
---

Redacta una spec para: $ARGUMENTS

1. Lee `CLAUDE.md`, `docs/specs/_template.md`, `docs/specs/backlog.md` y, si la
   idea toca datos, `docs/specs/data-contract.md` y `src/data/types.ts`.
   Si engram está disponible, `mem_search` con la idea o el ID para recuperar contexto previo.
2. Lee el código afectado y cita rutas con línea en la sección Contexto.
3. Crea `docs/specs/<kebab-case>.md` siguiendo la plantilla. Criterios de
   aceptación en Dado/Cuando/Entonces, cada uno verificable con un test.
   Incluye siempre "Fuera de alcance".
4. Si viene de un ítem de backlog, enlázalo desde la fila del backlog.
5. No escribas código. Termina listando las preguntas abiertas que el humano
   debe responder antes de aprobar. Registra la spec en engram con
   `topic_key` `jharvis-os/spec/<id>` (estado: borrador, preguntas abiertas).
