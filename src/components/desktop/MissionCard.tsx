import { MeterBar, Panel } from '../hud'
import { useMission } from '../../data/hooks'

export function MissionCard() {
  const mission = useMission()

  return (
    <Panel title="CURRENT_MISSION" status={`[${mission.priority}]`} statusTone="amber">
      <div className="bg-surface-container-low p-pad-xs">
        <p className="font-headline-sm text-headline-sm text-on-surface uppercase">{mission.title}</p>
        <div className="mt-pad-xs flex items-center justify-between font-label-sm text-label-sm text-outline">
          <span>{mission.target}</span>
          <span className="text-success">{Math.round(mission.completionPct)}% COMPLETED</span>
        </div>
        <MeterBar pct={mission.completionPct} tone="success" className="mt-1" label="Avance de la misión" />
      </div>
    </Panel>
  )
}
