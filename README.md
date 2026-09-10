# JHARVIS OS — Interactive 3D Jarvis Assistant

React implementation of the Stitch project
[`14963888297409071918`](https://stitch.withgoogle.com/projects/14963888297409071918)
("Interactive 3D Jarvis Assistant", design system *Arc Telemetry HUD*).

Two screens, both live:

| Ruta   | Pantalla de Stitch                   | Contenido |
| ------ | ------------------------------------ | --------- |
| `/`    | JHARVIS OS — Command Center 2040     | Telemetría de hardware, thread map, núcleo 3D, transcripción neural, misión, malla de 6 agentes, timeline y barra de comando |
| `/hud` | J.A.R.V.I.S. Arc Reactor HUD 3D      | Reactor 3D, matriz de potencia, módulo de voz, controles tácticos, distribución energética y biometría |

## Arranque

```bash
npm install
npm run dev
```

| Script              | Qué hace                              |
| ------------------- | ------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                |
| `npm run build`     | Typecheck + build de producción       |
| `npm test`          | Suite de pruebas (Vitest)             |
| `npm run typecheck` | Solo TypeScript                       |
| `npm run lint`      | oxlint                                |

## Stack

Vite · React 19 · TypeScript · Tailwind CSS v4 · React Router 7 · three.js · Vitest

## Conectar un backend real

Todo lo que se pinta pasa por una única fuente de datos. Por defecto corre una
simulación local; para apuntar a un jharvis real basta con el entorno:

```bash
cp .env.example .env.local
# VITE_JHARVIS_SOURCE=jharvis
# VITE_JHARVIS_URL=http://localhost:8080
```

El adaptador (`src/data/jharvis/jharvisSource.ts`) espera un documento con la
forma de `JharvisSnapshot` en `GET {URL}/snapshot`, acepta el mismo objeto por
websocket y envía los comandos del operador a `POST {URL}/command`. Mapear un
backend distinto es reescribir la función `toSnapshot` de ese archivo: ningún
componente cambia.

Si el backend no responde, la fuente reporta `status: 'error'` y el HUD lo
muestra en su propio lenguaje (`LINK LOST // RETRYING`, `ENLACE PERDIDO`) en
lugar de quedarse en blanco.

## Estructura

```
src/
├── styles/theme.css     Tokens del design system en @theme
├── data/                Tipos, fuente mock, adaptador jharvis, provider y hooks
├── three/               Runtime de escenas + las dos escenas portadas de Stitch
├── components/
│   ├── hud/             Primitivas compartidas (Panel, MeterBar, Spectrum...)
│   ├── desktop/         Piezas del Command Center
│   └── mobile/          Piezas del HUD del reactor
└── routes/              CommandCenter.tsx y ReactorHud.tsx
```

Los datos viajan por `useSyncExternalStore`: cada fuente expone `getSnapshot()`
y `subscribe()`, así que los componentes no distinguen un mock que hace tick
cada segundo de un websocket real.

## Desviaciones deliberadas respecto al export de Stitch

1. **Paleta canónica.** La pantalla desktop se exportó con una paleta anterior
   (`#00a8ff`, Space Mono). Manda el design system del proyecto: cian
   `#00f0ff` y Space Grotesk.
2. **Rol `success` añadido.** Los mockups pintan los estados correctos
   (`NOMINAL`, `ONLINE`, `CRYO_STABLE`) en verde, pero el design system reserva
   el ámbar para alertas críticas y no tiene rol de éxito. Se añade
   `--color-success: #00ffaa` para no romper ni el visual ni la semántica.
3. **Contraste.** `on-primary-container` (#006970) sobre `primary-container`
   (#00f0ff) da ~5:1 y se lee lavado en textos de 9px; los estados activos
   usan `on-primary` (#00363a), ~9:1.
4. **Luces de three.js reescaladas.** Las escenas son r125; three.js pasó a
   unidades físicas después de r155 y los valores originales renderizaban casi
   negro. Geometría y animación no se tocaron.
5. **Añadidos que el mockup no contempla:** `prefers-reduced-motion` congela
   las escenas en un frame estático, las escenas pausan con
   `IntersectionObserver` al salir de viewport, el kill-switch pide
   confirmación antes de detener la autonomía, y three.js se carga en un chunk
   aparte para no bloquear el primer paint.

Las secciones 02–05 del sidebar y las pestañas ARMOR/DIAGNOSTICS/PROTOCOL
existen en el mockup pero no tienen diseño propio: se mantienen seleccionables
sin inventar pantallas.
