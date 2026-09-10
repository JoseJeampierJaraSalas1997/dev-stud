import { Icon, StatusDot } from '../hud'
import { useMobileStatus } from '../../data/hooks'

export function StatusMarquee() {
  const mobile = useMobileStatus()

  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-container-low/80 px-space-base py-space-sm shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-space-xs">
        <StatusDot tone="primary" />
        <span className="font-label-sm text-label-sm text-primary uppercase">JARVIS.AI // NÚCLEO ACTIVO</span>
      </div>
      <div className="flex items-center gap-space-xs rounded-full bg-surface-container-highest/60 px-space-sm py-space-2xs">
        <Icon name="verified_user" size={14} className="text-secondary-fixed" />
        <span className="font-label-sm text-label-sm font-semibold tracking-wider text-secondary-fixed">
          {mobile.authLevel}
        </span>
      </div>
    </div>
  )
}
