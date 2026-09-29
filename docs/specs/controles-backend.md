# Spec — Controles del operador contra el backend real

| Campo | Valor |
| --- | --- |
| Estado | implementado |
| ID | BL-01 |
| Autor | Claude (agente) — pendiente de revisión humana |
| Fecha | 2026-09-28 |
| Relacionado | backlog BL-01 (P0), BL-03, `data-contract.md` §1 y DC-AC-4, ADR-0001, ADR-0004 |

## 1. Contexto

Con `VITE_JHARVIS_SOURCE=jharvis` el HUD usa `createJharvisSource`
(`src/data/jharvis/jharvisSource.ts:26`), que solo implementa `submitCommand`
(`jharvisSource.ts:115`). La interfaz `DataSource` declara además `setEnergy`,
`setTactical` y `setMode` como opcionales (`src/data/types.ts:200-202`), y los
componentes los llaman con `?.`, así que contra el backend real **no pasa nada y
no hay error visible**:

| Control | Llamada | Efecto hoy con backend real |
| --- | --- | --- |
| Kill switch (confirmado) | `src/components/desktop/CommandBar.tsx:36` → `setMode('SUPERVISED')` | Ninguno |
| Toggle de modo | `src/components/desktop/TopBar.tsx:59` → `setMode(mode)` | Ninguno |
| Sliders de energía | `src/components/mobile/EnergyDistribution.tsx:64` → `setEnergy({[k]: v})` | Ninguno |
| Slider de repulsores | `src/components/mobile/TacticalControls.tsx:68` → `setTactical({repulsorPowerPct})` | Ninguno |
| Escudo | `src/components/mobile/TacticalControls.tsx:140` → `setTactical({shieldDeployed})` | Ninguno |

El kill switch que no detiene la autonomía es un fallo de seguridad: el operador
cree haber pasado a `SUPERVISED` y el sistema sigue en `AUTONOMOUS`.

El mock sí los implementa (`src/data/mock/mockSource.ts:165-181`) aplicando un
merge superficial sobre la sección correspondiente. No existe test del adaptador
jharvis ni de `CommandBar`.

## 2. Objetivo

Que los cinco controles del HUD lleguen al backend jharvis como mutaciones
GraphQL y el operador vea el efecto al instante, o vea el enlace caído si el
envío falla.

## 3. Fuera de alcance

- Ack por control y feedback de enviado/fallo por acción (BL-03). Aquí un fallo
  usa el mismo camino que `submitCommand`: `status: 'error'`.
- Migrar la lectura (`/snapshot`, WS) o `/command` a GraphQL (ADR-0004).
- Cliente GraphQL como dependencia (Apollo, urql, graphql-request…).
- Validación del payload entrante (BL-02) y merge profundo de frames (BL-05).
- Backoff de reconexión (BL-04).
- Cambios visuales en los componentes.
- Reintentos automáticos de un envío fallido.
- Autenticación del backend.

## 4. Requisitos

| ID | Requisito | Tipo |
| --- | --- | --- |
| R1 | `setMode(mode)` → mutación `setMode(mode: $mode)` | funcional |
| R2 | `setEnergy(partial)` → mutación `setEnergy(input: $input)` con el parcial | funcional |
| R3 | `setTactical(partial)` → mutación `setTactical(input: $input)` con el parcial | funcional |
| R4 | Todas las mutaciones van a un único endpoint: `VITE_JHARVIS_GRAPHQL` si está definido; si no, `{URL}/graphql` (sin doble `/`) | funcional |
| R5 | Actualización optimista: el snapshot local refleja el cambio antes de la respuesta, publicando un frame nuevo (sin mutar el anterior). El siguiente frame del backend manda; si el envío falla no se revierte | funcional |
| R6 | Fallo = HTTP no-2xx, error de red, JSON inválido, `errors` no vacío o `data.<mutación> !== true` → `status: 'error'` (`LINK LOST // RETRYING` / `ENLACE PERDIDO // REINTENTANDO`) | funcional |
| R7 | `setEnergy`/`setTactical` agrupan llamadas rápidas (sliders): como mucho una mutación por control cada 250 ms, con los últimos valores combinados | no funcional |
| R8 | `setMode` nunca se agrupa ni se retrasa: se envía en el acto | no funcional (seguridad) |
| R9 | Tras `dispose()` no sale ninguna mutación, incluidas las pendientes de agrupar | funcional |

## 5. Diseño

### Esquema (lado backend, propuesto)

```graphql
enum SessionMode { AUTONOMOUS SUPERVISED }

input EnergyInput {
  propulsion: Float
  armament: Float
  lifeSupport: Float
  mode: String
}

input TacticalInput {
  repulsorPowerPct: Float
  unibeamChargePct: Float
  shieldIntegrityPct: Float
  shieldDeployed: Boolean
}

type Mutation {
  setMode(mode: SessionMode!): Boolean!
  setEnergy(input: EnergyInput!): Boolean!
  setTactical(input: TacticalInput!): Boolean!
}
```

Los `input` reflejan `EnergyDistribution` y `TacticalSystems` de
`src/data/types.ts` campo a campo (todo opcional, como `Partial<…>`).
`energy.mode` es escribible desde el HUD.

### Petición (lado HUD)

```http
POST {GRAPHQL_URL}
content-type: application/json

{ "query": "mutation SetMode($mode: SessionMode!) { setMode(mode: $mode) }",
  "variables": { "mode": "SUPERVISED" } }
```

Respuesta correcta: `{ "data": { "setMode": true } }`. El resto del cuerpo se
ignora; el estado autoritativo llega en el siguiente frame (poll o WS).

### Cambios

- **Datos**: no cambia `types.ts`. Cambia el contrato: `data-contract.md` §1
  sustituye las filas REST propuestas por el endpoint GraphQL y el esquema de
  arriba; §4 gana la fila "mutación falla → `status: 'error'`". DC-AC-4 se
  reescribe en términos de la mutación.
- **Adaptador** (`jharvisSource.ts`): opción nueva `graphqlUrl` en
  `JharvisSourceOptions` (por defecto `{baseUrl}/graphql`); un helper interno
  `mutate(field, query, variables)` que aplica R6. La actualización optimista
  replica la semántica del mock (merge superficial de la sección) vía `publish`.
  El agrupado usa un temporizador por control (trailing, 250 ms) que acumula el
  parcial pendiente; `dispose()` lo cancela. Las tres queries son constantes de
  módulo.
- **Provider** (`src/data/provider.tsx`): pasa `VITE_JHARVIS_GRAPHQL` a
  `createJharvisSource`. Documentar la variable junto a las otras `VITE_*`.
- **UI**: sin cambios. Estados `connecting/live/error` ya cubiertos por TopBar y
  MobileHeader.
- **Controles**: la interfaz `DataSource` no cambia; el mock ya los implementa.

## 6. Criterios de aceptación

- **AC-1** Dado un source jharvis con `baseUrl` `http://x/` y sin `graphqlUrl`,
  cuando se llama `setMode('SUPERVISED')`, entonces sale de inmediato un único
  `POST http://x/graphql` con `content-type: application/json`, una `query` que
  contiene la mutación `setMode` y `variables` `{"mode":"SUPERVISED"}`.
- **AC-2** Dado un source jharvis, cuando se llama
  `setEnergy({ propulsion: 40, mode: 'COMBAT' })` y pasan 250 ms, entonces sale
  la mutación `setEnergy` con `variables` `{"input":{"propulsion":40,"mode":"COMBAT"}}`.
- **AC-3** Dado un source jharvis, cuando se llama
  `setTactical({ shieldDeployed: true })` y pasan 250 ms, entonces sale la
  mutación `setTactical` con `variables` `{"input":{"shieldDeployed":true}}`.
- **AC-4** Dado un source con `graphqlUrl` `http://y/gql`, cuando se llama
  cualquier control, entonces la petición va a `http://y/gql`.
- **AC-5** Dado un snapshot `live` con `session.mode = 'AUTONOMOUS'`, cuando se
  llama `setMode('SUPERVISED')`, entonces `getSnapshot().session.mode` es
  `'SUPERVISED'` sin esperar la respuesta, los suscriptores reciben aviso, y el
  snapshot anterior sigue con `'AUTONOMOUS'` (no mutado). Igual para `energy` y
  `tactical`.
- **AC-6** Dado un backend que responde 500, o `fetch` rechaza, cuando se llama
  `setMode`, entonces `status` pasa a `'error'` y `session.mode` sigue en el
  valor optimista.
- **AC-7** Dado un backend que responde `200` con
  `{"errors":[{"message":"denied"}]}` (o con `{"data":{"setMode":false}}`),
  cuando se llama `setMode`, entonces `status` pasa a `'error'`.
- **AC-8** Dadas cinco llamadas a `setEnergy` en menos de 250 ms
  (`{propulsion:10}`, `{propulsion:20}`, `{armament:5}`, `{propulsion:30}`,
  `{armament:7}`), entonces sale una sola mutación con
  `{"input":{"propulsion":30,"armament":7}}`.
- **AC-9** Dado un `setEnergy` pendiente de agrupar, cuando se llama
  `setMode('SUPERVISED')`, entonces la mutación `setMode` sale antes de que
  venza el temporizador de energía.
- **AC-10** Dado un `setTactical` pendiente de agrupar, cuando se llama
  `dispose()` y pasan 250 ms, entonces no sale ninguna mutación.
- **AC-11** Dado el HUD con un source jharvis y `fetch` simulado, cuando el
  operador pulsa el kill switch dos veces (armar + confirmar), entonces sale la
  mutación `setMode` con `{"mode":"SUPERVISED"}` (cierra DC-AC-4).

## 7. Plan de pruebas

| AC | Tipo de test | Archivo |
| --- | --- | --- |
| AC-1…AC-10 | unitario, `fetch` con `vi.fn`, timers falsos (`vi.useFakeTimers`), sin socket (modo poll) | `src/data/jharvis/jharvisSource.test.ts` (nuevo) |
| AC-11 | componente, `<JharvisProvider source={createJharvisSource(...)}>` + Testing Library | `src/components/desktop/CommandBar.test.tsx` (nuevo) |

Los tests filtran las llamadas a `GET /snapshot` del poll al contar mutaciones.

## 8. Riesgos y decisiones

Decisiones del humano (2026-09-28):

1. **Transporte**: GraphQL, mutaciones a un único endpoint, sin dependencia
   nueva (ADR-0004). La lectura sigue en REST/WS.
2. **Actualización optimista**: sí. Si el envío falla, el valor optimista se
   queda hasta el siguiente frame del backend (sin revertir).
3. **Kill switch y fallo**: para P0 basta con `LINK LOST`; el aviso propio del
   control queda para BL-03.
4. **Ventana de agrupado**: 250 ms.
5. **`energy.mode`**: el HUD puede enviarlo.

Riesgos:

- El backend jharvis todavía no expone `/graphql`; hasta que lo haga, usar un
  control con `VITE_JHARVIS_SOURCE=jharvis` pondrá el enlace en `error`. Es el
  comportamiento correcto (el operador sabe que el control no llegó), pero hay
  que coordinar el esquema con quien implemente el backend.
- Un frame del poll que llegue entre el cambio optimista y el procesamiento de
  la mutación en el backend puede devolver el valor viejo durante ≤2 s
  (parpadeo del slider). Aceptado en esta versión; BL-05/BL-03 lo pueden refinar.
- CORS: el `POST` con `content-type: application/json` dispara preflight; el
  backend debe responder a `OPTIONS` en el endpoint GraphQL.
