import { MeterBar, Panel } from '../hud'
import { useHardware } from '../../data/hooks'

export function HardwareTelem() {
  const hardware = useHardware()
  const storagePct = (hardware.storage.usedPb / hardware.storage.totalPb) * 100

  return (
    <Panel title="HARDWARE_TELEM" status="CRYO_STABLE" statusTone="success" scanline>
      <div className="flex flex-col gap-pad-xs">
        {hardware.gauges.map((gauge) => (
          <div key={gauge.id} className="bg-surface-container-low p-pad-xs">
            <div className="flex items-baseline justify-between font-label-sm text-label-sm">
              <span className="text-on-surface-variant">{gauge.label}</span>
              <span className="font-bold text-primary-container">
                {Math.round(gauge.pct)}% <span className="font-normal text-on-surface-variant">{gauge.annotation}</span>
              </span>
            </div>
            <MeterBar pct={gauge.pct} className="mt-1" label={gauge.label} />
            <div className="mt-1 flex justify-between font-label-sm text-label-sm text-outline">
              <span>{gauge.detailLeft}</span>
              <span>{gauge.detailRight}</span>
            </div>
          </div>
        ))}

        <div className="bg-surface-container-low p-pad-xs">
          <div className="flex items-baseline justify-between font-label-sm text-label-sm">
            <span className="text-on-surface-variant">Q-MESH // ZERO-LOSS NET</span>
            <span className="font-bold text-success">{hardware.mesh.throughputMbs.toFixed(1)} MB/s</span>
          </div>
          <div className="mt-1 flex items-center gap-pad-xs font-label-sm text-label-sm">
            <span className="text-outline">PING:</span>
            <span className="text-success">{hardware.mesh.pingMs.toFixed(2)}ms</span>
            <span className="text-outline">•</span>
            <span className="text-outline">PACKET DROPS:</span>
            <span className="text-success">{hardware.mesh.packetDropPct.toFixed(4)}%</span>
          </div>
        </div>

        <div className="bg-surface-container-low p-pad-xs">
          <div className="flex items-baseline justify-between font-label-sm text-label-sm">
            <span className="text-on-surface-variant">HOLO-CRYSTAL ARRAY</span>
            <span className="font-bold text-on-surface">
              {hardware.storage.usedPb.toFixed(1)} PB{' '}
              <span className="font-normal text-outline">/ {hardware.storage.totalPb} PB</span>
            </span>
          </div>
          <MeterBar pct={storagePct} tone="pale" className="mt-1" label="Almacenamiento holográfico" />
        </div>

        <div className="grid grid-cols-2 gap-pad-xs pt-pad-xs">
          <div className="bg-surface-container-low p-pad-xs">
            <span className="block font-label-sm text-label-sm text-outline">CHILLED LIQUID He</span>
            <span className="font-headline-md text-headline-md font-bold text-success">
              {hardware.coolant.kelvin.toFixed(1)} K
            </span>
            <span className="block font-label-sm text-label-sm text-on-surface-variant">
              {hardware.coolant.celsius.toFixed(2)} °C
            </span>
          </div>
          <div className="bg-surface-container-low p-pad-xs">
            <span className="block font-label-sm text-label-sm text-outline">ZERO FAILOVER</span>
            <span className="font-headline-md text-headline-md font-bold text-primary">{hardware.uptime.days}d</span>
            <span className="block font-label-sm text-label-sm text-on-surface-variant">{hardware.uptime.clock}</span>
          </div>
        </div>
      </div>
    </Panel>
  )
}
