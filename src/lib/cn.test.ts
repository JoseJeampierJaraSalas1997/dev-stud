import { describe, expect, it } from 'vitest'
import { cn } from './cn'

describe('cn', () => {
  it('keeps a design-system font size when a colour is merged in after it', () => {
    // The stock tailwind-merge config drops the size here; this is the exact
    // regression that rendered 9px labels at the inherited 13px.
    const result = cn('font-label-sm text-label-sm', 'text-primary')
    expect(result).toContain('text-label-sm')
    expect(result).toContain('text-primary')
  })

  it('still lets a later font size win over an earlier one', () => {
    const result = cn('text-label-sm', 'text-headline-lg')
    expect(result).toContain('text-headline-lg')
    expect(result).not.toContain('text-label-sm')
  })

  it('still lets a later colour win over an earlier one', () => {
    const result = cn('text-primary', 'text-error')
    expect(result).toContain('text-error')
    expect(result).not.toContain('text-primary')
  })

  it('keeps a font family alongside a font size', () => {
    const result = cn('font-label-lg text-label-lg')
    expect(result).toContain('font-label-lg')
    expect(result).toContain('text-label-lg')
  })

  it('drops falsy values and resolves ordinary conflicts', () => {
    expect(cn('p-2', false, undefined, 'p-4')).toBe('p-4')
  })
})
