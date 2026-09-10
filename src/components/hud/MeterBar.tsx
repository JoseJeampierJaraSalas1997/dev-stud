import { cn } from '../../lib/cn'
import { clampPct } from '../../lib/clampPct'

export type MeterTone = 'primary' | 'cyan-dim' | 'amber' | 'success' | 'pale' | 'error'

const TONE: Record<MeterTone, string> = {
  primary: 'bg-primary-container',
  'cyan-dim': 'bg-primary-fixed-dim',
  amber: 'bg-secondary-fixed-dim',
  success: 'bg-success',
  pale: 'bg-primary',
  error: 'bg-error',
}

interface MeterBarProps {
  pct: number
  tone?: MeterTone
  /** Track thickness in px. */
  height?: number
  rounded?: boolean
  className?: string
  label?: string
}

export function MeterBar({ pct, tone = 'primary', height = 4, rounded = false, className, label }: MeterBarProps) {
  const clamped = clampPct(pct)
  return (
    <div
      role="meter"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('w-full overflow-hidden bg-surface-container', rounded && 'rounded-full', className)}
      style={{ height: `${height}px` }}
    >
      <div
        className={cn('h-full transition-[width] duration-700 ease-out', TONE[tone], rounded && 'rounded-full')}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
