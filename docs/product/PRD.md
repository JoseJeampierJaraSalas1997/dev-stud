# PRD — JHARVIS OS

| Campo | Valor |
| --- | --- |
| Estado | Vivo — v0.1 (UI completa sobre mock; backend pendiente) |
| Dueño | jose-jeampier-jara-salas |
| Última revisión | 2026-09-28 |
| Diseño de origen | Stitch `14963888297409071918` — *Arc Telemetry HUD* |

## 1. Problema

Un asistente autónomo (JHARVIS) ejecuta tareas con varios agentes en paralelo.
Hoy no hay una superficie donde el operador vea **en un solo vistazo** qué está
haciendo el sistema, con qué recursos, en qué estado de razonamiento está, y
desde donde pueda **intervenir** (dar una orden, pasar a modo supervisado,
detenerlo). Las consolas genéricas (logs, dashboards de métricas) muestran
datos, pero no comunican estado de un agente ni permiten control.

## 2. Visión

Una consola táctica tipo "HUD" que convierte el estado interno de JHARVIS en
algo legible e interactivo en tiempo real, con un núcleo 3D que refleja el
estado cognitivo (escuchando, pensando, ejecutando, hablando) y controles que
el operador puede usar con confianza.

## 3. Usuarios

| Persona | Contexto | Necesita |
| --- | --- | --- |
| **Operador** (principal) | Escritorio, pantalla grande, sesión larga | Ver estado global, leer la transcripción, emitir comandos, cortar autonomía |
| **Operador en movilidad** | Móvil, sesiones cortas | Estado de un vistazo, voz, controles tácticos rápidos |
| **Integrador de backend** | Construye el servicio jharvis | Contrato de datos claro y estable |
| **Agente de IA desarrollador** | Evoluciona este repo | Specs, invariantes y criterios verificables |

## 4. Objetivos y métricas

| ID | Objetivo | Métrica / umbral |
| --- | --- | --- |
| G1 | Legibilidad inmediata del estado | El estado del núcleo y del enlace es visible sin scroll en 1280×800 y 390×844 |
| G2 | Tiempo real sin tearing | Todos los paneles leen del mismo frame (`useSyncExternalStore`); latencia frame→pintado < 100 ms |
| G3 | Primer pintado rápido | Telemetría pinta antes de cargar three.js (chunk separado, LCP < 2.5 s en 4G) |
| G4 | Control seguro | Acciones destructivas (kill switch) requieren confirmación en 2 pasos |
| G5 | Fallo visible, no silencioso | Con backend caído la UI muestra `LINK LOST` en < 1 ciclo de poll |
| G6 | Backend intercambiable | Conectar un backend nuevo = reescribir solo `toSnapshot` |

## 5. Alcance

### Incluido (v0.x)

- Pantalla **Command Center** (`/`) — ver [spec](../specs/command-center.md).
- Pantalla **Reactor HUD** (`/hud`) — ver [spec](../specs/reactor-hud.md).
- Fuente **mock** animada y adaptador **jharvis** (HTTP poll + WebSocket).
- Comandos de operador: texto libre, cambio de modo, energía, sistemas tácticos.
- Despliegue estático en Vercel (SPA con rewrites).

### Fuera de alcance (por ahora)

- Autenticación/autorización del operador (se asume red de confianza).
- Persistencia de historial más allá de lo que envía el backend.
- Entrada de voz real (el botón existe; captura de audio no).
- Navegación real entre secciones del SideNav/TabBar (hoy son estado local).
- i18n configurable (idioma fijado por pantalla, según diseño).

## 6. Requisitos funcionales de alto nivel

| ID | Requisito |
| --- | --- |
| FR-1 | La app consume un `JharvisSnapshot` completo por frame desde un `DataSource` |
| FR-2 | La fuente se elige por entorno (`VITE_JHARVIS_SOURCE`, `VITE_JHARVIS_URL`, `VITE_JHARVIS_WS`, `VITE_JHARVIS_GRAPHQL`) |
| FR-3 | El operador puede enviar comandos de texto (`POST /command`) |
| FR-4 | El operador puede pasar a `SUPERVISED` desde el TopBar y el kill switch |
| FR-5 | El operador puede redistribuir energía y armar/desarmar sistemas tácticos |
| FR-6 | Estados de enlace `connecting/live/error` visibles en ambas pantallas |
| FR-7 | Las escenas 3D reaccionan al puntero y se pausan fuera de viewport |

## 7. Requisitos no funcionales

- **Rendimiento:** 60 fps en el núcleo 3D en hardware medio; loop detenido fuera de vista.
- **Accesibilidad:** `prefers-reduced-motion` → frame estático; contraste AA en texto de cuerpo; controles operables por teclado.
- **Resiliencia:** reconexión automática del WebSocket; datos parciales del backend no rompen la UI (merge sobre seed).
- **Mantenibilidad:** typecheck + lint + tests verdes como puerta de merge.

## 8. Roadmap

| Hito | Contenido | Estado |
| --- | --- | --- |
| M0 | Port de Stitch a React, mock, dos pantallas, tests base | ✅ |
| M1 | Contrato de backend estable + validación de payload + controles en el adaptador jharvis | 🔲 ver [backlog](../specs/backlog.md) |
| M2 | Feedback de comandos (ack/errores), historial de transcripción paginado | 🔲 |
| M3 | Entrada de voz real (Web Speech / streaming a backend) | 🔲 |
| M4 | Auth del operador y auditoría de acciones críticas | 🔲 |

## 9. Riesgos y preguntas abiertas

- **R1 — Controles silenciosos contra backend real.** El adaptador jharvis no
  implementa `setMode/setEnergy/setTactical`: el kill switch no hace nada en
  producción. Prioridad alta (ver backlog `BL-01`).
- **R2 — Payload sin validar.** `toSnapshot` hace merge superficial; un campo
  con tipo erróneo llega a los componentes.
- **P1** ¿El backend emitirá snapshots completos o deltas? (afecta al adaptador)
- **P2** ¿Qué acciones requieren auditoría/firma del operador?
