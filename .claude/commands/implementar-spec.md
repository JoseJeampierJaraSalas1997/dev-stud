---
description: Implementa una spec aprobada con TDD y verificación
argument-hint: <ruta a la spec en docs/specs/>
---

Implementa la spec: $ARGUMENTS

1. Lee `CLAUDE.md` y la spec. Si su estado no es `aprobado`, detente y pide aprobación.
   Si engram está disponible, `mem_search` con el ID de la spec y sus archivos clave.
2. Escribe un plan corto: pasos, archivos a tocar, un test por criterio de aceptación.
3. Por cada AC: test que falla (nombrado con el ID) → código mínimo → test verde.
4. Respeta las invariantes de `CLAUDE.md` (costura de datos, tokens, lazy three.js, estados de enlace).
5. Ejecuta `npm run typecheck && npm run lint && npm test` y muestra la salida.
6. Actualiza la spec (estado → implementado), `docs/specs/data-contract.md` si cambió
   el contrato, y crea un ADR si tomaste una decisión de arquitectura.
7. Guarda en engram (`topic_key` `jharvis-os/spec/<id>`) decisiones y gotchas, y
   actualiza `jharvis-os/backlog` si cerraste un BL-xx.
8. Resume qué ACs quedaron cubiertos y cuáles no.
