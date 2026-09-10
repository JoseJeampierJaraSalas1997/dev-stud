import { Link } from 'react-router-dom'
import { Icon, Spectrum, StatusDot } from '../hud'
import { useCoreReadout, useDataSource, useLinkStatus, useSession } from '../../data/hooks'
import { cn } from '../../lib/cn'

const CELL = 'items-center gap-pad-sm border border-outline-variant bg-surface-container-lowest px-pad-sm py-pad-xs font-label-sm text-label-sm text-on-surface-variant'

export function TopBar() {
  const session = useSession()
  const status = useLinkStatus()
  const core = useCoreReadout()
  const source = useDataSource()

  const degraded = status !== 'live'

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-14 border-b border-outline-variant bg-surface-container-lowest/95 backdrop-blur-md">
      <div className="flex h-14 w-full items-center justify-between px-pad-md font-body-sm text-body-sm">
        <div className="flex items-center gap-gutter-terminal">
          <div className="flex items-center gap-pad-xs border border-outline-variant bg-surface-container-low px-pad-sm py-pad-xs">
            <StatusDot tone={degraded ? 'error' : 'success'} square />
            <span className="font-headline-sm text-headline-sm text-primary uppercase tracking-widest">
              JHARVIS_OS//v4.2
            </span>
            <span className="font-label-sm text-label-sm text-outline-variant">[{session.node}]</span>
          </div>

          <div className={cn('hidden xl:flex', CELL)}>
            <span className="font-bold text-primary">Q-LINK:</span>
            <span className={degraded ? 'text-error' : 'text-success'}>
              {degraded ? 'LINK LOST // RETRYING' : session.qLink}
            </span>
          </div>

          <div className={cn('hidden lg:flex', CELL)}>
            <span className="font-bold text-primary">LATENCY:</span>
            <span className={degraded ? 'text-error' : 'text-success'}>
              {degraded ? '--' : `${session.latencyMs.toFixed(1)}ms`}
            </span>
          </div>

          <div className={cn('hidden 2xl:flex', CELL)}>
            <span className="font-bold text-primary">MESH:</span>
            <span className="text-on-surface">
              {session.agentsOnline}/{session.agentsTotal} AGENTS
            </span>
            <StatusDot tone="success" square ping={false} />
          </div>
        </div>

        <div className="hidden items-center gap-pad-md md:flex">
          <div className="flex items-center gap-pad-xs border border-outline-variant bg-surface-container-low px-pad-sm py-pad-xs">
            <span className="font-label-sm text-label-sm text-on-surface-variant">MODE:</span>
            <div className="flex items-center border border-outline-variant">
              {(['AUTONOMOUS', 'SUPERVISED'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => source.setMode?.(mode)}
                  aria-pressed={session.mode === mode}
                  className={cn(
                    'px-pad-xs py-[2px] font-label-sm text-label-sm uppercase transition-colors',
                    session.mode === mode
                      ? 'bg-primary-container font-bold text-on-primary'
                      : 'text-outline hover:text-on-surface',
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className={cn('hidden lg:flex', CELL)}>
            <span>AUDIO SPECTRA:</span>
            <Spectrum bars={core.spectrum.slice(0, 5)} height={12} className="w-10" />
          </div>
        </div>

        <div className="flex items-center gap-pad-sm">
          <div className="hidden flex-col pr-pad-xs text-right sm:flex">
            <span className="font-label-sm text-label-sm text-primary">UTC {session.utc}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">LOC {session.local}</span>
          </div>

          <div className="flex items-center gap-pad-xs border border-success/50 bg-success/10 px-pad-sm py-pad-xs font-label-sm text-label-sm text-success">
            <Icon name="lock" size={14} />
            <span className="hidden xl:inline">STARK-QUANTUM SEC</span>
          </div>

          <Link
            to="/hud"
            title="Abrir HUD del reactor"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary transition-colors hover:bg-primary-fixed"
          >
            <Icon name="person" size={18} className="text-on-primary" />
          </Link>
        </div>
      </div>
    </header>
  )
}
