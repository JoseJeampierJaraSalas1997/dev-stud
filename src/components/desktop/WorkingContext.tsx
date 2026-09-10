import { useWorkingContext } from '../../data/hooks'

export function WorkingContextCard() {
  const context = useWorkingContext()

  return (
    <div className="mt-pad-sm pt-pad-xs">
      <div className="mb-1 flex items-center justify-between font-label-sm text-label-sm text-outline">
        <span>WORKING CONTEXT</span>
        <span className="font-bold text-primary">{context.activeTokens}</span>
      </div>
      <div className="flex flex-col gap-1 bg-surface-container-low p-pad-xs font-label-sm text-label-sm">
        <div className="flex justify-between text-on-surface-variant">
          <span>LONG TERM KG:</span>
          <span className="font-bold text-primary">{context.longTermKg}</span>
        </div>
        <div className="flex justify-between text-on-surface-variant">
          <span>TEMPORAL BIAS:</span>
          <span className="font-bold text-on-surface">{context.temporalBias}</span>
        </div>
      </div>
    </div>
  )
}
