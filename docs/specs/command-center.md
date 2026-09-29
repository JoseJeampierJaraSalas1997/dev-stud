# Spec — Command Center (`/`)

| Campo | Valor |
| --- | --- |
| Estado | Implementado (M0) |
| Ruta | `src/routes/CommandCenter.tsx` |
| Diseño | Stitch: *JHARVIS OS — Command Center 2040* |
| Idioma UI | Inglés, estilo terminal en mayúsculas |
| Viewport objetivo | ≥ 1280 px; en < `xl` las columnas se apilan |

## Objetivo

Consola principal del operador: estado global del sistema, núcleo cognitivo
3D, conversación y control de la malla de agentes en una sola vista.

## Layout

```
┌─────────────────────────── TopBar (fijo, h-14) ───────────────────────────┐
│ SideNav │ ┌── col 3 ──┐ ┌──────── col 6 ────────┐ ┌── col 3 ──┐           │
│ (w-64)  │ │HardwareTel│ │ CoreViewport (3D,lazy)│ │MissionCard│           │
│         │ │ThreadMap  │ │ StateBar              │ │AgentsMesh │           │
│         │ │           │ │ NeuralTranscript      │ │ ├WorkingCtx│          │
│         │ └───────────┘ └───────────────────────┘ │ └Timeline │           │
│         │ ────────────────── CommandBar ────────────────────── │           │
└─────────┴───────────────────────────────────────────────────────────────────┘
```

## Inventario de paneles

| Componente | Hook(s) | Muestra | Interacción |
| --- | --- | --- | --- |
| `TopBar` | `useSession`, `useLinkStatus`, `useCoreReadout` | Nodo, Q-link, latencia, modo, UTC, estado de enlace | Toggle `AUTONOMOUS/SUPERVISED` → `setMode` |
| `SideNav` | `useSession` | Secciones, agentes online, política de seguridad | Selección de sección (estado local) |
| `HardwareTelem` | `useHardware` | Gauges CPU/GPU/…, mesh, storage, coolant, uptime | — |
| `ThreadMap` | `useThreadMap` | Sparkline, clusters, digest | — |
| `CoreViewport` | `useCoreReadout` | Núcleo 3D + azimut/polar/confianza | Parallax con puntero |
| `StateBar` | `useCoreReadout` | Máquina de estados del núcleo, estado activo resaltado | — |
| `NeuralTranscript` | `useTranscript`, `useCoreReadout` | Conversación user/jharvis con facts | — |
| `MissionCard` | `useMission` | Misión, objetivo, % completado, prioridad (ámbar) | — |
| `AgentsMesh` | `useAgents` | 6 agentes con estado | — |
| `WorkingContextCard` | `useWorkingContext` | Tokens activos, KG, sesgo temporal | — |
| `EventTimeline` | `useTimeline` | Eventos; activo en `success` | — |
| `CommandBar` | `useSession`, `useCoreReadout`, `useDataSource` | Input de comando, kill switch | `submitCommand`, kill switch → `setMode('SUPERVISED')` |

## Criterios de aceptación

- **CC-01** La telemetría (columnas laterales) pinta antes de que cargue three.js;
  mientras tanto `CoreViewport` muestra `SceneFallback` del mismo tamaño (460 px).
- **CC-02** Con `status !== 'live'`, TopBar muestra `LINK LOST // RETRYING` en tono `error`.
- **CC-03** El toggle de modo refleja `session.mode` con `aria-pressed` y llama a `setMode`.
- **CC-04** Enviar el formulario con texto no vacío llama `submitCommand(texto)` y limpia el input; texto vacío no hace nada; `Escape` limpia.
- **CC-05** Kill switch: primer clic arma (pulso `error-container`, 4 s); segundo clic dentro de la ventana llama `setMode('SUPERVISED')`; pasada la ventana se desarma solo.
- **CC-06** Con el mock, tras un comando el núcleo pasa a `THINKING`, aparece la entrada del usuario, y luego respuesta de jharvis + evento de timeline.
- **CC-07** Con `core.state === 'LISTENING'` el botón de voz muestra el anillo `animate-radar`.
- **CC-08** El canvas 3D pausa su loop cuando sale del viewport y respeta reduced-motion.

## Estados

| Estado | Visual |
| --- | --- |
| `connecting` | Datos del seed, indicador degradado |
| `live` | Datos reales, punto `success` |
| `error` | Último frame + `LINK LOST // RETRYING` |
| Sin WebGL | Overlays visibles, sin canvas, sin crash |

## Pendiente

Ver `BL-01`, `BL-03`, `BL-05`, `BL-06` en [backlog](backlog.md).
