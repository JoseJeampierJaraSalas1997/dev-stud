import { cn } from '../../lib/cn'

/**
 * L-shaped registration marks on all four corners — the design system's
 * "corner brackets" motif, drawn with borders so they cost no extra elements
 * per corner beyond the four wrappers.
 */
export function CornerBrackets({ className }: { className?: string }) {
  const arm = 'pointer-events-none absolute h-4 w-4 border-primary-container/60'
  return (
    <div className={cn('pointer-events-none absolute inset-0', className)} aria-hidden="true">
      <span className={cn(arm, 'top-2 left-2 border-t-2 border-l-2')} />
      <span className={cn(arm, 'top-2 right-2 border-t-2 border-r-2')} />
      <span className={cn(arm, 'bottom-2 left-2 border-b-2 border-l-2')} />
      <span className={cn(arm, 'bottom-2 right-2 border-b-2 border-r-2')} />
    </div>
  )
}
