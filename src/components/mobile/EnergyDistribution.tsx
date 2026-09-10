import { Icon } from '../hud'
import { useDataSource, useEnergy } from '../../data/hooks'
import { cn } from '../../lib/cn'

/** Bounds come from the mockup's sliders, which are deliberately not 0..100. */
const CHANNELS = [
  {
    key: 'propulsion',
    label: 'Propulsión de Vuelo',
    min: 10,
    max: 80,
    valueClass: 'text-primary-container',
    accent: 'accent-primary-container',
  },
  {
    key: 'armament',
    label: 'Sistemas de Armamento',
    min: 10,
    max: 80,
    valueClass: 'text-secondary-fixed',
    accent: 'accent-secondary-fixed',
  },
  {
    key: 'lifeSupport',
    label: 'Soporte Vital y Presurización',
    min: 10,
    max: 50,
    valueClass: 'text-primary',
    accent: 'accent-primary',
  },
] as const

export function EnergyDistribution() {
  const energy = useEnergy()
  const source = useDataSource()

  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-low/90 p-space-base shadow-md backdrop-blur-md">
      <div className="flex items-center justify-between gap-space-xs">
        <div className="flex items-center gap-space-xs">
          <Icon name="tune" size={16} className="text-primary-container" />
          <span className="font-label-lg text-label-lg font-bold text-primary uppercase">
            DISTRIBUCIÓN ENERGÉTICA
          </span>
        </div>
        <span className="shrink-0 font-label-sm text-label-sm text-on-surface-variant">MODO: {energy.mode}</span>
      </div>

      <div className="flex flex-col gap-space-sm">
        {CHANNELS.map((channel) => (
          <div key={channel.key} className="flex flex-col gap-space-2xs">
            <div className="flex justify-between gap-space-xs font-label-sm text-label-sm">
              <label htmlFor={`energy-${channel.key}`} className="text-on-surface-variant uppercase">
                {channel.label}
              </label>
              <span className={channel.valueClass}>{energy[channel.key]}%</span>
            </div>
            <input
              id={`energy-${channel.key}`}
              type="range"
              min={channel.min}
              max={channel.max}
              value={energy[channel.key]}
              onChange={(event) => source.setEnergy?.({ [channel.key]: Number(event.target.value) })}
              className={cn('h-1.5 w-full cursor-pointer rounded-lg bg-surface-variant', channel.accent)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
