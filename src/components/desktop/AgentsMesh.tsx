import type { ReactNode } from 'react'
import { Icon, Panel, StatChip } from '../hud'
import { useAgents } from '../../data/hooks'
import type { AgentState } from '../../data/types'
import type { ChipTone } from '../hud/StatChip'

const STATE_TONE: Record<AgentState, ChipTone> = {
  THINKING: 'tertiary',
  EXECUTING: 'primary',
  WAITING: 'amber',
  IDLE: 'outline',
}

const ICON_TONE: Record<AgentState, string> = {
  THINKING: 'text-tertiary-fixed-dim',
  EXECUTING: 'text-primary-container',
  WAITING: 'text-secondary-fixed-dim',
  IDLE: 'text-outline',
}

export function AgentsMesh({ children }: { children?: ReactNode }) {
  const agents = useAgents()
  const activeCount = agents.filter((agent) => agent.state !== 'IDLE').length

  return (
    <Panel
      title="AGENTS_MESH"
      moduleId={`[${activeCount} ACTIVE]`}
      status="DISTRIBUTED"
      statusTone="success"
      className="flex flex-1 flex-col"
      bodyClassName="flex flex-1 flex-col"
    >
      <div className="flex flex-col gap-1 overflow-y-auto">
        {agents.map((agent) => (
          <div key={agent.id} className="flex items-center justify-between bg-surface-container-low p-pad-xs">
            <div className="flex min-w-0 items-center gap-pad-xs">
              <Icon name={agent.icon} size={16} className={ICON_TONE[agent.state]} />
              <div className="flex min-w-0 flex-col">
                <span className="truncate font-label-lg text-label-lg text-on-surface">{agent.name}</span>
                <span className="truncate font-label-sm text-label-sm text-outline">{agent.task}</span>
              </div>
            </div>
            <StatChip tone={STATE_TONE[agent.state]}>{agent.state}</StatChip>
          </div>
        ))}
      </div>

      {children}
    </Panel>
  )
}
