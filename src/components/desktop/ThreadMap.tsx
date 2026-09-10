import { Panel, Sparkline } from '../hud'
import { useThreadMap } from '../../data/hooks'

export function ThreadMap() {
  const threads = useThreadMap()

  return (
    <Panel title="THREAD_MAP" status={threads.bank} statusTone="outline" className="flex flex-1 flex-col">
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="mb-pad-xs bg-surface-container-low p-pad-xs">
            <div className="mb-1 flex justify-between font-label-sm text-label-sm text-outline">
              <span>QUANTUM TOPOLOGY</span>
              <span>{threads.topology}</span>
            </div>
            <Sparkline samples={threads.samples} className="h-16" />
          </div>

          <div className="flex flex-col gap-1 font-label-sm text-label-sm">
            {threads.clusters.map((cluster) => (
              <div
                key={cluster.id}
                className="flex justify-between bg-surface-container-low px-2 py-1 text-on-surface-variant"
              >
                <span>{cluster.label}</span>
                <span className={cluster.online ? 'text-success' : 'text-error'}>
                  {cluster.online ? `ONLINE // ${cluster.latencyMs.toFixed(2)}ms` : 'OFFLINE'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-pad-xs flex items-center justify-between pt-pad-sm font-label-sm text-label-sm">
          <span className="text-outline">SYS_DIGEST: {threads.digest}</span>
          <span className="font-bold text-primary uppercase tracking-widest">{threads.policy}</span>
        </div>
      </div>
    </Panel>
  )
}
