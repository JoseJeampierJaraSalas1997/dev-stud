# Arquitectura

## Vista general

```mermaid
flowchart LR
  subgraph Fuentes["DataSource (src/data)"]
    M[mockSource<br/>tick 1s + random walk]
    J[jharvisSource<br/>poll GET /snapshot<br/>o WS stream]
  end
  B[(Backend jharvis)] -- JSON --> J
  J -- POST /command --> B
  P[JharvisProvider<br/>resolveSource() por env] --> Ctx[DataSourceContext]
  M --> P
  J --> P
  Ctx --> H["hooks.ts<br/>useJharvis(selector)<br/>useSyncExternalStore"]
  H --> C1[components/desktop]
  H --> C2[components/mobile]
  C1 & C2 --> HUD[components/hud<br/>primitivas]
  C1 -. lazy .-> T[three/<br/>sceneRuntime + escenas]
  C2 -. lazy .-> T
  C1 & C2 -- setMode / setEnergy /<br/>setTactical / submitCommand --> Ctx
```

## Capas

| Capa | Ruta | Responsabilidad | Puede importar |
| --- | --- | --- | --- |
| Tipos | `src/data/types.ts` | Contrato `JharvisSnapshot` y `DataSource` | nada |
| Fuentes | `src/data/mock`, `src/data/jharvis` | Producir frames y aceptar controles | tipos, seed |
| Provider/hooks | `src/data/provider.tsx`, `hooks.ts`, `context.ts` | Elegir fuente, exponer slices | fuentes, tipos |
| Primitivas HUD | `src/components/hud` | Visual puro, sin datos | `lib/` |
| Piezas de pantalla | `src/components/desktop`, `mobile` | Componer primitivas + hooks | hooks, hud, lib |
| Escenas 3D | `src/three` | Builders puros + runtime de montaje | three |
| Rutas | `src/routes` | Layout de cada pantalla, lazy de escenas | componentes |

Regla: las flechas solo bajan. Un componente nunca importa una fuente concreta.

## Flujo de un frame

1. La fuente construye un `JharvisSnapshot` nuevo (inmutable) y llama a los listeners.
2. `useSyncExternalStore` en cada hook ejecuta su selector sobre `getSnapshot()`.
3. Solo re-renderizan los componentes cuyo slice cambió de referencia.
4. Las escenas 3D leen su estado vía props/refs y animan en su propio `requestAnimationFrame`.

> Ojo: los selectores devuelven referencias del snapshot. Un selector que
> construya objetos nuevos (`s => ({ a: s.x, b: s.y })`) provoca bucles de
> render; deriva dentro del componente o memoiza.

## Flujo de un control

`Componente → source.setX?.(partial) → la fuente produce un frame nuevo → re-render`.
El componente no mantiene copia optimista del estado remoto (salvo UI efímera,
p. ej. `killArmed`).

## Runtime 3D

`mountScene(container, builder)` (`src/three/sceneRuntime.ts`):

- Crea renderer (inyectable para tests) y tolera ausencia de WebGL.
- `ResizeObserver` para tamaño, `IntersectionObserver` para pausar fuera de vista.
- `prefers-reduced-motion` → un solo frame.
- `dispose()` libera listeners, observers, geometrías y renderer.

Escenas: `jharvisCore.ts` (núcleo del Command Center) y `arcReactor.ts` (reactor del HUD).

## Configuración y despliegue

| Variable | Valores | Efecto |
| --- | --- | --- |
| `VITE_JHARVIS_SOURCE` | `mock` (def.) \| `jharvis` | Fuente de datos |
| `VITE_JHARVIS_URL` | URL base | Requerida con `jharvis` |
| `VITE_JHARVIS_WS` | URL ws(s) | Opcional; sin ella se hace poll cada 2 s |

Build estático (Vite) desplegado en Vercel; `vercel.json` reescribe todo a
`index.html` para que `/hud` funcione como deep link.

## Puntos de extensión

| Quiero… | Toco |
| --- | --- |
| Nuevo panel con datos existentes | componente + hook existente |
| Nuevo dato | ver invariante 3 en `CLAUDE.md` |
| Nuevo backend | `toSnapshot` en `jharvisSource.ts` |
| Nueva escena 3D | builder en `src/three/`, componente lazy + `useThreeScene` |
| Nueva pantalla | ruta en `App.tsx` + `src/routes/` + spec en `docs/specs/` |

## Decisiones

Ver [adr/](adr/).
