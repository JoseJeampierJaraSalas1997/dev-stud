import { useEffect, useRef, useState } from 'react'
import { Icon, Spectrum } from '../hud'
import { useCoreReadout, useTranscript } from '../../data/hooks'
import { cn } from '../../lib/cn'

/** Twenty-one bars, as the mockup draws, driven by the live spectrum feed. */
function widenSpectrum(bars: number[], size = 21): number[] {
  if (bars.length === 0) return Array.from({ length: size }, () => 0.2)
  return Array.from({ length: size }, (_, index) => bars[index % bars.length])
}

export function VoiceModule() {
  const core = useCoreReadout()
  const transcript = useTranscript()
  const [listening, setListening] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const latest = transcript.at(-1)

  useEffect(() => () => clearTimeout(timeoutRef.current), [])

  function onTransmit() {
    setListening(true)
    clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setListening(false), 2400)
  }

  return (
    <div className="flex flex-col gap-space-md rounded-xl bg-surface-container-low/90 p-space-base shadow-lg backdrop-blur-xl">
      <div className="flex items-center justify-between gap-space-xs">
        <div className="flex items-center gap-space-xs">
          <Icon name="graphic_eq" size={18} className="text-primary-container" />
          <span className="font-label-sm text-label-sm font-bold text-primary uppercase tracking-wider">
            MÓDULO DE INTERFAZ VOCAL // JARVIS
          </span>
        </div>
        <span className="shrink-0 rounded bg-secondary-container/20 px-space-xs py-space-2xs font-label-sm text-label-sm text-secondary-fixed">
          AUDIO CANAL 1A
        </span>
      </div>

      <Spectrum
        bars={widenSpectrum(core.spectrum)}
        height={40}
        rounded
        className="rounded-lg bg-surface-container-lowest/80 px-space-md"
      />

      <div className="flex items-start gap-space-sm rounded-lg bg-surface-container/70 p-space-sm">
        <Icon name="smart_toy" size={20} className="mt-0.5 text-primary-container" />
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm text-primary-fixed-dim uppercase tracking-wider">
            TRANSCRIPCIÓN VIVA
          </span>
          <p className="mt-space-2xs font-body-md text-body-md leading-snug text-on-surface italic">
            “{latest?.text ?? 'Buenos días, Sr. Stark. Sistemas defensivos al 100%.'}”
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onTransmit}
        aria-live="polite"
        className={cn(
          'flex w-full items-center justify-center gap-space-sm rounded-lg px-space-base py-space-sm font-label-lg text-label-lg shadow-md shadow-primary-container/20 transition-colors duration-200 active:scale-[0.98]',
          listening
            ? 'bg-primary-container text-on-primary'
            : 'bg-primary-container/15 text-primary-container hover:bg-primary-container hover:text-on-primary',
        )}
      >
        <Icon name={listening ? 'sync' : 'mic'} size={18} className={listening ? 'animate-spin' : undefined} />
        <span className="font-bold whitespace-nowrap uppercase tracking-wider">
          {listening ? 'ESCUCHANDO...' : 'ORDEN POR VOZ // TRANSMITIR'}
        </span>
      </button>
    </div>
  )
}
