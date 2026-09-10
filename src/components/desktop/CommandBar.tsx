import { useState, type FormEvent, type KeyboardEvent } from 'react'
import { Icon, TacticalButton } from '../hud'
import { useCoreReadout, useDataSource, useSession } from '../../data/hooks'
import { cn } from '../../lib/cn'

export function CommandBar() {
  const session = useSession()
  const core = useCoreReadout()
  const source = useDataSource()
  const [command, setCommand] = useState('')
  const [killArmed, setKillArmed] = useState(false)

  const listening = core.state === 'LISTENING'

  function dispatch(event: FormEvent) {
    event.preventDefault()
    if (!command.trim()) return
    source.submitCommand?.(command)
    setCommand('')
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') setCommand('')
  }

  /**
   * A kill switch that fires on a single stray click is a hazard, so it arms
   * first and only halts autonomy on confirmation.
   */
  function onKillSwitch() {
    if (!killArmed) {
      setKillArmed(true)
      setTimeout(() => setKillArmed(false), 4000)
      return
    }
    source.setMode?.('SUPERVISED')
    setKillArmed(false)
  }

  return (
    <footer className="mt-pad-sm flex w-full flex-col gap-pad-xs bg-surface-container-lowest p-pad-sm shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-2 font-label-sm text-label-sm text-outline">
        <div className="flex items-center gap-pad-xs">
          <span className="font-bold tracking-widest text-primary">MULTI-MODAL INPUT BUS:</span>
          <span>VOICE (44.1kHz) // HAPTIC // NEURAL-LINK // DIRECT EXEC</span>
        </div>
        <div className="flex items-center gap-pad-sm">
          <span className="text-success">ENCRYPTION: {session.encryption}</span>
          <span className="text-on-surface-variant">SESSION: {session.sessionId}</span>
        </div>
      </div>

      <form onSubmit={dispatch} className="flex w-full flex-col items-center gap-pad-sm lg:flex-row">
        <button
          type="button"
          className="group flex w-full items-center justify-center gap-pad-sm bg-surface-container-low px-pad-sm py-pad-xs hover:bg-surface-container-high lg:w-auto"
        >
          <span className="relative flex items-center justify-center">
            {listening && (
              <span className="absolute h-6 w-6 animate-radar rounded-full bg-primary-container/30" />
            )}
            <span className="relative z-10 flex h-8 w-8 items-center justify-center bg-primary-container">
              <Icon name="mic" size={20} className="text-on-primary" />
            </span>
          </span>
          <span className="flex flex-col text-left">
            <span className="font-headline-sm text-headline-sm text-primary group-hover:text-primary-container">
              {core.state}
            </span>
            <span className="font-label-sm text-label-sm tracking-tight text-success">AUDIO FREQ 44.1kHz</span>
          </span>
        </button>

        <div className="relative flex w-full flex-1 items-center bg-surface-container-low px-pad-sm py-pad-xs">
          <label htmlFor="jharvis-command" className="mr-2 font-headline-sm text-headline-sm font-bold tracking-wider text-primary">
            EXEC::&gt;
          </label>
          <input
            id="jharvis-command"
            type="text"
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Talk to JHARVIS or enter command protocol..."
            className="w-full border-none bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline/70 focus:outline-none"
          />
          <div className="ml-2 flex shrink-0 items-center gap-1 font-label-sm text-label-sm text-outline">
            <span className="bg-surface-container-highest px-1.5 py-0.5">ESC: CLEAR</span>
            <span className="bg-surface-container-highest px-1.5 py-0.5">ENTER: EXEC</span>
          </div>
        </div>

        <div className="flex w-full items-center justify-end gap-pad-xs lg:w-auto">
          <TacticalButton variant="plate" className="gap-1">
            <Icon name="satellite_alt" size={16} />
            <span>VOX LINK</span>
          </TacticalButton>

          <TacticalButton type="submit" variant="primary" disabled={!command.trim()}>
            <Icon name="send" size={16} />
            <span>AGENT DISPATCH</span>
          </TacticalButton>

          <TacticalButton
            variant="critical"
            onClick={onKillSwitch}
            aria-live="polite"
            className={cn('font-bold', killArmed && 'animate-pulse bg-error-container text-on-error-container')}
          >
            {killArmed ? '[ CONFIRMAR ]' : '[ KILL-SWITCH ]'}
          </TacticalButton>
        </div>
      </form>
    </footer>
  )
}
