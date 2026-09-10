import { cn } from '../../lib/cn'

/**
 * Placeholder while a WebGL scene chunk loads. It reads as part of the HUD —
 * a booting viewport — rather than as a missing element.
 */
export function SceneFallback({ className, label = 'INICIALIZANDO NÚCLEO HOLOGRÁFICO' }: { className?: string; label?: string }) {
  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden bg-surface-container-lowest', className)}>
      <div className="pointer-events-none absolute inset-x-0 top-1/2 h-px overflow-hidden">
        <div className="h-px w-1/3 animate-scanline bg-gradient-to-r from-transparent via-primary-container to-transparent" />
      </div>
      <div className="flex flex-col items-center gap-space-sm">
        <div className="h-16 w-16 animate-pulse rounded-full border border-primary-container/40 shadow-[inset_0_0_20px_rgba(0,240,255,0.25)]" />
        <span className="font-label-sm text-label-sm tracking-widest text-outline uppercase">{label}</span>
      </div>
    </div>
  )
}
