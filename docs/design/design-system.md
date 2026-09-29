# Sistema de diseño — Arc Telemetry HUD

Fuente de verdad en código: `src/styles/theme.css` (bloque `@theme` de Tailwind v4).
Cada token genera utilidades (`--color-primary` → `text-primary`, `bg-primary`…).

## Principios

1. **Información antes que ornamento.** Cada animación comunica estado (escaneo = activo, radar = escuchando, flicker = ruido de señal).
2. **Oscuro, denso, legible.** Fondo `#0d141d`, texto `#dce3f0`, monoespaciada para datos.
3. **Color = semántica.** El color nunca es decorativo; ver tabla de roles.
4. **Terminal táctica.** Etiquetas en MAYÚSCULAS con `_` (`HARDWARE_TELEM`), paneles con esquinas y reglas finas.

## Color — roles semánticos

| Rol | Token principal | Hex | Uso | No usar para |
| --- | --- | --- | --- | --- |
| Primario | `primary-container` | `#00f0ff` | Acción, dato activo, núcleo | Alertas |
| Texto primario | `primary` | `#dbfcff` | Valores destacados | |
| Secundario (ámbar) | `secondary-container` | `#fbb400` | **Crítico / prioridad alta** | Decoración, estados OK |
| Terciario | `tertiary-fixed-dim` | `#4cd6fb` | Estructura, series secundarias | |
| Éxito (extensión) | `success` | `#00ffaa` | `NOMINAL`, `ONLINE`, evento activo | Botones de acción |
| Error | `error` / `error-container` | `#ffb4ab` / `#93000a` | Enlace caído, kill switch armado | |
| Superficies | `surface-container-{lowest…highest}` | `#080f18 → #2e353f` | Profundidad por capa | |
| Contorno | `outline` / `outline-variant` | `#849495` / `#3b494b` | Reglas, bordes, texto terciario | |

Regla: cada `bg-X` lleva su `text-on-X` cuando hay texto encima.

## Tipografía

| Rol | Familia | Tamaño / interlineado | Uso |
| --- | --- | --- | --- |
| `display-lg` | Space Grotesk | 48/56 | Cifras héroe desktop |
| `display-lg-mobile` | Space Grotesk | 32/40 | Cifras héroe mobile |
| `headline-lg/md/sm` | Space Grotesk | 28 / 22 / 18 | Títulos de sección |
| `body-lg/md/sm` | JetBrains Mono | 15 / 13 / 11 | Transcripción, datos |
| `label-lg/md/sm` | JetBrains Mono | 12 / 10 / 9, tracking 0.08–0.12em | Etiquetas de panel, chips |

Uso: `font-label-sm text-label-sm` (familia y escala van juntas).

## Espaciado

Dos espacios de nombres, heredados de las dos pantallas de Stitch:

| Pantalla | Escala | Tokens |
| --- | --- | --- |
| Desktop (Command Center) | 4 px | `pad-xs 4` · `pad-sm 8` · `pad-md 12` · `pad-lg 16` · `pad-xl 24` · `pad-2xl 32` |
| Mobile (Reactor HUD) | rem | `space-2xs .125` · `xs .25` · `sm .5` · `md .75` · `base 1` · `lg 1.5` · `xl 2` · `2xl 3` |

No mezclar escalas dentro de la misma pantalla.

## Movimiento

| Token | Duración | Significado |
| --- | --- | --- |
| `animate-scanline` | 3.2 s lineal ∞ | Panel con datos en vivo |
| `animate-radar` | 2 s ∞ | Escuchando (voz) |
| `animate-flicker` | 4 s ∞ | Ruido de señal / HUD vivo |
| `animate-spin-slow` | 60 s ∞ | Anillos decorativos del reactor |

Con `prefers-reduced-motion: reduce` las animaciones infinitas deben
desactivarse (el runtime 3D ya renderiza un único frame).

## Primitivas (`src/components/hud`)

| Primitiva | Props clave | Uso |
| --- | --- | --- |
| `Panel` | `title`, `status`, `statusTone`, `scanline` | Contenedor estándar con cabecera y regla |
| `MeterBar` | `pct`, `tone` | Barra de porcentaje (usa `clampPct`) |
| `StatChip` | `tone` | Pastilla de estado |
| `StatusDot` | `tone`, `square` | Indicador puntual |
| `Sparkline` | `samples` (0..1) | Serie temporal mínima |
| `Spectrum` | `bars` (0..1) | Barras de audio/sintetizador |
| `TacticalButton` | `variant` | Botón con estilo táctico / destructivo |
| `CornerBrackets` | — | Esquinas HUD decorativas |
| `SceneFallback` | `label`, `className` | Placeholder mientras carga el 3D |
| `Icon` | `name`, `size`, `filled` | Material Symbols |

Nueva primitiva → solo si se repite en ≥ 2 pantallas o ≥ 3 paneles; exportarla en `index.ts`.

## Accesibilidad

- Contraste AA para `body-*` sobre superficies (`on-surface` sobre `surface-container*` cumple).
- `label-sm` (9 px) solo para metadatos no esenciales.
- Toggles con `aria-pressed`; sliders con `<label htmlFor>`.
- Foco visible en todos los controles interactivos.
- Información nunca solo por color: acompañar con texto (`LINK LOST`, `[CRITICAL]`).

## Desviaciones

Respecto al export de Stitch: paleta canónica y rol `success`. Ver
[ADR-0003](../architecture/adr/0003-paleta-canonica-y-success.md).
