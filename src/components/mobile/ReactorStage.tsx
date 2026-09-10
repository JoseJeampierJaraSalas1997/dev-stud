import { CornerBrackets, Icon, MeterBar } from '../hud'
import { useThreeScene } from '../../three/useThreeScene'
import { buildArcReactor } from '../../three/arcReactor'
import { useReactor } from '../../data/hooks'
import type { MeterTone } from '../hud/MeterBar'

interface Tile {
  label: string
  value: string
  unit: string
  icon: string
  pct: number
  tone: MeterTone
  valueClass: string
  iconClass: string
}

function CompassRing() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-30">
      <svg className="h-72 w-72 animate-spin-slow" viewBox="0 0 288 288" aria-hidden="true">
        <circle cx="144" cy="144" r="138" fill="none" stroke="#00f0ff" strokeWidth="1" strokeDasharray="4 8" />
        <circle cx="144" cy="144" r="118" fill="none" stroke="#00f0ff" strokeOpacity="0.4" strokeWidth="1" />
        <text x="144" y="16" fill="#00f0ff" fontSize="8" fontFamily="monospace" textAnchor="middle">000° N</text>
        <text x="272" y="147" fill="#00f0ff" fontSize="8" fontFamily="monospace" textAnchor="middle">090° E</text>
        <text x="144" y="280" fill="#00f0ff" fontSize="8" fontFamily="monospace" textAnchor="middle">180° S</text>
        <text x="16" y="147" fill="#00f0ff" fontSize="8" fontFamily="monospace" textAnchor="middle">270° W</text>
      </svg>
    </div>
  )
}

export function ReactorStage() {
  const reactor = useReactor()
  const sceneRef = useThreeScene(buildArcReactor)

  const tiles: Tile[] = [
    {
      label: 'SALIDA POTENCIA',
      value: reactor.powerOutputGjs.toFixed(1),
      unit: 'GJ/s',
      icon: 'offline_bolt',
      pct: (reactor.powerOutputGjs / 10) * 100,
      tone: 'primary',
      valueClass: 'text-primary-container',
      iconClass: 'text-primary-container',
    },
    {
      label: 'EFICIENCIA COLECTOR',
      value: reactor.collectorEfficiencyPct.toFixed(2),
      unit: '%',
      icon: 'speed',
      pct: reactor.collectorEfficiencyPct,
      tone: 'cyan-dim',
      valueClass: 'text-primary',
      iconClass: 'text-primary-fixed-dim',
    },
    {
      label: 'TEMP. DEL NÚCLEO',
      value: Math.round(reactor.coreTempK).toLocaleString('es-ES'),
      unit: 'K',
      icon: 'device_thermostat',
      pct: (reactor.coreTempK / 7500) * 100,
      tone: 'amber',
      valueClass: 'text-secondary-fixed',
      iconClass: 'text-secondary-fixed',
    },
    {
      label: 'FLUJO MAGNÉTICO',
      value: reactor.magneticFluxTesla.toFixed(1),
      unit: 'Tesla',
      icon: 'all_inclusive',
      pct: (reactor.magneticFluxTesla / 15.5) * 100,
      tone: 'primary',
      valueClass: 'text-primary-container',
      iconClass: 'text-primary-container',
    },
  ]

  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-surface-container-lowest/90 p-space-base shadow-xl backdrop-blur-xl">
      <CornerBrackets />

      <div className="relative z-20 mb-space-xs flex items-center justify-between gap-space-xs">
        <div className="flex items-center gap-space-xs">
          <Icon name="cyclone" size={16} className="text-primary-container" />
          <span className="font-label-sm text-label-sm text-primary uppercase tracking-widest">
            VISTA HOLOGRÁFICA // MK-85
          </span>
        </div>
        <span className="rounded bg-primary-container px-space-xs py-space-2xs font-label-sm text-label-sm font-bold text-on-primary uppercase">
          {reactor.markLabel}
        </span>
      </div>

      <div className="relative my-space-xs flex w-full items-center justify-center">
        <CompassRing />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex h-60 w-60 animate-pulse items-center justify-center rounded-full bg-primary-container/5">
            <div className="h-48 w-48 rounded-full shadow-[inset_0_0_20px_rgba(0,240,255,0.2)]" />
          </div>
        </div>

        <div ref={sceneRef} className="relative z-10 h-[280px] w-full" />
      </div>

      <div className="relative z-20 mt-space-sm grid grid-cols-2 gap-space-xs">
        {tiles.map((tile) => (
          <div
            key={tile.label}
            className="flex flex-col justify-between rounded-lg bg-surface-container/85 p-space-sm"
          >
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-sm text-label-sm uppercase">{tile.label}</span>
              <Icon name={tile.icon} size={14} className={tile.iconClass} />
            </div>
            <div className="mt-space-2xs flex items-baseline gap-space-2xs">
              <span className={`font-headline-sm text-headline-sm font-bold tracking-tight ${tile.valueClass}`}>
                {tile.value}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{tile.unit}</span>
            </div>
            <MeterBar
              pct={tile.pct}
              tone={tile.tone}
              rounded
              height={4}
              label={tile.label}
              className="mt-space-xs bg-surface-variant"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
