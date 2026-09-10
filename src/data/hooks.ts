import { useCallback, useContext, useSyncExternalStore } from 'react'
import { DataSourceContext } from './context'
import type { DataSource, JharvisSnapshot } from './types'

export function useDataSource(): DataSource {
  const source = useContext(DataSourceContext)
  if (!source) throw new Error('useDataSource must be used inside <JharvisProvider>')
  return source
}

/**
 * Subscribe to one slice of the snapshot. `useSyncExternalStore` gives us
 * tear-free reads and the exact same wiring whether the frames come from the
 * mock interval or a live websocket.
 */
export function useJharvis<T>(select: (snapshot: JharvisSnapshot) => T): T {
  const source = useDataSource()
  const subscribe = useCallback((onChange: () => void) => source.subscribe(onChange), [source])
  const getSnapshot = useCallback(() => select(source.getSnapshot()), [source, select])
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

const selectStatus = (s: JharvisSnapshot) => s.status
const selectSession = (s: JharvisSnapshot) => s.session
const selectHardware = (s: JharvisSnapshot) => s.hardware
const selectThreads = (s: JharvisSnapshot) => s.threads
const selectCore = (s: JharvisSnapshot) => s.core
const selectTranscript = (s: JharvisSnapshot) => s.transcript
const selectMission = (s: JharvisSnapshot) => s.mission
const selectAgents = (s: JharvisSnapshot) => s.agents
const selectContext = (s: JharvisSnapshot) => s.context
const selectTimeline = (s: JharvisSnapshot) => s.timeline
const selectReactor = (s: JharvisSnapshot) => s.reactor
const selectBiometrics = (s: JharvisSnapshot) => s.biometrics
const selectEnergy = (s: JharvisSnapshot) => s.energy
const selectTactical = (s: JharvisSnapshot) => s.tactical
const selectMobile = (s: JharvisSnapshot) => s.mobile

export const useLinkStatus = () => useJharvis(selectStatus)
export const useSession = () => useJharvis(selectSession)
export const useHardware = () => useJharvis(selectHardware)
export const useThreadMap = () => useJharvis(selectThreads)
export const useCoreReadout = () => useJharvis(selectCore)
export const useTranscript = () => useJharvis(selectTranscript)
export const useMission = () => useJharvis(selectMission)
export const useAgents = () => useJharvis(selectAgents)
export const useWorkingContext = () => useJharvis(selectContext)
export const useTimeline = () => useJharvis(selectTimeline)
export const useReactor = () => useJharvis(selectReactor)
export const useBiometrics = () => useJharvis(selectBiometrics)
export const useEnergy = () => useJharvis(selectEnergy)
export const useTactical = () => useJharvis(selectTactical)
export const useMobileStatus = () => useJharvis(selectMobile)
