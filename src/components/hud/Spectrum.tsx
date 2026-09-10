import { cn } from '../../lib/cn'

interface SpectrumProps {
  /** Normalised 0..1 bars. */
  bars: number[]
  className?: string
  /** Track height in px; bars scale inside it. */
  height?: number
  rounded?: boolean
  /** Bars at or above this level switch to the amber accent. */
  accentAbove?: number
}

/**
 * Live audio/synth spectrum. Heights come from the feed rather than from
 * `animate-pulse`, so the bars move with the data instead of on a CSS timer.
 */
export function Spectrum({ bars, className, height = 16, rounded = false, accentAbove = 0.85 }: SpectrumProps) {
  return (
    <div
      className={cn('flex items-end justify-between gap-[2px] overflow-hidden', className)}
      style={{ height: `${height}px` }}
      aria-hidden="true"
    >
      {bars.map((bar, index) => {
        const clamped = Math.min(1, Math.max(0.08, bar))
        return (
          <div
            key={index}
            className={cn(
              'w-1 shrink-0 transition-[height] duration-200 ease-out',
              clamped >= accentAbove ? 'bg-secondary-fixed-dim' : 'bg-primary-container',
              rounded && 'rounded-full',
            )}
            style={{ height: `${clamped * 100}%` }}
          />
        )
      })}
    </div>
  )
}
