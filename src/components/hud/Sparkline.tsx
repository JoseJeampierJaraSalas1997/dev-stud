import { useId } from 'react'
import { cn } from '../../lib/cn'

interface SparklineProps {
  /** Normalised 0..1 samples, oldest first. */
  samples: number[]
  className?: string
  /** Highlight the peaks with marker dots, as the mockup does. */
  markers?: boolean
}

const WIDTH = 240
const HEIGHT = 60
const PADDING = 12

/**
 * The THREAD_MAP topology graph: a dot lattice with a polyline over it.
 * Points are laid out from the sample count so the feed can change length.
 */
export function Sparkline({ samples, className, markers = true }: SparklineProps) {
  const patternId = useId()

  if (samples.length === 0) return <svg className={className} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} />

  const span = WIDTH - PADDING * 2
  const step = samples.length > 1 ? span / (samples.length - 1) : 0

  const points = samples.map((sample, index) => {
    const clamped = Math.min(1, Math.max(0, sample))
    return {
      x: PADDING + index * step,
      // SVG y grows downward, so invert the normalised sample.
      y: PADDING + (1 - clamped) * (HEIGHT - PADDING * 2),
      value: clamped,
    }
  })

  const path = points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ')
  const peak = points.reduce((best, point) => (point.value > best.value ? point : best), points[0])

  return (
    <svg
      className={cn('w-full text-primary-container', className)}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      <pattern id={patternId} x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1" fill="#3b494b" />
      </pattern>
      <rect width={WIDTH} height={HEIGHT} fill={`url(#${patternId})`} />
      <path d={path} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      {markers &&
        points
          .filter((point) => point === peak || point.value > 0.65)
          .map((point) => (
            <circle
              key={`${point.x}-${point.y}`}
              cx={point.x}
              cy={point.y}
              r="3"
              className={point === peak ? 'fill-primary' : 'fill-success'}
            />
          ))}
    </svg>
  )
}
