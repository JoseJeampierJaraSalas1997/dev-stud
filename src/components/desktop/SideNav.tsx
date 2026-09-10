import { useState } from 'react'
import { MeterBar } from '../hud'
import { useSession } from '../../data/hooks'
import { cn } from '../../lib/cn'

/**
 * Only section 01 exists as a design; the rest are present in the mockup's
 * nav and stay selectable so the chrome behaves, without faking screens that
 * were never designed.
 */
const SECTIONS = [
  { id: 'tactical-overview', index: '01', label: 'TACTICAL OVERVIEW' },
  { id: 'autonomous-mesh', index: '02', label: 'AUTONOMOUS MESH' },
  { id: 'quantum-telemetry', index: '03', label: 'QUANTUM TELEMETRY' },
  { id: 'stark-security', index: '04', label: 'STARK SECURITY' },
  { id: 'command-execution', index: '05', label: 'EXECUTION DECK' },
] as const

export function SideNav() {
  const [active, setActive] = useState<string>(SECTIONS[0].id)
  const session = useSession()

  return (
    <aside className="fixed top-14 left-0 z-40 flex h-[calc(100vh-3.5rem)] w-64 flex-col justify-between border-r border-outline-variant bg-surface-container-lowest">
      <div className="p-pad-sm">
        <div className="mb-pad-sm flex items-center justify-between border-b border-outline-variant pb-pad-xs font-label-sm text-label-sm text-outline">
          <span className="uppercase tracking-wider">// SYSTEM BUS ARRAYS</span>
          <span>0x4F8A</span>
        </div>

        <nav className="flex flex-col gap-1">
          {SECTIONS.map((section) => {
            const isActive = section.id === active
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActive(section.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-pad-sm border border-transparent px-pad-sm py-pad-xs text-left font-label-lg text-label-lg',
                  isActive
                    ? 'bg-primary-container font-bold text-on-primary'
                    : 'text-on-surface-variant hover:border-outline-variant hover:bg-surface-container-high hover:text-on-surface',
                )}
              >
                <span className={cn('font-label-sm text-label-sm', isActive ? 'text-on-primary' : 'text-outline')}>
                  [{section.index}]
                </span>
                <span>{section.label}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <div className="border-t border-outline-variant bg-surface-container-low p-pad-sm">
        <div className="mb-pad-xs flex justify-between font-label-sm text-label-sm text-outline">
          <span>SYS_LOAD</span>
          <span>{session.sysLoadPct.toFixed(1)}%</span>
        </div>
        <MeterBar
          pct={session.sysLoadPct}
          tone="pale"
          height={4}
          label="Carga del sistema"
          className="mb-pad-sm border border-outline-variant"
        />
        <div className="flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
          <span>CORE: STABLE</span>
          <span className="text-success">NOMINAL</span>
        </div>
      </div>
    </aside>
  )
}
