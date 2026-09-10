import { afterEach, describe, expect, it, vi } from 'vitest'
import { createMockSource, walk } from './mockSource'

afterEach(() => {
  vi.useRealTimers()
})

describe('walk', () => {
  it('never leaves the bounds, however many steps it takes', () => {
    let value = 50
    for (let i = 0; i < 5000; i += 1) {
      value = walk(value, { min: 10, max: 90, step: 25 })
      expect(value).toBeGreaterThanOrEqual(10)
      expect(value).toBeLessThanOrEqual(90)
    }
  })

  it('clamps a value that starts outside the range', () => {
    expect(walk(500, { min: 0, max: 100, step: 1 })).toBeLessThanOrEqual(100)
    expect(walk(-500, { min: 0, max: 100, step: 1 })).toBeGreaterThanOrEqual(0)
  })

  it('rounds to the requested precision', () => {
    const value = walk(50, { min: 0, max: 100, step: 5, precision: 0 })
    expect(Number.isInteger(value)).toBe(true)
  })

  it('returns 0 for a non-finite input rather than propagating NaN', () => {
    expect(walk(Number.NaN, { min: 0, max: 100, step: 1 })).toBe(0)
  })
})

describe('createMockSource', () => {
  it('notifies subscribers on each tick with a fresh snapshot object', () => {
    vi.useFakeTimers()
    const source = createMockSource({ intervalMs: 100 })
    const onChange = vi.fn()
    source.subscribe(onChange)

    const first = source.getSnapshot()
    vi.advanceTimersByTime(100)

    expect(onChange).toHaveBeenCalledTimes(1)
    // A new reference is what makes useSyncExternalStore re-render.
    expect(source.getSnapshot()).not.toBe(first)
    source.dispose()
  })

  it('stops notifying after unsubscribe', () => {
    vi.useFakeTimers()
    const source = createMockSource({ intervalMs: 100 })
    const onChange = vi.fn()
    const unsubscribe = source.subscribe(onChange)

    vi.advanceTimersByTime(100)
    unsubscribe()
    vi.advanceTimersByTime(300)

    expect(onChange).toHaveBeenCalledTimes(1)
    source.dispose()
  })

  it('keeps every live gauge inside 0..100 over a long run', () => {
    vi.useFakeTimers()
    const source = createMockSource({ intervalMs: 10 })
    vi.advanceTimersByTime(10_000)

    const snapshot = source.getSnapshot()
    for (const gauge of snapshot.hardware.gauges) {
      expect(gauge.pct).toBeGreaterThanOrEqual(0)
      expect(gauge.pct).toBeLessThanOrEqual(100)
    }
    expect(snapshot.session.sysLoadPct).toBeLessThanOrEqual(100)
    expect(snapshot.mission.completionPct).toBeLessThanOrEqual(100)
    expect(snapshot.core.confidencePct).toBeLessThanOrEqual(100)
    source.dispose()
  })

  it('appends the operator command and then a jharvis reply', () => {
    vi.useFakeTimers()
    const source = createMockSource({ autoStart: false })
    const before = source.getSnapshot().transcript.length

    source.submitCommand?.('Analiza la cartera de contratos')
    const afterCommand = source.getSnapshot()
    expect(afterCommand.transcript).toHaveLength(before + 1)
    expect(afterCommand.transcript.at(-1)?.speaker).toBe('user')
    expect(afterCommand.core.state).toBe('THINKING')

    vi.advanceTimersByTime(1000)
    const afterReply = source.getSnapshot()
    expect(afterReply.transcript.at(-1)?.speaker).toBe('jharvis')
    expect(afterReply.core.state).toBe('EXECUTING')
    source.dispose()
  })

  it('ignores a blank command', () => {
    const source = createMockSource({ autoStart: false })
    const before = source.getSnapshot().transcript.length
    source.submitCommand?.('   ')
    expect(source.getSnapshot().transcript).toHaveLength(before)
    source.dispose()
  })

  it('applies energy and tactical writes', () => {
    const source = createMockSource({ autoStart: false })
    source.setEnergy?.({ propulsion: 62 })
    source.setTactical?.({ shieldDeployed: true })

    expect(source.getSnapshot().energy.propulsion).toBe(62)
    expect(source.getSnapshot().tactical.shieldDeployed).toBe(true)
    source.dispose()
  })

  it('stops ticking once disposed', () => {
    vi.useFakeTimers()
    const source = createMockSource({ intervalMs: 50 })
    const onChange = vi.fn()
    source.subscribe(onChange)
    source.dispose()
    vi.advanceTimersByTime(500)
    expect(onChange).not.toHaveBeenCalled()
  })
})
