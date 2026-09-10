import { cn } from '../../lib/cn'

export type DotTone = 'primary' | 'success' | 'amber' | 'error' | 'muted'

const TONE: Record<DotTone, string> = {
  primary: 'bg-primary-container',
  success: 'bg-success',
  amber: 'bg-secondary-container',
  error: 'bg-error',
  muted: 'bg-outline',
}

interface StatusDotProps {
  tone?: DotTone
  /** Emit the expanding radar ring. */
  ping?: boolean
  /** Square markers read as system state; round ones as live signals. */
  square?: boolean
  className?: string
}

export function StatusDot({ tone = 'primary', ping = true, square = false, className }: StatusDotProps) {
  return (
    <span className={cn('relative inline-flex h-2 w-2 shrink-0', className)} aria-hidden="true">
      {ping && (
        <span
          className={cn('absolute inset-0 animate-radar opacity-70', TONE[tone], square ? '' : 'rounded-full')}
        />
      )}
      <span className={cn('relative inline-flex h-full w-full', TONE[tone], square ? '' : 'rounded-full')} />
    </span>
  )
}
