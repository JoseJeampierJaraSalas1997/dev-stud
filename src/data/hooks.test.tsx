import { describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import { JharvisProvider } from './provider'
import { useHardware, useLinkStatus, useSession } from './hooks'
import { createMockSource } from './mock/mockSource'
import type { DataSource, JharvisSnapshot } from './types'
import { seed } from './mock/seed'

function Probe() {
  const session = useSession()
  const hardware = useHardware()
  const status = useLinkStatus()
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="load">{session.sysLoadPct}</span>
      <span data-testid="gauge">{hardware.gauges[0].pct}</span>
    </div>
  )
}

/** Minimal hand-driven source, so a test can publish exact frames. */
function createStubSource(initial: JharvisSnapshot) {
  let snapshot = initial
  const listeners = new Set<() => void>()
  const source: DataSource = {
    name: 'stub',
    getSnapshot: () => snapshot,
    subscribe(onChange) {
      listeners.add(onChange)
      return () => listeners.delete(onChange)
    },
    dispose() {
      listeners.clear()
    },
  }
  return {
    source,
    publish(next: JharvisSnapshot) {
      snapshot = next
      for (const listener of listeners) listener()
    },
  }
}

describe('JharvisProvider + hooks', () => {
  it('renders the current snapshot', () => {
    const source = createMockSource({ autoStart: false })
    render(
      <JharvisProvider source={source}>
        <Probe />
      </JharvisProvider>,
    )

    expect(screen.getByTestId('status')).toHaveTextContent('live')
    expect(screen.getByTestId('load')).toHaveTextContent(String(seed.session.sysLoadPct))
    source.dispose()
  })

  it('re-renders when the source publishes a new frame', () => {
    const { source, publish } = createStubSource(structuredClone(seed))
    render(
      <JharvisProvider source={source}>
        <Probe />
      </JharvisProvider>,
    )

    const next = structuredClone(seed)
    next.session.sysLoadPct = 77.7
    next.hardware.gauges[0].pct = 12

    act(() => publish(next))

    expect(screen.getByTestId('load')).toHaveTextContent('77.7')
    expect(screen.getByTestId('gauge')).toHaveTextContent('12')
  })

  it('surfaces a degraded link so the HUD can show it', () => {
    const { source, publish } = createStubSource(structuredClone(seed))
    render(
      <JharvisProvider source={source}>
        <Probe />
      </JharvisProvider>,
    )

    act(() => publish({ ...structuredClone(seed), status: 'error' }))
    expect(screen.getByTestId('status')).toHaveTextContent('error')
  })

  it('does not dispose an injected source it does not own', () => {
    const source = createMockSource({ autoStart: false })
    const dispose = vi.spyOn(source, 'dispose')
    const { unmount } = render(
      <JharvisProvider source={source}>
        <Probe />
      </JharvisProvider>,
    )
    unmount()
    expect(dispose).not.toHaveBeenCalled()
    source.dispose()
  })
})
