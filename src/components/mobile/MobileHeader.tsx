import { Link } from 'react-router-dom'
import { Icon, StatusDot } from '../hud'
import { useLinkStatus, useMobileStatus } from '../../data/hooks'

export function MobileHeader() {
  const mobile = useMobileStatus()
  const status = useLinkStatus()
  const degraded = status !== 'live'

  return (
    <header className="fixed top-0 z-50 w-full bg-surface-container-lowest/85 pt-safe shadow-[0_1px_12px_rgba(0,240,255,0.08)] backdrop-blur-xl">
      <div className="flex h-20 flex-col justify-center px-space-base">
        <div className="flex items-center justify-between gap-space-xs">
          <div className="flex items-center gap-space-sm">
            <div className="flex h-5 w-5 animate-pulse items-center justify-center text-primary-container">
              <Icon name="shield_with_heart" size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm text-primary-fixed-dim uppercase">
                STARK OS v42.8 // J.A.R.V.I.S.
              </span>
              <div className="flex items-center gap-space-xs">
                <StatusDot tone={degraded ? 'error' : 'primary'} />
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                  {degraded ? 'ENLACE PERDIDO // REINTENTANDO' : `SECURE LINK: ${mobile.secureLink}`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-space-md">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-space-2xs text-secondary-fixed">
                <span className="font-label-sm text-label-sm font-bold">{Math.round(mobile.batteryPct)}%</span>
                <Icon name="bolt" size={14} />
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{mobile.countdown}</span>
            </div>
            <Link
              to="/"
              title="Abrir Command Center"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-primary"
            >
              <Icon name="person" size={18} className="text-on-primary" />
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-between pt-space-xs">
          <div className="flex items-center gap-space-xs">
            <Icon name="terminal" size={14} className="text-primary-container" />
            <h1 className="font-headline-sm text-headline-sm text-primary uppercase tracking-wide">Reactor</h1>
          </div>
          <span className="rounded bg-surface-container-high px-space-xs py-space-2xs font-label-sm text-label-sm text-primary-fixed-dim">
            SYS.ACTIVE
          </span>
        </div>
      </div>
    </header>
  )
}
