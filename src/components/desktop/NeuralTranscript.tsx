import { useEffect, useRef } from 'react'
import { Panel, StatusDot } from '../hud'
import { useCoreReadout, useTranscript } from '../../data/hooks'

export function NeuralTranscript() {
  const transcript = useTranscript()
  const core = useCoreReadout()
  const scrollRef = useRef<HTMLDivElement>(null)

  // A live log is only useful pinned to its newest entry.
  useEffect(() => {
    const node = scrollRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [transcript])

  return (
    <Panel
      title="NEURAL_TRANSCRIPT"
      moduleId="[STREAM_CHANNEL_01]"
      status="LIVE_BUFFER // 256 BITS"
      statusTone="success"
      className="flex flex-1 flex-col"
      bodyClassName="flex flex-1 flex-col justify-between"
    >
      <div ref={scrollRef} className="flex max-h-64 flex-col gap-pad-xs overflow-y-auto font-body-sm text-body-sm">
        {transcript.map((entry) => {
          const isUser = entry.speaker === 'user'
          return (
            <div
              key={entry.id}
              className={`flex flex-col gap-0.5 p-pad-xs ${isUser ? 'bg-surface-container-low' : 'bg-surface-container-high'}`}
            >
              <div
                className={`flex items-center justify-between font-label-sm text-label-sm ${isUser ? 'text-tertiary' : 'text-primary-container'}`}
              >
                <span className="font-bold">
                  {isUser ? 'USER' : 'JHARVIS'} // {entry.channel} [CHRONO: {entry.chrono}]
                </span>
                <span className={isUser ? '' : 'text-success'}>{entry.status}</span>
              </div>
              <p className={`pl-2 font-body-md text-body-md ${isUser ? 'text-on-surface' : 'text-primary'}`}>
                “{entry.text}”
              </p>
              {entry.facts && (
                <div className="flex flex-wrap items-center gap-pad-md pt-1 pl-2 font-label-sm text-label-sm text-outline">
                  {entry.facts.map((fact) => (
                    <span key={fact}>{fact}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-pad-xs flex items-center justify-between pt-pad-xs font-label-sm text-label-sm text-outline">
        <span className="flex items-center gap-1">
          <StatusDot tone="success" square ping={false} />
          AUDIO TRANSCRIPTION CONFIDENCE: {core.confidencePct.toFixed(2)}%
        </span>
        <span>LEXICAL BUFFER STABLE</span>
      </div>
    </Panel>
  )
}
