/** Connection health of whichever source is feeding the HUD. */
export type LinkStatus = 'connecting' | 'live' | 'error'

/** The operational state machine JHARVIS reports for itself. */
export type CoreState = 'IDLE' | 'LISTENING' | 'THINKING' | 'EXECUTING' | 'SPEAKING'

/** Per-agent state inside the autonomous mesh. */
export type AgentState = 'IDLE' | 'THINKING' | 'EXECUTING' | 'WAITING'

/** A named resource with a percentage bar and two detail readouts. */
export interface ResourceGauge {
  id: string
  label: string
  pct: number
  /** Formatted headline value shown next to the percentage, e.g. "@ 5.8 GHz". */
  annotation: string
  detailLeft: string
  detailRight: string
}

export interface HardwareTelemetry {
  gauges: ResourceGauge[]
  mesh: {
    throughputMbs: number
    pingMs: number
    packetDropPct: number
  }
  storage: {
    usedPb: number
    totalPb: number
  }
  coolant: {
    kelvin: number
    celsius: number
  }
  uptime: {
    days: number
    clock: string
  }
}

export interface ClusterNode {
  id: string
  label: string
  online: boolean
  latencyMs: number
}

export interface ThreadMap {
  bank: string
  topology: string
  /** Normalised 0..1 samples, oldest first. Rendered as the sparkline. */
  samples: number[]
  clusters: ClusterNode[]
  digest: string
  policy: string
}

export interface Agent {
  id: string
  name: string
  task: string
  state: AgentState
  /** Material Symbols glyph name. */
  icon: string
}

export interface Mission {
  title: string
  target: string
  completionPct: number
  priority: string
}

export interface TranscriptEntry {
  id: string
  speaker: 'user' | 'jharvis'
  /** Channel or subsystem label, e.g. "VOX_01" or "NEURAL_RES". */
  channel: string
  chrono: string
  text: string
  /** Right-aligned status on the entry header. */
  status: string
  /** Optional footer facts (query cost, index strategy, routing). */
  facts?: string[]
}

export interface TimelineEvent {
  id: string
  time: string
  label: string
  /** The in-progress event renders in the success tone. */
  active?: boolean
}

export interface CoreReadout {
  state: CoreState
  azimuthDeg: number
  polarDeg: number
  confidencePct: number
  neuralRes: string
  synthesizer: string
  /** Normalised 0..1 bars for the synth spectrum. */
  spectrum: number[]
}

export interface WorkingContext {
  activeTokens: string
  longTermKg: string
  temporalBias: string
}

export interface SessionInfo {
  node: string
  qLink: string
  latencyMs: number
  agentsOnline: number
  agentsTotal: number
  mode: 'AUTONOMOUS' | 'SUPERVISED'
  encryption: string
  sessionId: string
  securityPolicy: string
  sysLoadPct: number
  utc: string
  local: string
}

/** Arc-reactor tiles on the mobile HUD. */
export interface ReactorTelemetry {
  powerOutputGjs: number
  collectorEfficiencyPct: number
  coreTempK: number
  magneticFluxTesla: number
  markLabel: string
  online: boolean
}

export interface Biometrics {
  heartRateBpm: number
  internalPressureAtm: number
  co2Pct: number
  adrenalineNgDl: number
  chassisIntegrityPct: number
  subject: string
}

export interface EnergyDistribution {
  propulsion: number
  armament: number
  lifeSupport: number
  mode: string
}

export interface TacticalSystems {
  repulsorPowerPct: number
  unibeamChargePct: number
  shieldIntegrityPct: number
  shieldDeployed: boolean
}

export interface MobileStatus {
  batteryPct: number
  countdown: string
  authLevel: string
  secureLink: string
}

/**
 * One immutable frame of everything the HUD renders. Sources hand these out
 * whole so components never observe a half-updated system.
 */
export interface JharvisSnapshot {
  status: LinkStatus
  session: SessionInfo
  hardware: HardwareTelemetry
  threads: ThreadMap
  core: CoreReadout
  transcript: TranscriptEntry[]
  mission: Mission
  agents: Agent[]
  context: WorkingContext
  timeline: TimelineEvent[]
  reactor: ReactorTelemetry
  biometrics: Biometrics
  energy: EnergyDistribution
  tactical: TacticalSystems
  mobile: MobileStatus
}

/**
 * The adapter seam. Swapping the mock for a real jharvis feed means providing
 * another object with this shape — no component changes.
 */
export interface DataSource {
  readonly name: string
  getSnapshot(): JharvisSnapshot
  /** Register for change notifications; returns the unsubscribe function. */
  subscribe(onChange: () => void): () => void
  /** Optional imperative controls the HUD exposes back to the source. */
  setEnergy?(next: Partial<EnergyDistribution>): void
  setTactical?(next: Partial<TacticalSystems>): void
  setMode?(mode: SessionInfo['mode']): void
  submitCommand?(text: string): void
  dispose(): void
}
