import { Icon } from '../hud'
import { useBiometrics } from '../../data/hooks'

const CARD =
  'flex flex-col justify-between rounded-xl bg-surface-container-low/90 p-space-base shadow-md backdrop-blur-md'

function EcgTrace() {
  return (
    <div className="flex h-8 w-full items-center">
      <svg className="h-full w-full text-primary-container" viewBox="0 0 120 30" fill="none" aria-hidden="true">
        <path
          d="M0 15 L30 15 L35 5 L42 25 L48 8 L54 18 L60 15 L120 15"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

/** Resting range from the mockup; outside it the readout flags itself. */
function heartRateLabel(bpm: number): { text: string; className: string } {
  if (bpm > 100) return { text: 'ELEVADO', className: 'text-secondary-fixed' }
  if (bpm < 65) return { text: 'BAJO', className: 'text-tertiary-fixed-dim' }
  return { text: 'NORMAL', className: 'text-primary-fixed-dim' }
}

export function Biometrics() {
  const bio = useBiometrics()
  const hr = heartRateLabel(bio.heartRateBpm)

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="flex items-center justify-between gap-space-xs">
        <div className="flex items-center gap-space-xs">
          <Icon name="monitor_heart" size={16} className="text-primary-container" />
          <h2 className="font-headline-sm text-headline-sm text-primary uppercase tracking-wide">
            BIOMETRÍA: {bio.subject}
          </h2>
        </div>
        <span className="shrink-0 font-label-sm text-label-sm text-on-surface-variant uppercase">
          TELEMETRÍA EN VIVO
        </span>
      </div>

      <div className="grid grid-cols-2 gap-space-sm">
        <div className={CARD}>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">PULSO CARDÍACO</span>
            <Icon name="favorite" size={16} className="animate-pulse text-error" filled />
          </div>
          <div className="my-space-xs flex items-baseline gap-space-xs">
            <span className="font-headline-lg text-headline-lg font-bold text-primary">
              {Math.round(bio.heartRateBpm)}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">BPM</span>
            <span
              className={`ml-auto rounded bg-surface-container px-space-xs py-space-2xs font-label-sm text-label-sm ${hr.className}`}
            >
              {hr.text}
            </span>
          </div>
          <EcgTrace />
        </div>

        <div className={CARD}>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">PRESIÓN INTERNA</span>
            <Icon name="compress" size={16} className="text-primary-container" />
          </div>
          <div className="my-space-xs flex items-baseline gap-space-xs">
            <span className="font-headline-lg text-headline-lg font-bold text-primary">
              {bio.internalPressureAtm.toFixed(2)}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">ATM</span>
            <span className="ml-auto rounded bg-surface-container px-space-xs py-space-2xs font-label-sm text-label-sm text-primary-fixed-dim">
              ÓPTIMO
            </span>
          </div>
          <div className="mt-auto flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant">
            <span>CO2 AMBIENTAL</span>
            <span className="text-primary">{bio.co2Pct.toFixed(3)}%</span>
          </div>
        </div>

        <div className={CARD}>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">ADRENALINA SUERO</span>
            <Icon name="bloodtype" size={16} className="text-secondary-fixed" />
          </div>
          <div className="my-space-xs flex items-baseline gap-space-xs">
            <span className="font-headline-lg text-headline-lg font-bold text-secondary-fixed">
              {bio.adrenalineNgDl.toFixed(1)}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">ng/dL</span>
          </div>
          <span className="font-label-sm text-label-sm text-secondary-fixed-dim uppercase">
            {bio.adrenalineNgDl > 30 ? 'NIVEL COMBATE ALTO' : 'NIVEL COMBATE BASE'}
          </span>
        </div>

        <div className={CARD}>
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">CHASIS MK-85</span>
            <Icon name="security" size={16} className="text-primary-container" />
          </div>
          <div className="my-space-xs flex items-baseline gap-space-xs">
            <span className="font-headline-lg text-headline-lg font-bold text-primary-container">
              {Math.round(bio.chassisIntegrityPct)}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">%</span>
          </div>
          <span className="font-label-sm text-label-sm text-primary-fixed-dim uppercase">NANITOS DISPONIBLES</span>
        </div>
      </div>
    </div>
  )
}
