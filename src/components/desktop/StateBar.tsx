import { Spectrum } from '../hud'
import { useCoreReadout } from '../../data/hooks'
import type { CoreState } from '../../data/types'
import { cn } from '../../lib/cn'

const STATES: CoreState[] = ['IDLE', 'LISTENING', 'THINKING', 'EXECUTING', 'SPEAKING']

/** The core's state machine, rendered as a row of latched indicators. */
export function StateBar() {
  const core = useCoreReadout()

  return (
    <div className="flex flex-col gap-pad-xs bg-surface-container-lowest p-pad-sm shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          {STATES.map((state) => {
            const isActive = core.state === state
            return (
              <span
                key={state}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'px-pad-sm py-pad-xs font-label-sm text-label-sm transition-colors',
                  isActive
                    ? 'bg-primary-container font-bold text-on-primary'
                    : state === 'SPEAKING'
                      ? 'bg-surface-container-low text-success'
                      : 'bg-surface-container-low text-outline',
                )}
              >
                {state}
              </span>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-label-sm text-label-sm text-outline">SYNTH_WAVE:</span>
          <Spectrum bars={core.spectrum} height={16} className="w-32 bg-surface-container-low px-1 py-[2px]" />
        </div>
      </div>
    </div>
  )
}
