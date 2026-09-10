import { useState } from 'react'
import { Icon } from '../hud'
import { cn } from '../../lib/cn'

const TABS = [
  { id: 'reactor', label: 'REACTOR', icon: 'emergency' },
  { id: 'armor', label: 'ARMOR', icon: 'accessibility_new' },
  { id: 'diagnostics', label: 'DIAGNOSTICS', icon: 'vital_signs' },
  { id: 'protocol', label: 'PROTOCOL', icon: 'layers' },
] as const

/**
 * Only the Reactor tab has a design. The others stay selectable so the bar
 * behaves like the mockup without inventing screens.
 */
export function TabBar() {
  const [active, setActive] = useState<string>(TABS[0].id)

  return (
    <nav className="fixed bottom-0 z-50 w-full bg-surface-container-lowest/90 pb-safe shadow-[0_-1px_16px_rgba(0,240,255,0.06)] backdrop-blur-xl">
      <div className="flex h-20 items-center justify-around px-space-xs">
        {TABS.map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex h-14 min-h-[44px] min-w-[70px] flex-col items-center justify-center gap-space-2xs rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-container/10 text-primary-container'
                  : 'text-on-surface-variant hover:text-primary',
              )}
            >
              <Icon name={tab.icon} size={20} />
              <span className="font-label-sm text-label-sm uppercase tracking-wider">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
