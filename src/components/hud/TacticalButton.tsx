import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type Variant = 'ghost' | 'primary' | 'critical' | 'plate'

const VARIANT: Record<Variant, string> = {
  // Ghost cyan plate that fills on hover with an arc flare.
  ghost:
    'border border-primary-container bg-primary-container/10 text-primary-container hover:bg-primary-container hover:text-on-primary hover:shadow-[0_0_16px_rgba(0,240,255,0.6)]',
  primary: 'bg-primary-container text-on-primary font-bold hover:bg-primary',
  // Amber frame with the diagonal danger hatch from the design system.
  critical:
    'border border-secondary-container text-error bg-error-container/20 hover:bg-error-container hover:text-on-error-container',
  plate: 'bg-surface-container-low text-primary hover:bg-surface-container-high',
}

interface TacticalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: Variant
  /** Chamfer the top-right corner and add reticle markers. */
  cutout?: boolean
}

export function TacticalButton({
  children,
  variant = 'plate',
  cutout = false,
  className,
  type = 'button',
  ...rest
}: TacticalButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-1 px-pad-md py-pad-xs font-headline-sm text-headline-sm uppercase tracking-wider transition-colors duration-100',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container',
        'disabled:cursor-not-allowed disabled:opacity-40',
        VARIANT[variant],
        cutout && 'chamfer-sm',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
