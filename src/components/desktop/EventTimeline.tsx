import { useTimeline } from '../../data/hooks'

export function EventTimeline() {
  const timeline = useTimeline()

  return (
    <div className="mt-pad-sm pt-pad-xs">
      <span className="mb-1 block font-headline-sm text-headline-sm text-primary uppercase">EVENT_TIMELINE</span>
      <div className="flex flex-col gap-1 font-label-sm text-label-sm">
        {timeline.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between gap-2 bg-surface-container-low px-1.5 py-0.5 text-on-surface-variant"
          >
            <span className={event.active ? 'text-success' : 'text-primary'}>{event.time}</span>
            <span className="truncate text-right">{event.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
