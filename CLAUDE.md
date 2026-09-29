# CLAUDE.md — JHARVIS OS

Contexto operativo para agentes de IA (Claude Code, Codex, Cursor…) que trabajan
en este repo. Léelo entero antes de tocar código. `AGENTS.md` apunta aquí.

## Qué es

HUD interactivo en React + three.js para el asistente JHARVIS. Dos pantallas:
`/` (Command Center, desktop) y `/hud` (Arc Reactor HUD, mobile-first). Todo lo
que se pinta sale de **un único `JharvisSnapshot`** servido por un `DataSource`
(mock local o backend jharvis real).

- Producto y alcance: `docs/product/PRD.md`
- Arquitectura: `docs/architecture/overview.md` y ADRs en `docs/architecture/adr/`
- Contrato con el backend: `docs/specs/data-contract.md`
- Sistema de diseño: `docs/design/design-system.md`
- Specs de pantallas: `docs/specs/`
- Flujo de trabajo con IA: `docs/process/ai-workflow.md`

## Comandos

```bash
npm run dev         # servidor de desarrollo (mock por defecto)
npm test            # vitest run
npm run typecheck   # tsc -b --noEmit
npm run lint        # oxlint
npm run build       # typecheck + build
```

Definición de "verde": `npm run typecheck && npm run lint && npm test` sin
errores. No declares una tarea terminada sin haberlo ejecutado.

> En esta máquina node vive en nvm (`~/.nvm/versions/node/v24.18.1`); si
> `npm`/`npx` no aparecen en el PATH, usa
> `export PATH=$HOME/.nvm/versions/node/v24.18.1/bin:$PATH` (en shells no
> interactivos `source ~/.nvm/nvm.sh` puede no bastar).

## Invariantes (no romper)

1. **Una sola costura de datos.** Los componentes leen solo vía hooks de
   `src/data/hooks.ts` (`useJharvis(selector)` y los `useX()` derivados). Nunca
   `fetch`, `WebSocket` ni imports de `mock/` desde un componente.
2. **El snapshot es inmutable y completo.** Una fuente publica frames enteros;
   nada muta un snapshot ya publicado. Tipos en `src/data/types.ts` son la
   fuente de verdad del contrato.
3. **Añadir un dato nuevo = tocar en este orden:** `types.ts` → `mock/seed.ts`
   → `mockSource.ts` (si se anima) → `jharvisSource.ts#toSnapshot` → hook
   selector → componente → test. Actualiza `docs/specs/data-contract.md`.
4. **Controles del operador** (`setEnergy`, `setTactical`, `setMode`,
   `submitCommand`) son opcionales en `DataSource`; los componentes los llaman
   con `?.`. Un control nuevo se añade a la interfaz, al mock y al adaptador.
5. **three.js fuera del entry chunk.** Toda escena se monta con
   `useThreeScene(builder)` dentro de un componente cargado con `lazy()` y un
   `SceneFallback` en `Suspense`. Los builders (`src/three/*.ts`) no tocan DOM
   ni renderer y deben liberar geometrías/materiales en `dispose()`.
6. **Accesibilidad de movimiento.** Respeta `prefers-reduced-motion` (el
   runtime ya lo hace; no añadas animaciones infinitas sin variante reducida).
7. **Estados de enlace visibles.** `status: 'connecting' | 'live' | 'error'`
   siempre tiene representación en la UI (`LINK LOST // RETRYING`,
   `ENLACE PERDIDO // REINTENTANDO`). Nunca paneles en blanco.
8. **Tokens, no colores sueltos.** Solo clases Tailwind generadas desde
   `src/styles/theme.css` (`text-primary`, `bg-surface-container`, `p-pad-sm`…).
   Nada de hex en componentes. Ámbar = crítico/prioridad, verde `success` = OK.

## Convenciones

- TypeScript estricto, componentes función con export nombrado (no default,
  salvo `App`). Un componente por archivo, `PascalCase.tsx`.
- Primitivas compartidas en `src/components/hud/` (exportadas por `index.ts`);
  piezas de pantalla en `desktop/` o `mobile/`.
- `cn()` (`src/lib/cn.ts`) para componer clases.
- Comentarios: solo el *porqué* no obvio, en inglés, como el código existente.
  Documentación de producto y specs: en español.
- Tests junto al código (`*.test.ts(x)`), Vitest + Testing Library + jsdom.
  Inyecta fuentes con `<JharvisProvider source={...}>`; inyecta renderer
  falso en `mountScene` (ver `sceneRuntime.test.ts`).
- Textos del HUD en MAYÚSCULAS estilo terminal (`CURRENT_MISSION`,
  `HARDWARE_TELEM`). Desktop en inglés, mobile en español, como el diseño.

## Cómo trabajar aquí (resumen)

Spec → plan → test que falla → implementación → verificación → docs.
Para cualquier cambio de comportamiento:

1. Si no hay spec, créala desde `docs/specs/_template.md` (o `/nuevo-spec`).
2. Escribe criterios de aceptación verificables (IDs `CC-xx`, `RH-xx`, `DC-xx`).
3. Test primero; luego el mínimo código para pasarlo.
4. Corre la definición de verde.
5. Si tomaste una decisión de arquitectura, añade un ADR
   (`docs/architecture/adr/_template.md`).

Detalle completo en `docs/process/ai-workflow.md`.

## Memoria (engram)

Si el MCP `engram` está disponible (proyecto `dev-stud`): `mem_context` +
`mem_search` al empezar, `mem_save` al decidir/descubrir/arreglar (con
`topic_key` `jharvis-os/...`), `mem_session_summary` al cerrar. El repo manda
sobre la memoria: decisiones duraderas van a ADR/spec primero. Convenciones en
`docs/process/ai-workflow.md#engram-en-este-proyecto`.

## Diseño de origen

Proyecto Stitch `14963888297409071918` ("Interactive 3D Jarvis Assistant",
design system *Arc Telemetry HUD*). Si el MCP `stitch` está disponible, úsalo
para consultar pantallas; las desviaciones deliberadas están en
`docs/design/design-system.md#desviaciones`.

## Qué NO hacer

- No añadir dependencias sin justificarlo en el PR (el bundle ya carga three).
- No commitear `.env.local`, `dist/` ni `.vercel/`.
- No convertir el mock en requisito: la app debe funcionar contra cualquier
  backend que cumpla `docs/specs/data-contract.md`.
