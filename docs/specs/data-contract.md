# Spec — Contrato de datos HUD ↔ backend jharvis

| Campo | Valor |
| --- | --- |
| Estado | v0 implementado (lectura + comando + controles GraphQL, ADR-0004) |
| Fuente de verdad | `src/data/types.ts` — si este doc diverge, manda el código |
| Adaptador | `src/data/jharvis/jharvisSource.ts` |

## 1. Transporte

| Canal | Método | Uso | Estado |
| --- | --- | --- | --- |
| `GET {URL}/snapshot` | HTTP poll cada 2 s | Frame completo | ✅ |
| `{WS}` | WebSocket, mensajes JSON | Mismo frame, push | ✅ reconexión fija 4 s |
| `POST {URL}/command` | `{ "text": string }` | Orden de texto libre | ✅ sin ack |
| `POST {GRAPHQL_URL}` | GraphQL `{ query, variables }` | Controles del operador: mutaciones `setMode`, `setEnergy`, `setTactical` | ✅ cliente (BL-01); `setEnergy`/`setTactical` agrupados cada 250 ms |

`GRAPHQL_URL` = `VITE_JHARVIS_GRAPHQL` si está definido; si no, `{URL}/graphql`.

### Mutaciones de control

```graphql
enum SessionMode { AUTONOMOUS SUPERVISED }
input EnergyInput { propulsion: Float, armament: Float, lifeSupport: Float, mode: String }
input TacticalInput { repulsorPowerPct: Float, unibeamChargePct: Float, shieldIntegrityPct: Float, shieldDeployed: Boolean }

type Mutation {
  setMode(mode: SessionMode!): Boolean!
  setEnergy(input: EnergyInput!): Boolean!
  setTactical(input: TacticalInput!): Boolean!
}
```

Éxito = `{"data":{"<mutación>":true}}`. Cualquier otra cosa (no-2xx, `errors`,
`false`) es fallo. El estado autoritativo llega en el siguiente frame. Detalle
en `docs/specs/controles-backend.md`.

Todas las respuestas en `application/json`. El backend debe permitir CORS
desde el origen del HUD.

## 2. Frame: `JharvisSnapshot`

Documento completo. El adaptador hace merge **superficial** sobre el `seed`, así
que un backend parcial ilumina solo las claves de primer nivel que envía.
`status` lo fija el cliente (`live` al recibir, `error` al fallar); el backend
no debe enviarlo.

| Clave | Tipo | Consumido por |
| --- | --- | --- |
| `session` | `SessionInfo` | TopBar, SideNav, CommandBar |
| `hardware` | `HardwareTelemetry` | HardwareTelem |
| `threads` | `ThreadMap` | ThreadMap |
| `core` | `CoreReadout` | CoreViewport, StateBar, NeuralTranscript, TopBar, CommandBar, VoiceModule |
| `transcript` | `TranscriptEntry[]` | NeuralTranscript, VoiceModule |
| `mission` | `Mission` | MissionCard |
| `agents` | `Agent[]` | AgentsMesh |
| `context` | `WorkingContext` | WorkingContext |
| `timeline` | `TimelineEvent[]` | EventTimeline |
| `reactor` | `ReactorTelemetry` | ReactorStage |
| `biometrics` | `Biometrics` | Biometrics |
| `energy` | `EnergyDistribution` | EnergyDistribution |
| `tactical` | `TacticalSystems` | TacticalControls |
| `mobile` | `MobileStatus` | MobileHeader, StatusMarquee |

### Enumeraciones

- `CoreState`: `IDLE | LISTENING | THINKING | EXECUTING | SPEAKING`
- `AgentState`: `IDLE | THINKING | EXECUTING | WAITING`
- `SessionInfo.mode`: `AUTONOMOUS | SUPERVISED`
- `TranscriptEntry.speaker`: `user | jharvis`

### Reglas de valores

| Regla | Detalle |
| --- | --- |
| DC-01 | Porcentajes (`*Pct`, `pct`) en `0..100`; la UI recorta con `clampPct` pero el backend no debe depender de ello |
| DC-02 | `threads.samples` y `core.spectrum` normalizados `0..1`, más antiguo primero |
| DC-03 | IDs (`id`) estables entre frames: React los usa como `key` |
| DC-04 | Textos ya formateados para mostrar (`annotation`, `chrono`, `clock`, `utc`) — la UI no reformatea |
| DC-05 | `Agent.icon` es un nombre de glifo de Material Symbols |
| DC-06 | `transcript` ordenado cronológicamente; la UI muestra los últimos N |
| DC-07 | `NaN`/`Infinity` prohibidos en campos numéricos |

## 3. Ejemplo mínimo

```json
{
  "core": { "state": "THINKING", "azimuthDeg": 12, "polarDeg": 40, "confidencePct": 91,
            "neuralRes": "4.2 TFLOP", "synthesizer": "VOX-7", "spectrum": [0.2, 0.6, 0.4] },
  "session": { "mode": "AUTONOMOUS", "agentsOnline": 6, "agentsTotal": 6, "latencyMs": 14 }
}
```

(Parcial válido: las demás claves toman valores del seed.)

## 4. Errores y estados

| Situación | Comportamiento del cliente |
| --- | --- |
| HTTP no-2xx, red caída, JSON inválido | `status: 'error'`, se conserva el último frame, se reintenta |
| WS `close` | `status: 'error'`, reconexión cada 4 s |
| `POST /command` falla | `status: 'error'` (no hay feedback por comando todavía) |
| Mutación de control falla (no-2xx, `errors`, resultado ≠ `true`) | `status: 'error'`; el valor optimista se mantiene hasta el siguiente frame |

## 5. Criterios de aceptación

- **DC-AC-1** Dado un backend que sirve un snapshot válido, cuando el HUD
  arranca con `VITE_JHARVIS_SOURCE=jharvis`, entonces `status` pasa a `live` y
  los paneles muestran los valores del backend.
- **DC-AC-2** Dado un backend caído, entonces TopBar muestra
  `LINK LOST // RETRYING` y MobileHeader `ENLACE PERDIDO // REINTENTANDO`.
- **DC-AC-3** Dado un payload parcial, las claves ausentes muestran valores
  del seed y la app no lanza.
- **DC-AC-4** Al confirmar el kill switch se envía la
  mutación `setMode(mode: SUPERVISED)` al endpoint GraphQL.

## 6. Cambios al contrato

1. Proponer el cambio en este doc (sección 1/2) con estado 🔲.
2. Seguir el orden de la invariante 3 de `CLAUDE.md`.
3. Cambios incompatibles → versionar (`/v2/snapshot`) y registrar ADR.
