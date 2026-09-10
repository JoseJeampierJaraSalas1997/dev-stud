import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MeterBar } from './MeterBar'
import { clampPct } from '../../lib/clampPct'

describe('clampPct', () => {
  it('passes through in-range values', () => {
    expect(clampPct(0)).toBe(0)
    expect(clampPct(42.5)).toBe(42.5)
    expect(clampPct(100)).toBe(100)
  })

  it('clamps out-of-range values so a bar cannot overflow its panel', () => {
    expect(clampPct(140)).toBe(100)
    expect(clampPct(-20)).toBe(0)
  })

  it('treats non-finite input as empty', () => {
    expect(clampPct(Number.NaN)).toBe(0)
    expect(clampPct(Number.POSITIVE_INFINITY)).toBe(100)
  })
})

describe('MeterBar', () => {
  it('exposes the clamped value to assistive tech', () => {
    render(<MeterBar pct={132} label="Carga" />)
    const meter = screen.getByRole('meter', { name: 'Carga' })
    expect(meter).toHaveAttribute('aria-valuenow', '100')
    expect(meter).toHaveAttribute('aria-valuemax', '100')
  })

  it('renders the fill at the clamped width', () => {
    const { container } = render(<MeterBar pct={-5} />)
    const fill = container.querySelector('[role="meter"] > div') as HTMLElement
    expect(fill.style.width).toBe('0%')
  })
})
