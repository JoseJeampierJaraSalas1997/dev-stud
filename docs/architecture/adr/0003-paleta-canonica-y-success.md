# ADR-0003 — Paleta canónica del design system y rol `success`

- **Estado:** aceptado
- **Fecha:** 2026-09-02

## Contexto

El export de la pantalla desktop de Stitch usaba una paleta antigua (`#00a8ff`,
Space Mono), distinta del design system del proyecto (cian `#00f0ff`, Space
Grotesk). Además los mockups pintan estados OK en verde, pero el design system
solo define ámbar (crítico) y no tiene rol de éxito.

## Decisión

1. Manda el design system: cian `#00f0ff`, Space Grotesk + JetBrains Mono.
2. Se añade el rol `--color-success: #00ffaa` (+ `success-dim`, `on-success`).

## Consecuencias

- Positivas: una sola paleta coherente; semántica ámbar = crítico se preserva.
- Negativas: la pantalla desktop difiere levemente del PNG exportado.
- Obliga a: usar `success` solo para estados correctos, nunca decorativo; si se
  regenera diseño en Stitch, subir `docs/design/DESIGN.md` para alinear.
