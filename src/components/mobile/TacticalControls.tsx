import { useEffect, useRef, useState } from 'react'
import { Icon, MeterBar, StatusDot } from '../hud'
import { useDataSource, useTactical } from '../../data/hooks'
import { EnergyDistribution } from './EnergyDistribution'
import { cn } from '../../lib/cn'

const CARD = 'flex flex-col gap-space-sm rounded-xl bg-surface-container-low/90 p-space-base shadow-md backdrop-blur-md'

export function TacticalControls() {
  const tactical = useTactical()
  const source = useDataSource()
  const [discharged, setDischarged] = useState(false)
  const dischargeTimer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(dischargeTimer.current), [])

  function onDischarge() {
    setDischarged(true)
    clearTimeout(dischargeTimer.current)
    dischargeTimer.current = setTimeout(() => setDischarged(false), 1800)
  }

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex items-center justify-between gap-space-xs">
        <div className="flex items-center gap-space-xs">
          <Icon name="military_tech" size={16} className="text-secondary-fixed" />
          <h2 className="font-headline-sm text-headline-sm text-primary uppercase tracking-wide">
            CONTROLES TÁCTICOS RÁPIDOS
          </h2>
        </div>
        <span className="shrink-0 font-label-sm text-label-sm text-on-surface-variant">MK-85 AVIONICS</span>
      </div>

      <div className="flex flex-col gap-space-sm">
        {/* Repulsors */}
        <div className={CARD}>
          <div className="flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high text-primary-container">
                <Icon name="back_hand" size={18} />
              </div>
              <div className="flex flex-col">
                <span className="font-label-lg text-label-lg font-bold text-primary uppercase">
                  REPULSORES BI-MANUALES
                </span>
                <span className="font-label-sm text-label-sm text-primary-fixed-dim">
                  ESTADO: ARMADO // CALIBRE 100%
                </span>
              </div>
            </div>
            <span className="shrink-0 rounded bg-primary-container px-space-xs py-space-2xs font-label-sm text-label-sm font-bold text-on-primary uppercase">
              LISTO
            </span>
          </div>

          <div className="flex flex-col gap-space-2xs">
            <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant">
              <label htmlFor="repulsor-power">POTENCIA DE DESCARGA</label>
              <span className="font-bold text-primary-container">{tactical.repulsorPowerPct}%</span>
            </div>
            <input
              id="repulsor-power"
              type="range"
              min={0}
              max={100}
              value={tactical.repulsorPowerPct}
              onChange={(event) => source.setTactical?.({ repulsorPowerPct: Number(event.target.value) })}
              className="h-1.5 w-full cursor-pointer rounded-lg bg-surface-variant accent-primary-container"
            />
          </div>
        </div>

        {/* Unibeam */}
        <div className={CARD}>
          <div className="flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high text-secondary-fixed">
                <Icon name="flare" size={18} />
              </div>
              <div className="flex flex-col">
                <span className="font-label-lg text-label-lg font-bold text-primary uppercase">
                  UNIBEAM // HAZ TORÁCICO
                </span>
                <span className="font-label-sm text-label-sm text-secondary-fixed">
                  SOBRECARGA NÚCLEO PRE-DISPONIBLE
                </span>
              </div>
            </div>
            <span className="shrink-0 rounded bg-secondary-container px-space-xs py-space-2xs font-label-sm text-label-sm font-bold text-on-secondary uppercase">
              {Math.round(tactical.unibeamChargePct)}% CARGA
            </span>
          </div>

          <div className="flex items-center gap-space-sm">
            <MeterBar
              pct={tactical.unibeamChargePct}
              tone="amber"
              rounded
              height={8}
              label="Carga del unibeam"
              className="flex-1 bg-surface-variant"
            />
            <button
              type="button"
              onClick={onDischarge}
              className="shrink-0 rounded bg-secondary-container px-space-sm py-space-xs font-label-sm text-label-sm font-bold text-on-secondary uppercase shadow-sm transition-colors hover:bg-secondary-fixed active:scale-95"
            >
              {discharged ? '¡DESCARGADO!' : 'DESCARGA'}
            </button>
          </div>
        </div>

        {/* Shield */}
        <div className={CARD}>
          <div className="flex items-center justify-between gap-space-xs">
            <div className="flex items-center gap-space-sm">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high text-primary-container">
                <Icon name="shield" size={18} />
              </div>
              <div className="flex flex-col">
                <span className="font-label-lg text-label-lg font-bold text-primary uppercase">
                  ESCUDO NANOTECNOLÓGICO
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  MATRIZ DE GRAFENO IONIZADA
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-space-xs">
              <span className="font-label-sm text-label-sm font-bold text-primary">
                {Math.round(tactical.shieldIntegrityPct)}%
              </span>
              <StatusDot tone="primary" />
            </div>
          </div>

          <button
            type="button"
            onClick={() => source.setTactical?.({ shieldDeployed: !tactical.shieldDeployed })}
            aria-pressed={tactical.shieldDeployed}
            className={cn(
              'flex w-full items-center justify-center gap-space-xs rounded px-space-sm py-space-xs font-label-sm text-label-sm transition-colors',
              tactical.shieldDeployed
                ? 'bg-primary-container text-on-primary'
                : 'bg-surface-container text-primary hover:bg-surface-container-high',
            )}
          >
            <Icon
              name="security"
              size={16}
              className={tactical.shieldDeployed ? 'text-on-primary' : 'text-primary-container'}
            />
            <span className="uppercase tracking-wider">
              {tactical.shieldDeployed ? 'BARRERA DESPLEGADA' : 'DESPLIEGUE INSTANTÁNEO DE BARRERA'}
            </span>
          </button>
        </div>

        <EnergyDistribution />
      </div>
    </div>
  )
}
