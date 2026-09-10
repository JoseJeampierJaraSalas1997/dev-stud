import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { CornerBrackets } from './CornerBrackets'
import { StatusDot, type DotTone } from './StatusDot'

interface PanelProps {
  children: ReactNode
  /** Uppercase module heading, e.g. "HARDWARE_TELEM". */
  title?: string
  /** Small monospaced module id shown next to the title, e.g. "// SYS.MOD_77". */
  moduleId?: string
  /** Right-aligned status text on the header rule. */
  status?: string
  statusTone?: 'primary' | 'success' | 'amber' | 'outline'
  /** Live pulse dot in the header. */
  pulse?: DotTone
  /**
   * `terminal` is the dense desktop chassis (square, flat, hard shadow).
   * `glass` is the mobile HUD plane (rounded, blurred, translucent).
   */
  variant?: 'terminal' | 'glass'
  /** 45deg corner cuts on opposing diagonals. */
  chamfered?: boolean
  brackets?: boolean
  /** Continuous horizontal scan sweep under the header rule. */
  scanline?: boolean
  className?: string
  bodyClassName?: string
}

const STATUS_TONE = {
  primary: 'text-primary-container',
  success: 'text-success',
  amber: 'text-secondary-container',
  outline: 'text-outline',
} as const

/**
 * The repeated tactical chassis. The Stitch export open-codes this header —
 * accent bar, title, module id, status, scan rule — about twenty times; every
 * panel in the app routes through here instead.
 */
export function Panel({
  children,
  title,
  moduleId,
  status,
  statusTone = 'success',
  pulse,
  variant = 'terminal',
  chamfered = false,
  brackets = false,
  scanline = false,
  className,
  bodyClassName,
}: PanelProps) {
  const isGlass = variant === 'glass'

  return (
    <div
      className={cn(
        'relative overflow-hidden',
        isGlass
          ? 'rounded-xl bg-surface-container-low/90 p-space-base shadow-lg backdrop-blur-xl'
          : 'bg-surface-container-lowest p-pad-sm shadow-xl',
        chamfered && 'chamfer',
        className,
      )}
    >
      {brackets && <CornerBrackets />}

      {(title || status) && (
        <div className={cn('relative z-10 mb-pad-xs flex items-center justify-between gap-pad-xs pb-pad-xs')}>
          <div className="flex min-w-0 items-center gap-pad-xs">
            {!isGlass && <span className="h-3 w-1 shrink-0 bg-primary-container" />}
            {pulse && <StatusDot tone={pulse} />}
            {title && (
              <span className="truncate font-headline-sm text-headline-sm text-primary uppercase tracking-wider">
                {title}
              </span>
            )}
            {moduleId && <span className="shrink-0 font-label-sm text-label-sm text-outline">{moduleId}</span>}
          </div>
          {status && (
            <span className={cn('shrink-0 font-label-sm text-label-sm', STATUS_TONE[statusTone])}>{status}</span>
          )}
        </div>
      )}

      {scanline && (
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px overflow-hidden" aria-hidden="true">
          <div className="h-px w-1/3 animate-scanline bg-gradient-to-r from-transparent via-primary-container to-transparent" />
        </div>
      )}

      <div className={cn('relative z-10', bodyClassName)}>{children}</div>
    </div>
  )
}
