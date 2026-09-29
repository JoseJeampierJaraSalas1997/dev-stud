# Backlog técnico y de producto

Brechas detectadas al auditar el código (2026-09-28). Cada ítem está listo para
convertirse en spec con `docs/specs/_template.md` o `/nuevo-spec BL-xx`.

| ID | Prioridad | Título | Evidencia | Criterio de hecho |
| --- | --- | --- | --- | --- |
| BL-01 | **P0** | Controles no llegan al backend real | `jharvisSource.ts` no implementa `setMode/setEnergy/setTactical`; el kill switch (`CommandBar.tsx`) y el toggle de modo son no-ops con `VITE_JHARVIS_SOURCE=jharvis` | Los tres controles hacen `POST` (ver `data-contract.md` §1) y hay test con `fetch` simulado |
| BL-02 | P1 | Validar el payload del backend | `toSnapshot` hace cast `as Partial<JharvisSnapshot>` sin validar | Validación por clave; clave inválida → se ignora y se registra, el resto se aplica; test con payload corrupto |
| BL-03 | P1 | Feedback por comando | `submitCommand` no devuelve ack; un fallo pone todo el enlace en `error` | `submitCommand` devuelve `Promise<{ok}>`; la CommandBar muestra enviado/fallo sin marcar el enlace caído |
| BL-04 | P2 | Backoff exponencial en reconexión | WS reintenta cada 4 s fijo; el poll no reduce frecuencia en error | Backoff 1→2→4→…→30 s con jitter, reset al reconectar |
| BL-05 | P2 | Merge profundo de frames parciales | Merge superficial: enviar `core.state` solo borra el resto de `core` | Decidir (ADR) entre deltas con merge profundo o exigir claves completas |
| BL-06 | P2 | Navegación real SideNav/TabBar | Hoy solo cambian estado local | Spec de secciones o retirar los ítems no funcionales |
| BL-07 | P3 | Voz real | Botón de voz sin captura | Spec de M3 (Web Speech API o streaming) |
| BL-08 | P3 | Limpiar directorios vacíos | `new/`, `projets/`, `proyejts/` vacíos y sin trackear | Borrar o darles propósito |
| BL-09 | P3 | Tests E2E / visuales | Solo unitarios con jsdom | Playwright con capturas de `/` y `/hud` en mock |
