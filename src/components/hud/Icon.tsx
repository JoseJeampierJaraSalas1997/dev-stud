import { cn } from '../../lib/cn'

interface IconProps {
  /** Material Symbols Outlined glyph name, e.g. "travel_explore". */
  name: string
  className?: string
  /** Pixel size; the font renders at its optical size. */
  size?: number
  filled?: boolean
}

export function Icon({ name, className, size = 16, filled = false }: IconProps) {
  return (
    <span
      aria-hidden="true"
      className={cn('material-symbols-outlined shrink-0 select-none leading-none', className)}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' 400, 'GRAD' 0, 'opsz' ${size}`,
      }}
    >
      {name}
    </span>
  )
}
