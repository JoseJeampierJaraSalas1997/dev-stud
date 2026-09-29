import type { DataSource, EnergyDistribution, JharvisSnapshot, SessionInfo, TacticalSystems } from '../types'
import { seed } from '../mock/seed'

const SET_MODE = 'mutation SetMode($mode: SessionMode!) { setMode(mode: $mode) }'
const SET_ENERGY = 'mutation SetEnergy($input: EnergyInput!) { setEnergy(input: $input) }'
const SET_TACTICAL = 'mutation SetTactical($input: TacticalInput!) { setTactical(input: $input) }'

/** Sliders fire on every pixel; one mutation per window is plenty. */
const COALESCE_MS = 250

export interface JharvisSourceOptions {
  /** Base URL of the jharvis HTTP API, e.g. "http://localhost:8080". */
  baseUrl: string
  /** Optional websocket URL for streaming frames. Falls back to polling. */
  socketUrl?: string
  /** Poll period when no socket is configured. Defaults to 2000ms. */
  pollMs?: number
  /** GraphQL endpoint for operator controls. Defaults to `{baseUrl}/graphql`. */
  graphqlUrl?: string
}

/**
 * Live adapter for a real jharvis backend.
 *
 * The contract is deliberately narrow: the backend must serve a
 * `JharvisSnapshot`-shaped document at `GET {baseUrl}/snapshot`, and may push
 * the same shape over a websocket. Everything the HUD renders flows through
 * that one document, so wiring a new backend means writing one mapper here —
 * `toSnapshot` below — and nothing else in the app changes.
 *
 * Operator controls go the other way as GraphQL mutations (ADR-0004). They are
 * applied optimistically; the next backend frame is authoritative.
 *
 * Until the endpoint exists this source reports `status: 'error'` and serves
 * the design's reference frame, which makes the HUD render "LINK LOST" rather
 * than a wall of empty panels.
 */
export function createJharvisSource(options: JharvisSourceOptions): DataSource {
  const { baseUrl, socketUrl, pollMs = 2000 } = options
  const apiUrl = baseUrl.replace(/\/$/, '')
  const graphqlUrl = options.graphqlUrl ?? `${apiUrl}/graphql`

  let snapshot: JharvisSnapshot = { ...structuredClone(seed), status: 'connecting' }
  const listeners = new Set<() => void>()
  let timer: ReturnType<typeof setInterval> | undefined
  let socket: WebSocket | undefined
  let disposed = false

  function emit() {
    for (const listener of listeners) listener()
  }

  function publish(next: JharvisSnapshot) {
    snapshot = next
    emit()
  }

  function fail() {
    if (snapshot.status === 'error') return
    publish({ ...snapshot, status: 'error' })
  }

  /**
   * Map a raw backend payload onto the HUD's snapshot shape.
   *
   * Replace the body with real field mapping once the jharvis response schema
   * is fixed. The merge-over-seed default means a partial backend still lights
   * up the panels it does cover.
   */
  function toSnapshot(payload: unknown): JharvisSnapshot {
    if (!payload || typeof payload !== 'object') throw new Error('empty payload')
    return { ...structuredClone(seed), ...(payload as Partial<JharvisSnapshot>), status: 'live' }
  }

  async function poll() {
    if (disposed) return
    try {
      const response = await fetch(`${apiUrl}/snapshot`, {
        headers: { accept: 'application/json' },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      publish(toSnapshot(await response.json()))
    } catch {
      fail()
    }
  }

  function connect() {
    if (!socketUrl) {
      void poll()
      timer = setInterval(() => void poll(), pollMs)
      return
    }

    try {
      socket = new WebSocket(socketUrl)
      socket.addEventListener('message', (event) => {
        try {
          publish(toSnapshot(JSON.parse(String(event.data))))
        } catch {
          fail()
        }
      })
      socket.addEventListener('error', fail)
      socket.addEventListener('close', () => {
        fail()
        // Retry on a fixed backoff; a HUD that never reconnects is useless.
        if (!disposed) setTimeout(connect, 4000)
      })
    } catch {
      fail()
    }
  }

  /**
   * GraphQL answers 200 even when a mutation is rejected, so success means an
   * ok response, no `errors`, and a `true` result for the field.
   */
  async function mutate(field: string, query: string, variables: Record<string, unknown>) {
    if (disposed) return
    try {
      const response = await fetch(graphqlUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query, variables }),
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const body = (await response.json()) as { data?: Record<string, unknown>; errors?: unknown[] }
      if (body.errors?.length || body.data?.[field] !== true) throw new Error(`${field} rejected`)
    } catch {
      fail()
    }
  }

  /** Trailing coalescer: merges partials and sends the latest once per window. */
  function coalesced<T extends object>(send: (pending: Partial<T>) => void) {
    let pending: Partial<T> = {}
    let timer: ReturnType<typeof setTimeout> | undefined
    return {
      push(next: Partial<T>) {
        pending = { ...pending, ...next }
        if (timer) return
        timer = setTimeout(() => {
          const batch = pending
          pending = {}
          timer = undefined
          send(batch)
        }, COALESCE_MS)
      },
      cancel() {
        clearTimeout(timer)
        timer = undefined
        pending = {}
      },
    }
  }

  const energyQueue = coalesced<EnergyDistribution>((input) => void mutate('setEnergy', SET_ENERGY, { input }))
  const tacticalQueue = coalesced<TacticalSystems>((input) => void mutate('setTactical', SET_TACTICAL, { input }))

  connect()

  return {
    name: 'jharvis',

    getSnapshot: () => snapshot,

    subscribe(onChange) {
      listeners.add(onChange)
      return () => {
        listeners.delete(onChange)
      }
    },

    setMode(mode: SessionInfo['mode']) {
      publish({ ...snapshot, session: { ...snapshot.session, mode } })
      // Never coalesced: this carries the kill switch.
      void mutate('setMode', SET_MODE, { mode })
    },

    setEnergy(next: Partial<EnergyDistribution>) {
      publish({ ...snapshot, energy: { ...snapshot.energy, ...next } })
      energyQueue.push(next)
    },

    setTactical(next: Partial<TacticalSystems>) {
      publish({ ...snapshot, tactical: { ...snapshot.tactical, ...next } })
      tacticalQueue.push(next)
    },

    submitCommand(text: string) {
      void fetch(`${apiUrl}/command`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      }).catch(fail)
    },

    dispose() {
      disposed = true
      clearInterval(timer)
      energyQueue.cancel()
      tacticalQueue.cancel()
      socket?.close()
      listeners.clear()
    },
  }
}
