import { cn } from '../../lib/cn'

export type ChipTone = 'primary' | 'success' | 'amber' | 'tertiary' | 'outline' | 'error'

const TONE: Record<ChipTone, string> = {
  primary: 'text-primary-container',
  success: 'text-success',
  amber: 'text-secondary-fixed-dim',
  tertiary: 'text-tertiary-fixed-dim',
  outline: 'text-outline',
  error: 'text-error',
}

const SOLID: Record<ChipTone, string> = {
  primary: 'bg-primary-container text-on-primary',
  success: 'bg-success text-on-success',
  amber: 'bg-secondary-container text-on-secondary',
  tertiary: 'bg-tertiary-container text-on-tertiary',
  outline: 'bg-surface-container-highest text-on-surface-variant',
  error: 'bg-error-container text-on-error-container',
}

interface StatChipProps {
  children: React.ReactNode
  tone?: ChipTone
  /** Filled pill instead of bare text on a subtle plate. */
  solid?: boolean
  rounded?: boolean
  className?: string
}

export function StatChip({ children, tone = 'primary', solid = false, rounded = false, className }: StatChipProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-space-2xs px-1.5 py-0.5 font-label-sm text-label-sm font-bold uppercase',
        solid ? SOLID[tone] : cn('bg-surface-container-highest', TONE[tone]),
        rounded && 'rounded',
        className,
      )}
    >
      {children}
    </span>
  )
}
