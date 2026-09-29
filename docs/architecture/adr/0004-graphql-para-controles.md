# ADR-0004 — Enviar los controles del operador como mutaciones GraphQL

- **Estado:** aceptado
- **Fecha:** 2026-09-28

## Contexto

BL-01 exige que `setMode`, `setEnergy` y `setTactical` lleguen al backend
jharvis. El contrato v0 (`docs/specs/data-contract.md` §1) proponía un endpoint
REST por control (`/mode`, `/energy`, `/tactical`), pero el backend aún no los
expone, así que la forma estaba abierta. El dueño del producto eligió GraphQL.

Opciones consideradas:

1. REST, un endpoint por control. Simple, pero cada control nuevo añade una ruta
   y su forma solo queda documentada en prosa.
2. REST, un único `POST /control {kind, payload}`. Un solo punto, sin tipado.
3. **GraphQL, un único `POST /graphql` con mutaciones tipadas.** El esquema es
   el contrato: nombres, enums y campos escribibles quedan declarados y el
   servidor rechaza lo que no encaje.

## Decisión

Los controles del operador se envían como mutaciones GraphQL a un único
endpoint (`POST {URL}/graphql` por defecto, configurable con
`VITE_JHARVIS_GRAPHQL`), con `fetch` y el cuerpo estándar `{ query, variables }`.
**Sin cliente GraphQL como dependencia**: son tres mutaciones fijas y el bundle
ya carga three.js.

La lectura (`GET /snapshot`, WebSocket) y `POST /command` **no cambian** en esta
decisión. Migrar la lectura a queries/subscriptions GraphQL se valorará en un
ADR aparte, si el backend lo ofrece.

## Consecuencias

- Positivas: un solo endpoint de escritura; esquema tipado y versionable; añadir
  un control es añadir una mutación, no una ruta; los campos escribibles quedan
  explícitos en los `input`.
- Negativas / costes: conviven dos estilos de transporte (REST para leer,
  GraphQL para escribir) hasta que se decida la lectura. GraphQL responde `200`
  con `errors`, así que un status HTTP correcto no basta para dar un envío por
  bueno.
- Qué obliga a hacer a partir de ahora: el esquema de mutaciones vive en
  `data-contract.md` §1 y todo control nuevo se añade ahí como mutación (sigue
  aplicando la invariante 4 de `CLAUDE.md`). El adaptador trata como fallo un
  `errors` no vacío o un resultado distinto de `true`.
