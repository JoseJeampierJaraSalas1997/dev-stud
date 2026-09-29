# Spec — Arc Reactor HUD (`/hud`)

| Campo | Valor |
| --- | --- |
| Estado | Implementado (M0) |
| Ruta | `src/routes/ReactorHud.tsx` |
| Diseño | Stitch: *J.A.R.V.I.S. Arc Reactor HUD 3D* |
| Idioma UI | Español |
| Viewport objetivo | 390 px (mobile-first); en pantallas anchas se centra en `max-w-md` |

## Objetivo

Consola táctica de bolsillo: estado del reactor, voz y controles rápidos con el
pulgar. Sesiones cortas, lectura de un vistazo.

## Layout (de arriba a abajo)

1. `MobileHeader` (fijo) — batería, auth, enlace seguro / `ENLACE PERDIDO`.
2. `StatusMarquee` — cuenta atrás y estado en marquesina.
3. `ReactorStage` (3D, lazy, 420 px) — reactor + potencia, eficiencia, temp, flujo.
4. `VoiceModule` — estado del núcleo + última transcripción.
5. `TacticalControls` — repulsores (slider), unibeam, barrera (toggle), y
   `EnergyDistribution` (propulsión / armamento / soporte vital).
6. `Biometrics` — pulso, presión, CO₂, adrenalina, integridad del chasis.
7. `TabBar` (fijo) — navegación (estado local).

## Inventario

| Componente | Hook(s) | Interacción |
| --- | --- | --- |
| `MobileHeader` | `useMobileStatus`, `useLinkStatus` | — |
| `StatusMarquee` | `useMobileStatus` | — |
| `ReactorStage` | `useReactor` | Parallax táctil |
| `VoiceModule` | `useCoreReadout`, `useTranscript` | — |
| `TacticalControls` | `useTactical`, `useDataSource` | Slider repulsores → `setTactical({repulsorPowerPct})`; barrera → `setTactical({shieldDeployed})` |
| `EnergyDistribution` | `useEnergy`, `useDataSource` | 3 sliders → `setEnergy({[canal]})`, límites por canal del mockup |
| `Biometrics` | `useBiometrics` | — |
| `TabBar` | — | Tab activo (estado local) |

## Criterios de aceptación

- **RH-01** En 390×844 no hay scroll horizontal; header y tab bar no tapan contenido (`pt-20 pb-20`).
- **RH-02** Mientras carga three.js se ve `INICIALIZANDO REACTOR MK-85`.
- **RH-03** Con `status !== 'live'` el header muestra `ENLACE PERDIDO // REINTENTANDO`.
- **RH-04** Cada slider tiene `<label htmlFor>` asociado y muestra su valor en %.
- **RH-05** El toggle de barrera refleja `shieldDeployed` con `aria-pressed` y cambia su texto (`DESPLIEGUE INSTANTÁNEO DE BARRERA` ↔ `BARRERA DESPLEGADA`).
- **RH-06** Mover un slider de energía llama `setEnergy` con solo el canal modificado.
- **RH-07** El deep link `/hud` funciona en producción (rewrite de Vercel).
- **RH-08** Objetivos táctiles ≥ 44 px en controles primarios.

## Pendiente

Ver `BL-01`, `BL-02`, `BL-04`, `BL-07` en [backlog](backlog.md).
