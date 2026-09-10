import type { DataSource, JharvisSnapshot } from '../types'
import { seed } from '../mock/seed'

export interface JharvisSourceOptions {
  /** Base URL of the jharvis HTTP API, e.g. "http://localhost:8080". */
  baseUrl: string
  /** Optional websocket URL for streaming frames. Falls back to polling. */
  socketUrl?: string
  /** Poll period when no socket is configured. Defaults to 2000ms. */
  pollMs?: number
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
 * Until the endpoint exists this source reports `status: 'error'` and serves
 * the design's reference frame, which makes the HUD render "LINK LOST" rather
 * than a wall of empty panels.
 */
export function createJharvisSource(options: JharvisSourceOptions): DataSource {
  const { baseUrl, socketUrl, pollMs = 2000 } = options

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
      const response = await fetch(`${baseUrl.replace(/\/$/, '')}/snapshot`, {
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

    submitCommand(text: string) {
      void fetch(`${baseUrl.replace(/\/$/, '')}/command`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text }),
      }).catch(fail)
    },

    dispose() {
      disposed = true
      clearInterval(timer)
      socket?.close()
      listeners.clear()
    },
  }
}
