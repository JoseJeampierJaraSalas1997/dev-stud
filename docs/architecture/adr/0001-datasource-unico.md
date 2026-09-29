# ADR-0001 — Un único DataSource con snapshots completos

- **Estado:** aceptado
- **Fecha:** 2026-09-02

## Contexto

El HUD tiene ~20 paneles que leen datos del mismo sistema. El backend real no
existe todavía y su forma puede cambiar. Se necesitaba desarrollar la UI
completa sin backend y poder conectarlo después sin tocar componentes.

## Decisión

Todo dato pasa por una interfaz `DataSource` (`getSnapshot`, `subscribe`,
controles opcionales) que entrega un `JharvisSnapshot` **completo e inmutable**
por frame. Hay dos implementaciones: `mockSource` y `jharvisSource`. Los
componentes consumen vía `useSyncExternalStore` con selectores.

## Consecuencias

- Positivas: sin tearing entre paneles; tests inyectan fuentes falsas; cambiar
  de backend = reescribir `toSnapshot`.
- Negativas: cada frame es un documento grande; deltas del backend deben
  fusionarse en el adaptador.
- Obliga a: añadir datos siempre por `types.ts` + seed + adaptador; los
  controles nuevos van en la interfaz y en ambas fuentes.
