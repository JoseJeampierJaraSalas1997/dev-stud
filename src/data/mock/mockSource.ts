import type {
  Agent,
  AgentState,
  CoreState,
  DataSource,
  EnergyDistribution,
  JharvisSnapshot,
  SessionInfo,
  TacticalSystems,
} from '../types'
import { seed } from './seed'

export interface WalkBounds {
  min: number
  max: number
  /** Maximum absolute change per tick. */
  step: number
  /** Decimal places to round to. Defaults to 2. */
  precision?: number
}

/**
 * Move `value` by a random amount up to +/-`step`, clamped into [min, max].
 * Clamping (rather than reflecting) is what keeps a long-running HUD honest:
 * a gauge can sit pinned at 100% but can never read 104%.
 */
export function walk(value: number, { min, max, step, precision = 2 }: WalkBounds): number {
  // A NaN or Infinity arriving from a feed would otherwise stick forever.
  if (!Number.isFinite(value)) return min
  const delta = (Math.random() * 2 - 1) * step
  const next = Math.min(max, Math.max(min, value + delta))
  const factor = 10 ** precision
  return Math.round(next * factor) / factor
}

const CORE_CYCLE: CoreState[] = ['EXECUTING', 'THINKING', 'SPEAKING', 'LISTENING', 'IDLE']

function formatClock(date: Date, offsetHours = 0): string {
  const shifted = new Date(date.getTime() + offsetHours * 3_600_000)
  const hh = String(shifted.getUTCHours()).padStart(2, '0')
  const mm = String(shifted.getUTCMinutes()).padStart(2, '0')
  const ss = String(shifted.getUTCSeconds()).padStart(2, '0')
  const ms = String(shifted.getUTCMilliseconds()).padStart(3, '0')
  return `${hh}:${mm}:${ss}.${ms}`
}

function rotateAgentState(agent: Agent): AgentState {
  // Keep the mesh busy. A uniform cycle drains every agent to IDLE within a
  // minute, which reads as a dead system rather than an autonomous one.
  if (agent.state === 'IDLE') return Math.random() < 0.55 ? 'THINKING' : 'IDLE'
  const roll = Math.random()
  if (roll < 0.08) return 'IDLE'
  if (roll < 0.4) return 'THINKING'
  if (roll < 0.82) return 'EXECUTING'
  return 'WAITING'
}

export interface MockSourceOptions {
  /** Tick period in ms. Defaults to 1000. */
  intervalMs?: number
  /** Start ticking immediately. Defaults to true. */
  autoStart?: boolean
}

/**
 * A self-driving simulation of the JHARVIS feed. Every number drifts inside
 * bounds taken from the design, so the HUD looks alive without a backend.
 */
export function createMockSource(options: MockSourceOptions = {}): DataSource {
  const { intervalMs = 1000, autoStart = true } = options

  let snapshot: JharvisSnapshot = structuredClone(seed)
  const listeners = new Set<() => void>()
  let timer: ReturnType<typeof setInterval> | undefined
  let pendingReply: ReturnType<typeof setTimeout> | undefined
  let tick = 0

  function emit() {
    for (const listener of listeners) listener()
  }

  /** Replace the snapshot wholesale so `useSyncExternalStore` sees a new ref. */
  function commit(mutate: (draft: JharvisSnapshot) => void) {
    const draft = structuredClone(snapshot)
    mutate(draft)
    snapshot = draft
    emit()
  }

  function advance() {
    tick += 1
    commit((s) => {
      const now = new Date()

      s.session.utc = formatClock(now)
      s.session.local = formatClock(now, -4).slice(0, 8) + ' EDT'
      s.session.latencyMs = walk(s.session.latencyMs, { min: 0.1, max: 1.4, step: 0.12 })
      s.session.sysLoadPct = walk(s.session.sysLoadPct, { min: 12, max: 92, step: 2.5, precision: 1 })

      for (const gauge of s.hardware.gauges) {
        gauge.pct = walk(gauge.pct, { min: 8, max: 98, step: 2.5, precision: 0 })
      }
      s.hardware.mesh.throughputMbs = walk(s.hardware.mesh.throughputMbs, { min: 4, max: 64, step: 1.8, precision: 1 })
      s.hardware.mesh.pingMs = s.session.latencyMs
      s.hardware.coolant.kelvin = walk(s.hardware.coolant.kelvin, { min: 13.6, max: 15.4, step: 0.08 })
      s.hardware.coolant.celsius = Math.round((s.hardware.coolant.kelvin - 273.15) * 100) / 100

      for (const cluster of s.threads.clusters) {
        cluster.latencyMs = walk(cluster.latencyMs, { min: 0.05, max: 0.95, step: 0.06 })
      }
      s.threads.samples = [...s.threads.samples.slice(1), walk(s.threads.samples.at(-1) ?? 0.5, { min: 0.05, max: 0.95, step: 0.28 })]

      s.core.azimuthDeg = walk(s.core.azimuthDeg, { min: 0, max: 359.99, step: 1.4 })
      s.core.polarDeg = walk(s.core.polarDeg, { min: -60, max: 60, step: 0.9 })
      s.core.confidencePct = walk(s.core.confidencePct, { min: 96, max: 99.99, step: 0.15 })
      s.core.spectrum = s.core.spectrum.map((bar) => walk(bar, { min: 0.1, max: 1, step: 0.45 }))
      if (tick % 7 === 0) {
        const index = CORE_CYCLE.indexOf(s.core.state)
        s.core.state = CORE_CYCLE[(index + 1) % CORE_CYCLE.length]
      }

      if (tick % 5 === 0) {
        for (const agent of s.agents) agent.state = rotateAgentState(agent)
      }
      s.session.agentsOnline = Math.max(1, s.agents.filter((a) => a.state !== 'IDLE').length * 2)

      s.mission.completionPct = walk(s.mission.completionPct, { min: 40, max: 99, step: 0.6, precision: 0 })

      s.reactor.powerOutputGjs = walk(s.reactor.powerOutputGjs, { min: 5.5, max: 9.8, step: 0.18 })
      s.reactor.collectorEfficiencyPct = walk(s.reactor.collectorEfficiencyPct, { min: 96.5, max: 99.99, step: 0.12 })
      s.reactor.coreTempK = walk(s.reactor.coreTempK, { min: 4200, max: 5400, step: 40, precision: 0 })
      s.reactor.magneticFluxTesla = walk(s.reactor.magneticFluxTesla, { min: 11.5, max: 15.8, step: 0.22 })

      s.biometrics.heartRateBpm = walk(s.biometrics.heartRateBpm, { min: 62, max: 118, step: 3, precision: 0 })
      s.biometrics.internalPressureAtm = walk(s.biometrics.internalPressureAtm, { min: 0.94, max: 1.12, step: 0.02 })
      s.biometrics.co2Pct = walk(s.biometrics.co2Pct, { min: 0.01, max: 0.09, step: 0.008, precision: 3 })
      s.biometrics.adrenalineNgDl = walk(s.biometrics.adrenalineNgDl, { min: 8, max: 46, step: 1.1 })

      s.tactical.unibeamChargePct = walk(s.tactical.unibeamChargePct, { min: 55, max: 100, step: 1.5, precision: 0 })

      s.mobile.batteryPct = walk(s.mobile.batteryPct, { min: 74, max: 100, step: 0.6, precision: 0 })
    })
  }

  function start() {
    if (timer) return
    timer = setInterval(advance, intervalMs)
  }

  if (autoStart) start()

  return {
    name: 'mock',

    getSnapshot: () => snapshot,

    subscribe(onChange) {
      listeners.add(onChange)
      start()
      return () => {
        listeners.delete(onChange)
      }
    },

    setEnergy(next: Partial<EnergyDistribution>) {
      commit((s) => {
        s.energy = { ...s.energy, ...next }
      })
    },

    setTactical(next: Partial<TacticalSystems>) {
      commit((s) => {
        s.tactical = { ...s.tactical, ...next }
      })
    },

    setMode(mode: SessionInfo['mode']) {
      commit((s) => {
        s.session.mode = mode
      })
    },

    submitCommand(text: string) {
      const trimmed = text.trim()
      if (!trimmed) return

      const chrono = new Date().toTimeString().slice(0, 8)
      commit((s) => {
        s.core.state = 'THINKING'
        s.transcript = [
          ...s.transcript.slice(-6),
          {
            id: `t-${Date.now()}`,
            speaker: 'user',
            channel: 'VOX_01',
            chrono,
            status: 'LOC_VERIFIED // SEC_AUTH',
            text: trimmed,
          },
        ]
      })

      clearTimeout(pendingReply)
      pendingReply = setTimeout(() => {
        commit((s) => {
          s.core.state = 'EXECUTING'
          s.transcript = [
            ...s.transcript,
            {
              id: `t-${Date.now()}`,
              speaker: 'jharvis',
              channel: 'NEURAL_RES',
              chrono: new Date().toTimeString().slice(0, 8),
              status: 'PROCESSED (0.42s)',
              text: `Instrucción encolada en la malla autónoma. Enrutando "${trimmed}" a los nodos disponibles y consolidando resultado.`,
              facts: ['QUERY_COST: 0.004 Q-CRED', 'INDEX: B-TREE_PARALLEL', 'ROUTED: 6 NODES'],
            },
          ]
          s.timeline = [
            ...s.timeline.slice(-4).map((event) => ({ ...event, active: false })),
            { id: `e-${Date.now()}`, time: chrono.slice(0, 5), label: 'Dispatched operator command', active: true },
          ]
        })
      }, 900)
    },

    dispose() {
      clearInterval(timer)
      clearTimeout(pendingReply)
      timer = undefined
      listeners.clear()
    },
  }
}
