/**
 * Percentages arrive from a live feed, so they get clamped rather than trusted.
 * A gauge that renders 140% wide breaks the panel it sits in. NaN reads as
 * "unknown" and renders empty; infinities saturate.
 */
export function clampPct(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(100, Math.max(0, value))
}
