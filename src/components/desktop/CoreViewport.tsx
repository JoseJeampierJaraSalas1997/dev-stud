import { useThreeScene } from '../../three/useThreeScene'
import { buildJharvisCore } from '../../three/jharvisCore'
import { useCoreReadout } from '../../data/hooks'
import { StatusDot } from '../hud'

/** Fixed compass ticks and bearings that frame the 3D core. */
function CompassDial() {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-25">
      <svg className="h-72 w-72 text-primary" viewBox="0 0 200 200" fill="none" aria-hidden="true">
        <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 4" />
        <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="100" cy="100" r="50" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 8" />
        <line x1="100" x2="100" y1="5" y2="25" stroke="currentColor" strokeWidth="1" />
        <line x1="100" x2="100" y1="175" y2="195" stroke="currentColor" strokeWidth="1" />
        <line x1="5" x2="25" y1="100" y2="100" stroke="currentColor" strokeWidth="1" />
        <line x1="175" x2="195" y1="100" y2="100" stroke="currentColor" strokeWidth="1" />
        <text x="104" y="22" fill="currentColor" fontSize="6" fontFamily="JetBrains Mono">000°</text>
        <text x="176" y="96" fill="currentColor" fontSize="6" fontFamily="JetBrains Mono">090°</text>
        <text x="104" y="190" fill="currentColor" fontSize="6" fontFamily="JetBrains Mono">180°</text>
        <text x="12" y="96" fill="currentColor" fontSize="6" fontFamily="JetBrains Mono">270°</text>
      </svg>
    </div>
  )
}

export function CoreViewport() {
  const core = useCoreReadout()
  const sceneRef = useThreeScene(buildJharvisCore)

  return (
    <div className="relative h-[460px] w-full overflow-hidden bg-surface-container-lowest p-pad-sm shadow-xl">
      <div ref={sceneRef} className="absolute inset-0 h-full w-full" />
      <CompassDial />

      <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-pad-sm">
        <div className="z-10 flex items-start justify-between">
          <div className="flex items-center gap-pad-xs bg-surface-container-low/80 px-pad-sm py-pad-xs backdrop-blur">
            <StatusDot tone="success" />
            <span className="font-label-sm text-label-sm font-bold tracking-widest text-success">
              [STATE: {core.state} // ACTIVE]
            </span>
          </div>
          <div className="flex flex-col items-end bg-surface-container-low/80 px-pad-sm py-pad-xs text-right font-label-sm text-label-sm backdrop-blur">
            <span className="font-bold text-primary-container">
              AZIMUTH: {core.azimuthDeg.toFixed(2)}° // POLAR: {core.polarDeg >= 0 ? '+' : ''}
              {core.polarDeg.toFixed(2)}°
            </span>
            <span className="text-outline">NEURAL RES: {core.neuralRes}</span>
          </div>
        </div>

        <div className="z-10 flex items-end justify-between">
          <div className="bg-surface-container-low/80 px-pad-sm py-pad-xs font-label-sm text-label-sm backdrop-blur">
            <span className="text-outline">AUDIO HARMONICS:</span>
            <span className="ml-1 text-primary">{core.synthesizer}</span>
          </div>
          <div className="bg-surface-container-low/80 px-pad-sm py-pad-xs font-label-sm text-label-sm backdrop-blur">
            <span className="text-tertiary">CONFIDENCE METRIC: {core.confidencePct.toFixed(2)}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
